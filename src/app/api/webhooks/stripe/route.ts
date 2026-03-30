import { revalidateTag } from "next/cache"
import { getStore, getStoreId } from "@/lib/store"
import { headers } from "next/headers"
import { db } from "@/db"
import { addresses, carts, orders, payments, products } from "@/db/schema"
import { env } from "@/env.js"
import { eq, or } from "drizzle-orm"

import type Stripe from "stripe"
import { z } from "zod"
import { generateId } from "@/lib/id"

import { stripe } from "@/lib/stripe"
import {
  checkoutItemSchema,
  type CheckoutItemSchema,
} from "@/lib/validations/cart"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") ?? ""

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown error."}`,
      { status: 400 }
    )
  }

  switch (event.type) {
    // Handling subscription events
    case "checkout.session.completed":
      const checkoutSessionCompleted = event.data.object

      // If there is a user id, and no cart id in the metadata, then this is a new subscription
      if (
        checkoutSessionCompleted?.metadata?.userId &&
        !checkoutSessionCompleted?.metadata?.cartId
      ) {
         // Subscription logic removed for Supabase migration
      }
      break
    case "invoice.payment_succeeded":
      const invoicePaymentSucceeded = event.data.object

      // If there is a user id, and no cart id in the metadata, then this is a new subscription
      if (
        invoicePaymentSucceeded?.metadata?.userId &&
        !invoicePaymentSucceeded?.metadata?.cartId
      ) {
         // Subscription logic removed for Supabase migration
      }
      // revalidateTag(`${invoicePaymentSucceeded?.metadata?.userId}-subscription`)
      break

    // Handling payment events
    case "payment_intent.payment_failed":
      const paymentIntentPaymentFailed = event.data.object
      console.log(
        `❌ Payment failed: ${paymentIntentPaymentFailed.last_payment_error?.message}`
      )
      break
    case "payment_intent.processing":
      const paymentIntentProcessing = event.data.object
      console.log(`⏳ Payment processing: ${paymentIntentProcessing.id}`)
      break
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object

      const paymentIntentId = paymentIntentSucceeded?.id
      const orderAmount = paymentIntentSucceeded?.amount
      const checkoutItems = paymentIntentSucceeded?.metadata
        ?.items as unknown as CheckoutItemSchema[]

      // If there are items in metadata, then create order
      if (checkoutItems) {
        try {
          // Parsing items from metadata
          const safeParsedItems = z
            .array(checkoutItemSchema)
            .safeParse(
              JSON.parse(paymentIntentSucceeded?.metadata?.items ?? "[]")
            )

          if (!safeParsedItems.success) {
            throw new Error("Could not parse items.")
          }

          const store = await getStore()
          const storeId = store.id

          const processingFeePercent = Number(store.processingFeePercent) / 100
          const processingFeeFixed = store.processingFeeFixed / 100
          const totalAmount = Number(orderAmount) / 100

          const stripeFee = totalAmount * processingFeePercent + processingFeeFixed
          const netAmount = totalAmount - stripeFee

          // Create new address in DB
          const stripeAddress = paymentIntentSucceeded?.shipping?.address

          const newAddress = await db
            .insert(addresses)
            .values({
              line1: stripeAddress?.line1,
              line2: stripeAddress?.line2,
              city: stripeAddress?.city,
              state: stripeAddress?.state,
              country: stripeAddress?.country,
              postalCode: stripeAddress?.postal_code,
            })
            .returning({
              insertedId: addresses.id,
            })

          if (!newAddress[0]?.insertedId) throw new Error("No address created.")

          // Create new order in db with explicit ID and precision
          console.log("🔥 WEBHOOK: Attempting direct order insert...")
          const newOrder = await db.insert(orders).values({
            id: generateId("order"),
            storeId,
            items: safeParsedItems.data,
            quantity: safeParsedItems.data.reduce(
              (acc, item) => acc + item.quantity,
              0
            ),
            amount: totalAmount.toFixed(2),
            stripeFee: stripeFee.toFixed(2),
            netAmount: netAmount.toFixed(2),
            stripePaymentIntentId: paymentIntentId,
            stripePaymentIntentStatus: paymentIntentSucceeded?.status,
            name: paymentIntentSucceeded?.shipping?.name ?? "Customer",
            email: paymentIntentSucceeded?.receipt_email ?? "",
            addressId: newAddress[0]?.insertedId,
          }).returning({ insertedId: orders.id })

          console.log("DEBUG: SUCCESS! Webhook created order in DB:", { 
            id: newOrder[0]?.insertedId, 
            intent: paymentIntentId 
          })

          // Update product inventory in db
          for (const item of safeParsedItems.data) {
            const product = await db.query.products.findFirst({
              columns: {
                id: true,
                inventory: true,
              },
              where: eq(products.id, item.productId),
            })

            if (!product) {
              throw new Error("Product not found.")
            }

            const inventory = product.inventory - item.quantity

            if (inventory < 0) {
              throw new Error("Product out of stock.")
            }

            await db
              .update(products)
              .set({
                inventory: product.inventory - item.quantity,
              })
              .where(eq(products.id, item.productId))
          }

          // Close cart and clear items
          await db
            .update(carts)
            .set({
              closed: true,
              items: [],
            })
            .where(eq(carts.paymentIntentId, paymentIntentId))
        } catch (err) {
          console.log("Error creating order.", err)
        }
      }
      break
    case "application_fee.created":
      const applicationFeeCreated = event.data.object
      console.log(`Application fee id: ${applicationFeeCreated.id}`)
      break
    case "charge.succeeded":
      const chargeSucceeded = event.data.object
      console.log(`Charge id: ${chargeSucceeded.id}`)
      break
    default:
      console.warn(`Unhandled event type: ${event.type}`)
  }

  return new Response(null, { status: 200 })
}
