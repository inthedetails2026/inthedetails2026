import * as React from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

import { DashboardIcon, ExitIcon, GearIcon } from "@radix-ui/react-icons"

import { getStoreByUserId } from "@/lib/queries/store"
import { cn, getUserEmail } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"
import { DropdownSignOut } from "@/components/layouts/dropdown-signout"

interface AuthDropdownProps
  extends React.ComponentPropsWithRef<typeof DropdownMenuTrigger>,
    ButtonProps {
  user: User | null
}

export async function AuthDropdown({
  user,
  className,
  ...props
}: AuthDropdownProps) {
  if (!user) {
    return (
      <Button size="sm" className={cn(className)} {...props} asChild>
        <Link href="/signin">
          Sign In
          <span className="sr-only">Sign In</span>
        </Link>
      </Button>
    )
  }

  const email = getUserEmail(user)
  const initials = user.email?.charAt(0).toUpperCase() ?? "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn("size-8 rounded-full", className)}
          {...props}
        >
          <Avatar className="size-8">
            <AvatarImage src={""} alt={email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {email === "inthedetails2026@gmail.com" && (
          <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <DashboardIcon className="mr-2 size-4" aria-hidden="true" />
              Admin Dashboard
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">
              <GearIcon className="mr-2 size-4" aria-hidden="true" />
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <GearIcon className="mr-2 size-4" aria-hidden="true" />
              My Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownSignOut />






      </DropdownMenuContent>
    </DropdownMenu>
  )
}
