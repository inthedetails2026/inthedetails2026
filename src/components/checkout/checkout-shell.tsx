"use client"

import * as React from "react"
import { Elements } from "@stripe/react-stripe-js"
import { type StripeElementsOptions } from "@stripe/stripe-js"

import { getStripe } from "@/lib/get-stripe"
import { cn } from "@/lib/utils"

/**
 * See the Stripe documentation for more information:
 * @see https://stripe.com/docs/payments/quickstart
 */

interface CheckoutShellProps
  extends React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> {
  storeStripeAccountId?: string | null
  paymentIntentPromise: Promise<{
    data: {
      clientSecret: string | null
    } | null
    error: string | null
  }>
}

export function CheckoutShell({
  children,
  storeStripeAccountId = null,
  paymentIntentPromise,
  className,
  ...props
}: CheckoutShellProps) {
  const stripePromise = React.useMemo(
    () => getStripe(storeStripeAccountId ?? undefined),
    [storeStripeAccountId]
  )

  /**
   * Calling createPaymentIntentAction at the client component to avoid stripe authentication error in server action
   */
  const { data, error } = React.use(paymentIntentPromise)

  if (!data?.clientSecret || error) {
    return (
      <section className={cn("flex size-full flex-col items-center justify-center space-y-4 bg-white p-6 text-center", className)} {...props}>
        <div className="flex flex-col items-center gap-2">
           <div className="text-xl font-bold text-red-600">Checkout Error</div>
           <p className="text-muted-foreground max-w-sm">
             {error ?? "No payment session found. Please try refreshing your cart or adding items."}
           </p>
        </div>
      </section>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret: data.clientSecret,
    appearance: {
      theme: "stripe",
    },
  }

  return (
    <section className={cn("size-full", className)} {...props}>
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    </section>
  )
}
