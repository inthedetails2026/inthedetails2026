"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function handleSignOut() {
    setIsPending(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
      router.push("/signin")
      router.refresh()
    } catch {
      toast.error("Failed to sign out. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      onClick={handleSignOut}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
