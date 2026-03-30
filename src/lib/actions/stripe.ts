"use server"

import { env } from "@/env.js"
import {
  unstable_cache as cache,
  unstable_noStore as noStore,
} from "next/cache"
import { cookies } from "next/headers"
import { db } from "@/db"
import { carts, payments, products, stores } from "@/db/schema"
import type { PlanWithPrice, UserPlan } from "@/types"
import { createClient } from "@/lib/supabase/server"

import { addDays } from "date-fns"
import { and, asc, desc, eq, gte, inArray, like, lte, sql } from "drizzle-orm"
import type Stripe from "stripe"
import { type z } from "zod"

import { pricingConfig } from "@/config/pricing"
import { calculateOrderAmount } from "@/lib/checkout"
import { getErrorMessage } from "@/lib/handle-error"
import { stripe } from "@/lib/stripe"
import { absoluteUrl, formatPrice, getUserEmail } from "@/lib/utils"
import { userPrivateMetadataSchema } from "@/lib/validations/auth"
import { type CheckoutItemSchema } from "@/lib/validations/cart"
import type {
  createPaymentIntentSchema,
  getPaymentIntentSchema,
  getPaymentIntentsSchema,
  getStripeAccountSchema,
  managePlanSchema,
} from "@/lib/validations/stripe"

// Getting a payment intent
export async function getPaymentIntent(
  input: z.infer<typeof getPaymentIntentSchema>
) {
  noStore()

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      input.paymentIntentId
    )

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment intent not succeeded.")
    }

    return {
      paymentIntent,
      isVerified: true,
    }
  } catch (err) {
    console.error(err)
    return {
      paymentIntent: null,
      isVerified: false,
    }
  }
}

// Creating a payment intent for the store
export async function createPaymentIntent(
  input: z.infer<typeof createPaymentIntentSchema>
) {
  noStore()

  try {
    const cartId = cookies().get("cartId")?.value

    if (!cartId) {
      throw new Error("Cart not found.")
    }

    const checkoutItems: CheckoutItemSchema[] = input.items.map((item) => ({
      productId: item.id,
      price: Number(item.price),
      quantity: item.quantity,
    }))

    const store = await db.query.stores.findFirst({
      columns: {
        deliveryFee: true,
      },
      where: eq(stores.id, input.storeId),
    })

    const { total } = calculateOrderAmount(input.items, store?.deliveryFee ?? 0)
    console.log("Creating Payment Intent:", { total, itemsCount: checkoutItems.length, deliveryFee: store?.deliveryFee })

    if (total <= 0) {
      throw new Error("Cannot create payment intent for 0 amount. Please ensure your cart has items.")
    }

    const metadata: Stripe.MetadataParam = {
      cartId: cartId,
      // Stripe metadata values must be within 500 characters string
      items: JSON.stringify(checkoutItems),
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: total,
        currency: "usd",
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      }
    )

    // Update the cart with the payment intent id and client secret
    await db
      .update(carts)
      .set({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      })
      .where(eq(carts.id, cartId))

    return {
      data: {
        clientSecret: paymentIntent.client_secret,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

// Create a Stripe Checkout session with dynamic prices for marketplace items
export async function createCheckoutSession(input: {
  storeId: string
  items: CheckoutItemSchema[]
}) {
  noStore()
  try {
    // SECURITY: Fetch items from the database to ensure the prices are verified (prevent frontend hacks)
    const productIds = input.items.map((item) => item.productId)
    const dbProducts = await db.query.products.findMany({
      where: inArray(products.id, productIds),
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = input.items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found.`)
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description ?? undefined,
            images: product.images && product.images.length > 0 ? [product.images[0].url] : [],
          },
          unit_amount: Math.round(Number(product.price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      }
    })

    const session = await stripe.checkout.sessions.create(
      {
        line_items,
        mode: "payment",
        success_url: absoluteUrl(`/checkout/${input.storeId}/success?session_id={CHECKOUT_SESSION_ID}`),
        cancel_url: absoluteUrl(`/checkout/${input.storeId}`),
        billing_address_collection: "auto",
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU"], // Adjust your target shipping regions
        },
        metadata: {
          storeId: input.storeId,
          // Store a stringified version of custom identifiers
          items: JSON.stringify(input.items.map(i => ({ id: i.productId, qty: i.quantity })))
        },
      }
    )

    return { 
      data: {
        url: session.url 
      },
      error: null 
    }
  } catch (err) {
    return { 
      data: null,
      error: getErrorMessage(err) 
    }
  }
}
