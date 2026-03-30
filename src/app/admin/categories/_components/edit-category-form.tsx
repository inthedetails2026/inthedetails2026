"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { updateCategory } from "@/lib/actions/category"
import { FileUploader } from "@/components/file-uploader"
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
import { useUploadFile } from "@/hooks/use-upload-file"
import { type Category } from "@/db/schema"

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
})

type Inputs = z.infer<typeof schema>

interface EditCategoryFormProps {
  category: Category
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  
  const { uploadFiles, progresses, uploadedFiles, setUploadedFiles, isUploading } = useUploadFile("productImage", { 
    defaultUploadedFiles: category.image ? [{
      id: "current",
      name: "current-thumbnail",
      url: category.image,
      key: "current",
      size: 0,
      type: "image/png"
    } as any] : [] 
  })

  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category.name,
      description: category.description ?? "",
      image: category.image ?? "",
    },
  })

  function onSubmit(data: Inputs) {
    startTransition(async () => {
      try {
        // Use the most recent image if multiple were somehow uploaded, 
        // prioritizing newly uploaded ones over the "current" placeholder
        const imageUrl = uploadedFiles.length > 0 ? uploadedFiles[uploadedFiles.length - 1].url : null;
        
        const { error } = await updateCategory({
          id: category.id,
          name: data.name,
          description: data.description,
          image: imageUrl ?? undefined,
        })

        if (error) {
          toast.error(error)
          return
        }

        toast.success("Category updated successfully.")
        router.push("/admin/categories")
        router.refresh()
      } catch (err) {
        toast.error("Something went wrong. Please try again.")
      }
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
                <Input placeholder="Type category name here." {...field} />
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
                  placeholder="Type category description here."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem className="flex w-full flex-col gap-1.5">
          <FormLabel>Thumbnail Image</FormLabel>
          <FormControl>
            <FileUploader
              maxFiles={1} // Keep maxFiles to enforce single image selection
              maxSize={4 * 1024 * 1024}
              progresses={progresses}
              onUpload={async (files) => {
                await uploadFiles(files)
              }}
              disabled={isUploading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {uploadedFiles.map((file, idx) => (
              <div key={file.id} className="relative h-24 w-24 rounded-md overflow-hidden border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {file.id === "current" && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <Button className="w-fit" disabled={isPending || isUploading}>
          {isPending && (
            <Icons.spinner
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Update Category
          <span className="sr-only">Update Category</span>
        </Button>
      </form>
    </Form>
  )
}
