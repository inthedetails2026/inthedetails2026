import * as z from "zod"

import { cartLineItemSchema } from "@/lib/validations/cart"

export const createPaymentIntentSchema = z.object({
  storeId: z.string(),
  items: z.array(cartLineItemSchema),
})

export const getPaymentIntentSchema = z.object({
  storeId: z.string(),
  paymentIntentId: z.string(),
  deliveryPostalCode: z.string().optional().nullable(),
})
