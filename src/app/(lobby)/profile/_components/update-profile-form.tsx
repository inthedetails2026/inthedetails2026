"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UpdateProfileFormProps {
  user: User
}

export function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const phone = user.user_metadata?.phone ?? user.phone ?? ""
  const fullName = user.user_metadata?.full_name ?? ""

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const newPhone = formData.get("phone") as string
    const newFullName = formData.get("full_name") as string

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: newFullName,
          phone: newPhone,
        },
      })

      if (error) throw error

      toast.success("Profile updated successfully!")
      router.push("/")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update profile")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email ?? ""}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed here.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={fullName}
          placeholder="Your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number{" "}
          <span className="text-xs text-muted-foreground">
            (used for delivery updates)
          </span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          placeholder="+971 50 000 0000"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
