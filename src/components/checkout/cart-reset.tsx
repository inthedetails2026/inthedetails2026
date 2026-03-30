"use client"

import * as React from "react"
import { clearCart } from "@/lib/actions/cart"

export function CartReset() {
  React.useEffect(() => {
    // We clear the cart cookie and delete it from DB on the client-side
    // once the user sees the Success page. This is safe because we already
    // verified the payment on the server.
    clearCart().catch(console.error)
  }, [])

  return null
}
