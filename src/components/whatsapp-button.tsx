"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface WhatsAppButtonProps extends React.ComponentPropsWithoutRef<"div"> {
  phoneNumber?: string
  message?: string
  variant?: "floating" | "inline"
}

export function WhatsAppButton({
  phoneNumber = "+9613895954",
  message = "Hi! I have an inquiry about a product at In the Details shop, can you help me?",
  variant = "floating",
  className,
  ...props
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    message
  )}`

  if (variant === "inline") {
    return (
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-green-600 hover:shadow-xl active:scale-95",
          className
        )}
      >
        <Icons.whatsapp className="size-5" />
        Chat on WhatsApp
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center duration-500 animate-in fade-in slide-in-from-bottom-4",
        className
      )}
      {...props}
    >
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex size-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:bg-green-600 hover:shadow-2xl active:scale-90"
        aria-label="Contact on WhatsApp"
      >
        <span className="absolute -top-12 right-0 scale-0 rounded-lg bg-black/80 px-3 py-1 text-xs text-white transition-all group-hover:scale-100">
          Chat with us
        </span>
        <Icons.whatsapp className="size-8" />
      </Link>
    </div>
  )
}
