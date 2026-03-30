"use server"

import { env } from "@/env.js"
import { resend } from "@/lib/resend"
import { type ContactEmailSchema } from "@/lib/validations/email"
import { getErrorMessage } from "@/lib/handle-error"

export async function sendContactEmail(input: ContactEmailSchema) {
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM_ADDRESS,
      to: "info@inthedetails.net",
      reply_to: input.email,
      subject: `New Contact Form Submission: ${input.subject}`,
      text: `
        Name: ${input.name}
        Email: ${input.email}
        Subject: ${input.subject}
        Message: ${input.message}
      `,
    })

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
