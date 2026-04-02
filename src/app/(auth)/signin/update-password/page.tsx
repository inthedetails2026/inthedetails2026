import { type Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Shell } from "@/components/shell"

import { UpdatePasswordForm } from "./_components/update-password-form"

export const metadata: Metadata = {
  title: "Update Password",
  description: "Set your new password",
}

export default function UpdatePasswordPage() {
  return (
    <Shell className="max-w-lg">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Set new password</CardTitle>
          <CardDescription>
            Enter your new password below to complete the reset
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <UpdatePasswordForm />
        </CardContent>
      </Card>
    </Shell>
  )
}
