"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { addresses, profiles } from "@/db/schema"
import { type z } from "zod"

import { signUpSchema } from "@/lib/validations/auth"

export async function saveUserAddress(
  input: z.infer<typeof signUpSchema>,
  userId: string
) {
  try {
    // Create address record
    await db.insert(addresses).values({
      userId,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      phone: input.phone,
    })

    // Create profile record for visibility in Admin dashboard
    await db.insert(profiles).values({
      userId,
      email: input.email,
      name: input.name,
    })

    revalidatePath("/")
    return { error: null }
  } catch (err) {
    console.error(err)
    return { error: "Failed to save user data" }
  }
}
