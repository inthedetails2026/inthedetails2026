"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ExitIcon } from "@radix-ui/react-icons"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"

export function DropdownSignOut() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function handleSignOut(event: Event) {
    event.preventDefault()
    setIsPending(true)
    try {
      // Clear cart cookie on sign out
      document.cookie = "cartId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Failed to sign out. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={(event) => {
        handleSignOut(event)
      }}
      disabled={isPending}
    >
      <ExitIcon className="mr-2 size-4" aria-hidden="true" />
      {isPending ? "Logging out..." : "Log out"}
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}
