"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { notifications } from "@/db/schema"
import { env } from "@/env.js"
import { eq } from "drizzle-orm"

import { getErrorMessage } from "@/lib/handle-error"
import { resend } from "@/lib/resend"
import { createClient } from "@/lib/supabase/server"
import type { UpdateNotificationSchema } from "@/lib/validations/notification"

export async function updateNotification(input: UpdateNotificationSchema) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()


    await db
      .update(notifications)
      .set({
        ...input,
        userId: user?.id,
      })
      .where(eq(notifications.token, input.token))

    revalidatePath("/")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}
