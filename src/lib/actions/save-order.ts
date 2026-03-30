"use server"

import { db } from "@/db"
import { addresses, orders, products } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"
import { generateId } from "@/lib/id"
import { stripe } from "@/lib/stripe"
import { resend } from "@/lib/resend"
import { env } from "@/env.js"
import OrderConfirmationEmail from "@/components/emails/order-confirmation-email"
import AdminOrderNotificationEmail from "@/components/emails/admin-order-notification-email"
import { createClient } from "@/lib/supabase/server"

/**
 * saveOrder - Direct, simple order save. No complex logic, no early returns.
 * Called from the success page once isVerified is true.
 * This is the ONLY place orders are created.
 */
export async function saveOrder(paymentIntentId: string): Promise<{ orderId: string | null; error: string | null }> {
  try {
    // 1. Check if order already exists (idempotency guard)
    const existing = await db.query.orders.findFirst({
      where: eq(orders.stripePaymentIntentId, paymentIntentId),
      columns: { id: true },
    })

    if (existing) {
      console.log("✅ saveOrder: Order already exists:", existing.id)
      return { orderId: existing.id, error: null }
    }

    // 2. Fetch the payment intent directly from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return { orderId: null, error: `Payment not succeeded. Status: ${paymentIntent.status}` }
    }

    // 3. Get the store and fees
    const store = await db.query.stores.findFirst({
      columns: {
        id: true,
        processingFeePercent: true,
        processingFeeFixed: true,
      },
    })

    if (!store) {
      return { orderId: null, error: "Store not found" }
    }

    const totalAmount = paymentIntent.amount / 100
    const feePercent = Number(store.processingFeePercent ?? 2.9) / 100
    const feeFixed = Number(store.processingFeeFixed ?? 30) / 100

    const stripeFee = totalAmount * feePercent + feeFixed
    const netAmount = totalAmount - stripeFee

    // Fetch Profile Phone from Supabase Auth
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const profilePhone = user?.user_metadata?.phone || user?.phone || null
    const finalPhone = profilePhone || paymentIntent.shipping?.phone || null

    // 4. Create address record
    const addr = paymentIntent.shipping?.address
    const [newAddress] = await db.insert(addresses).values({
      line1: addr?.line1 ?? "",
      line2: addr?.line2 ?? null,
      city: addr?.city ?? "",
      state: addr?.state ?? "",
      country: addr?.country ?? "",
      postalCode: addr?.postal_code ?? "",
      phone: finalPhone,
    }).returning({ id: addresses.id })

    if (!newAddress?.id) {
      return { orderId: null, error: "Failed to create address" }
    }

    // 5. Parse items from metadata
    let parsedItems: unknown[] = []
    try {
      parsedItems = JSON.parse(paymentIntent.metadata?.items ?? "[]") as unknown[]
    } catch {
      parsedItems = []
    }

    const quantity = parsedItems.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0)

    // 6. Insert order - direct, no frills
    const [newOrder] = await db.insert(orders).values({
      id: generateId("order"),
      storeId: store.id,
      items: parsedItems as any,
      quantity,
      amount: totalAmount.toFixed(2),
      stripeFee: stripeFee.toFixed(2),
      netAmount: netAmount.toFixed(2),
      stripePaymentIntentId: paymentIntentId,
      stripePaymentIntentStatus: "succeeded",
      name: paymentIntent.shipping?.name ?? paymentIntent.receipt_email ?? "Customer",
      email: paymentIntent.receipt_email ?? "",
      addressId: newAddress.id,
    }).returning({ id: orders.id })

    if (!newOrder?.id) {
      return { orderId: null, error: "Failed to create order" }
    }

    console.log("✅ saveOrder: NEW Order saved to Supabase:", newOrder.id)

    // 7. Send Order Confirmation Email
    try {
      const productIds = (parsedItems as any[]).map(item => item.id).filter(Boolean);
      
      const productDetails = productIds.length > 0 
        ? await db.select({
            id: products.id,
            name: products.name,
          }).from(products)
          .where(inArray(products.id, productIds))
        : [];

      const emailItems = (parsedItems as any[]).map(item => {
        const detail = productDetails.find(d => d.id === item.id);
        return {
          name: detail?.name ?? "Product",
          quantity: item.qty ?? item.quantity ?? 1,
          price: (paymentIntent.amount / 100 / quantity).toFixed(2), // Rough estimate per item
        }
      });

      await resend.emails.send({
        from: env.EMAIL_NOREPLY_ADDRESS,
        to: paymentIntent.receipt_email ?? "",
        subject: `Order Confirmation - ${newOrder.id}`,
        react: OrderConfirmationEmail({
          orderId: newOrder.id,
          customerName: paymentIntent.shipping?.name ?? "Customer",
          totalAmount: (paymentIntent.amount / 100).toFixed(2),
          items: emailItems,
        }),
      });
      console.log("📧 saveOrder: Confirmation email sent to:", paymentIntent.receipt_email)

      // 8. Send Admin Notification Email
      const adminEmail = env.ADMIN_EMAIL ?? env.EMAIL_FROM_ADDRESS;
      const addr = paymentIntent.shipping?.address;
      
      await resend.emails.send({
        from: env.EMAIL_NOREPLY_ADDRESS,
        to: adminEmail,
        subject: `🚨 New Order: ${newOrder.id} - ${paymentIntent.shipping?.name}`,
        react: AdminOrderNotificationEmail({
          orderId: newOrder.id,
          customerName: paymentIntent.shipping?.name ?? "Customer",
          customerEmail: paymentIntent.receipt_email ?? "N/A",
          totalAmount: (paymentIntent.amount / 100).toFixed(2),
          time: new Date().toLocaleString(),
          deliveryAddress: {
             line1: addr?.line1 ?? "N/A",
             line2: addr?.line2,
             city: addr?.city ?? "N/A",
             state: addr?.state ?? "N/A",
             country: addr?.country ?? "N/A",
             postalCode: addr?.postal_code ?? "N/A",
             phone: finalPhone,
          },
          items: emailItems,
        }),
      });
      console.log("📧 saveOrder: Admin notification sent to:", adminEmail)
    } catch (emailErr) {
      console.error("⚠️ saveOrder: Failed to send email(s):", emailErr)
    }

    return { orderId: newOrder.id, error: null }


  } catch (err: any) {
    console.error("❌ saveOrder FAILED:", err?.message ?? err)
    return { orderId: null, error: err?.message ?? "Unknown error" }
  }
}
