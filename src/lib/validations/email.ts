import * as z from "zod"

export const contactEmailSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long.",
  }),
  subject: z.string().min(2, {
    message: "Subject must be at least 2 characters long.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters long.",
  }),
})

export type ContactEmailSchema = z.infer<typeof contactEmailSchema>
