import type { Metadata } from "next"
import Link from "next/link"
import { db } from "@/db"
import { stores } from "@/db/schema"
import { env } from "@/env.js"
import { eq } from "drizzle-orm"

import { getOrderLineItems } from "@/lib/actions/order"
import { saveOrder } from "@/lib/actions/save-order"
import { getPaymentIntent } from "@/lib/actions/stripe"
import { cn, formatPrice } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CartLineItems } from "@/components/checkout/cart-line-items"
import { CartReset } from "@/components/checkout/cart-reset"
import { VerifyOderForm } from "@/components/checkout/verify-order-form"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Order Success",
  description: "Order summary for your purchase",
}

interface OrderSuccessPageProps {
  params: {
    storeId: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: OrderSuccessPageProps) {
  const storeId = decodeURIComponent(params.storeId)
  const {
    payment_intent,
    payment_intent_client_secret,
    redirect_status,
    delivery_postal_code,
  } = searchParams ?? {}

  const store = await db.query.stores.findFirst({
    columns: {
      name: true,
    },
    where: eq(stores.id, storeId),
  })

  const { isVerified, paymentIntent } = await getPaymentIntent({
    storeId,
    paymentIntentId: typeof payment_intent === "string" ? payment_intent : "",
    deliveryPostalCode:
      typeof delivery_postal_code === "string" ? delivery_postal_code : "",
  })

  // DIRECT ORDER SAVE: This runs immediately when payment is verified.
  // It fetches from Stripe directly and saves to Supabase - no complex logic.
  if (isVerified && typeof payment_intent === "string") {
    await saveOrder(payment_intent)
  }

  const lineItems =
    isVerified && paymentIntent
      ? await getOrderLineItems({
          storeId,
          items: paymentIntent?.metadata?.items,
          paymentIntent,
        })
      : []

  return (
    <div className="flex size-full max-h-dvh flex-col gap-10 overflow-hidden pb-8 pt-6 md:py-8">
      {isVerified ? (
        <div className="grid gap-10 overflow-auto">
          <CartReset />
          <PageHeader
            id="order-success-page-header"
            aria-labelledby="order-success-page-header-heading"
            className="container flex max-w-7xl flex-col"
          >
            <PageHeaderHeading>Order Complete!</PageHeaderHeading>
            <PageHeaderDescription>
              Order ID:{" "}
              <span className="font-mono font-medium text-foreground">
                {paymentIntent?.id}
              </span>
            </PageHeaderDescription>
          </PageHeader>

          <section className="container grid max-w-7xl gap-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">
                Delivery Information
              </h3>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Customer:</span>{" "}
                  {paymentIntent?.shipping?.name}
                </p>
                <p>
                  <span className="font-medium text-foreground">Address:</span>{" "}
                  {paymentIntent?.shipping?.address?.line1},{" "}
                  {paymentIntent?.shipping?.address?.city},{" "}
                  {paymentIntent?.shipping?.address?.country}
                </p>
                {paymentIntent?.shipping?.address?.line2 && (
                  <p>{paymentIntent?.shipping?.address?.line2}</p>
                )}
                {paymentIntent?.shipping?.phone && (
                  <p>
                    <span className="font-medium text-foreground">Phone:</span>{" "}
                    {paymentIntent?.shipping?.phone}
                  </p>
                )}
                <p className="mt-2 font-medium italic text-primary">
                  "We will be in touch with you as soon as possible for the
                  delivery"
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-sm font-medium">
                  Need help with your delivery?
                </p>
                <WhatsAppButton
                  variant="inline"
                  message={`Hi! I just placed an order (ID: ${paymentIntent?.id}) at In the Details shop and would like to follow up. How can you help me today?`}
                  className="w-fit"
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-col space-y-4">
              <h3 className="text-center text-lg font-semibold md:text-left">
                Order Summary
              </h3>
              <CartLineItems
                items={lineItems}
                isEditable={false}
                className="w-full"
              />
              <div className="flex w-full items-center pt-4 text-lg font-bold">
                <span className="flex-1 font-medium text-muted-foreground">
                  Total (
                  {lineItems.reduce(
                    (acc, item) => acc + Number(item.quantity),
                    0
                  )}{" "}
                  items)
                </span>
                <span>
                  {formatPrice(
                    lineItems.reduce(
                      (acc, item) =>
                        acc + Number(item.price) * Number(item.quantity),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </section>

          <section
            id="order-success-actions"
            aria-labelledby="order-success-actions-heading"
            className="container flex max-w-7xl items-center justify-center space-x-2.5 pb-10"
          >
            <Link
              aria-label="Continue shopping"
              href="/products"
              className={cn(
                buttonVariants({
                  size: "sm",
                  className: "text-center",
                })
              )}
            >
              Continue shopping
            </Link>
            <Link
              aria-label="Back to cart"
              href="/cart"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "text-center",
                })
              )}
            >
              Back to cart
            </Link>
          </section>
        </div>
      ) : (
        <div className="container grid max-w-7xl gap-10">
          <PageHeader>
            <PageHeaderHeading>Order Processing</PageHeaderHeading>
            <PageHeaderDescription>
              We are verifying your order details.
            </PageHeaderDescription>
          </PageHeader>
        </div>
      )}
    </div>
  )
}
