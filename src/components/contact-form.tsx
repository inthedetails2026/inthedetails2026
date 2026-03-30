"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { sendContactEmail } from "@/lib/actions/email"
import { contactEmailSchema, type ContactEmailSchema } from "@/lib/validations/email"
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
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"

export function ContactForm() {
  const [isPending, startTransition] = React.useTransition()

  // react-hook-form
  const form = useForm<ContactEmailSchema>({
    resolver: zodResolver(contactEmailSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  function onSubmit(data: ContactEmailSchema) {
    startTransition(async () => {
      const { error } = await sendContactEmail(data)

      if (error) {
        toast.error(error)
        return
      }

      toast.success("Thank you for reaching out! We will get back to you soon.")
      form.reset()
    })
  }

  return (
    <Form {...form}>
      <form
        className="grid w-full gap-5 h-fit p-6 rounded-xl border bg-muted/30 backdrop-blur-sm shadow-sm"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mireille Nasr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="mireillen@inthedetails.net" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="How can we help you?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type your message here..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full sm:w-fit" disabled={isPending}>
          {isPending && (
            <Icons.spinner className="mr-2 size-4 animate-spin" aria-hidden="true" />
          )}
          Send Message
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </Form>
  )
}
