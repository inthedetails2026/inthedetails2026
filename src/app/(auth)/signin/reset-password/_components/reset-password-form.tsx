"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { showErrorToast } from "@/lib/handle-error"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type Inputs = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const supabase = createClient()
  const [loading, setLoading] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)

  const form = useForm<Inputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: Inputs) {
    setLoading(true)
    try {
      // Mark that a password reset is in progress so the /auth/callback
      // route can reliably redirect to the update-password page.
      document.cookie =
        "pwd_reset_pending=1; path=/; max-age=600; samesite=lax"

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })

      if (error) throw error

      setEmailSent(true)
      toast.success("Check your email", {
        description: "We sent you a password reset link.",
      })
    } catch (err) {
      showErrorToast(err)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Icons.mail className="size-8 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Email sent!</p>
          <p className="text-sm text-muted-foreground">
            Check your inbox for a link to reset your password. The link expires
            in 1 hour.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-2" disabled={loading}>
          {loading && (
            <Icons.spinner
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Send reset link
          <span className="sr-only">Send password reset email</span>
        </Button>
      </form>
    </Form>
  )
}
