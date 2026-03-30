"use client"

import * as React from "react"
import { Trash } from "lucide-react"
import { toast } from "sonner"

import { deleteCategory, deleteSubcategory } from "@/lib/actions/category"
import { Button } from "@/components/ui/button"

interface DeleteCategoryButtonProps {
  id: string
  type: "category" | "subcategory"
}

export function DeleteCategoryButton({ id, type }: DeleteCategoryButtonProps) {
  const [isPending, startTransition] = React.useTransition()

  return (
    <Button
      variant="destructive"
      size="icon"
      className="h-8 w-8"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          let error
          if (type === "category") {
            const res = await deleteCategory({ id })
            error = res.error
          } else {
            const res = await deleteSubcategory({ id })
            error = res.error
          }

          if (error) {
            toast.error(error)
          } else {
            toast.success(
              `${type === "category" ? "Category" : "Subcategory"} deleted`
            )
          }
        })
      }}
    >
      <Trash className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  )
}
