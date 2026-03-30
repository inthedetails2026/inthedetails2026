"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { addCategory, addSubcategory } from "@/lib/actions/category"
import { useUploadFile } from "@/hooks/use-upload-file"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "@/components/file-uploader"
import { Icons } from "@/components/icons"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().optional(),
})

const subcategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Parent Category is required"),
  description: z.string().optional(),
})

interface AddCategoryFormProps {
  type: "category" | "subcategory"
  categories?: { id: string; name: string }[]
}

export function AddCategoryForm({ type, categories }: AddCategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const {
    uploadFiles,
    progresses,
    uploadedFiles,
    setUploadedFiles,
    isUploading,
  } = useUploadFile("productImage")

  const form = useForm<
    z.infer<typeof categorySchema> | z.infer<typeof subcategorySchema>
  >({
    resolver: zodResolver(
      type === "category" ? categorySchema : subcategorySchema
    ),
    defaultValues:
      type === "category"
        ? { name: "", description: "", image: "" }
        : { name: "", categoryId: "", description: "" },
  })

  function onSubmit(values: any) {
    startTransition(async () => {
      let error

      if (type === "category") {
        const imageUrl =
          uploadedFiles.length > 0
            ? uploadedFiles[uploadedFiles.length - 1].url
            : "/images/categories/lighting.png"

        const res = await addCategory({
          name: values.name,
          description: values.description,
          image: imageUrl,
        })
        error = res.error
      } else {
        const res = await addSubcategory({
          categoryId: values.categoryId,
          name: values.name,
          description: values.description,
        })
        error = res.error
      }

      if (error) {
        toast.error(error)
      } else {
        toast.success(
          `${type === "category" ? "Main Category" : "Subcategory"} created!`
        )
        form.reset()
        setUploadedFiles([])
        router.push("/admin/categories")
        router.refresh()
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-4"
      >
        {type === "subcategory" && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Garden Decor" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short description..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "category" && (
          <div className="space-y-4">
            <FormItem className="w-full">
              <FormLabel>Thumbnail Image</FormLabel>
              <FormControl>
                <FileUploader
                  maxFiles={1}
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
              <div className="flex flex-wrap gap-3">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={file.id}
                    className="group relative h-24 w-24 overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() =>
                        setUploadedFiles(
                          uploadedFiles.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button disabled={isPending || isUploading}>
          {isPending && (
            <Icons.spinner
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Create
        </Button>
      </form>
    </Form>
  )
}
