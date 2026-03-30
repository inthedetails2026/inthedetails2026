"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type Store } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { updateStore } from "@/lib/actions/store"
import {
  updateStoreSchema,
  type UpdateStoreSchema,
} from "@/lib/validations/store"
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

interface UpdateStoreFormProps {
  store: Store
}

export function UpdateStoreForm({ store }: UpdateStoreFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateStoreSchema>({
    resolver: zodResolver(updateStoreSchema),
    defaultValues: {
      name: store.name,
      description: store.description ?? "",
      processingFeePercent: Number(store.processingFeePercent) ?? 2.9,
      processingFeeFixed: store.processingFeeFixed ?? 30,
      deliveryFee: (store.deliveryFee ?? 0) / 100,
    },
  })

  function onSubmit(data: UpdateStoreSchema) {
    startTransition(async () => {
      const fd = new FormData()
      fd.append("name", data.name)
      if (data.description) {
        fd.append("description", data.description)
      }
      fd.append("processingFeePercent", data.processingFeePercent.toString())
      fd.append("processingFeeFixed", data.processingFeeFixed.toString())
      fd.append("deliveryFee", data.deliveryFee.toString())

      const { error } = await updateStore(store.id, fd)

      if (error) {
        toast.error(error)
        return
      }

      toast.success("Store updated successfully.")
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-xl gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Type store name here." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type store description here."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="processingFeePercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stripe Fee (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="2.90"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="processingFeeFixed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stripe Fixed Fee (cents)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="deliveryFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Fee ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-fit" disabled={isPending}>
          {isPending && (
            <Icons.spinner
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Update Store
          <span className="sr-only">Update Store</span>
        </Button>
      </form>
    </Form>
  )
}
