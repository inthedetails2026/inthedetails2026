"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { addProduct } from "@/lib/actions/product"
import { createProductSchema } from "@/lib/validations/product"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useUploadFile } from "@/hooks/use-upload-file"

type Inputs = z.infer<typeof createProductSchema>

interface AddProductFormProps {
  storeId: string
  promises: Promise<{
    categories: any[]
    subcategories: any[]
  }>
}

export function AddProductForm({ storeId, promises }: AddProductFormProps) {
  const router = useRouter()
  const { categories, subcategories } = React.use(promises)
  const [isPending, startTransition] = React.useTransition()
  const { uploadFiles: uploadThumbnail, progresses: thumbnailProgresses, uploadedFiles: thumbnail, setUploadedFiles: setThumbnail, isUploading: isUploadingThumbnail } = useUploadFile("productImage", { defaultUploadedFiles: [] })
  
  const { uploadFiles: uploadImages, progresses: imagesProgresses, uploadedFiles: images, setUploadedFiles: setImages, isUploading: isUploadingImages } = useUploadFile("productImage", { defaultUploadedFiles: [] })

  const form = useForm<Inputs>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      inventory: 10,
      categoryId: "",
      subcategoryId: "",
      images: [],
    },
  })

  function onSubmit(data: Inputs) {
    startTransition(async () => {
      try {
        const passedSubcategoryId = !data.subcategoryId || data.subcategoryId === "empty-subcategory" ? null : data.subcategoryId;

        const { error } = await addProduct({
          ...data,
          subcategoryId: passedSubcategoryId,
          storeId,
          images: [...thumbnail, ...images],
        })

        if (error) {
          toast.error(error)
          return
        }

        form.reset()
        toast.success("Product added successfully.")
        router.push("/admin/products")
        router.refresh()
      } catch (err) {
        toast.error("Failed to add product. Please try again.")
      }
    })
  }

  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-2xl gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Type product name here." {...field} />
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
                  placeholder="Type product description here."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full shadow-none mt-2">
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder={field.value || "Select a category"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="capitalize"
                          >
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="empty-category">
                          No categories available
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subcategoryId"
            render={({ field }) => (
              <FormItem className="w-full shadow-none mt-2">
                <FormLabel>Subcategory</FormLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => field.onChange(value)}
                  disabled={!form.watch("categoryId")}
                >
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder={field.value ? subcategories.find((s: any) => s.id === field.value)?.name : "Select a subcategory"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {subcategories.filter((s:any) => s.categoryId === form.watch("categoryId")).length > 0 ? (
                        subcategories
                          .filter((s: any) => s.categoryId === form.watch("categoryId"))
                          .map((subcategory: any) => (
                            <SelectItem
                              key={subcategory.id}
                              value={subcategory.id}
                              className="capitalize"
                            >
                              {subcategory.name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem disabled value="empty-subcategory">
                          No subcategories available
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Type product price here."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inventory"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Type product inventory here."
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="images"
            // We use a custom render for the double dropzone
            render={({ field }) => (
              <div className="space-y-6">
                
                {/* THUMBNAIL SECTION */}
                <div className="space-y-4">
                  <FormItem className="w-full">
                    <FormLabel>Thumbnail Image</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      The primary item photo shown on the product card.
                    </p>
                    <FormControl>
                      <FileUploader
                        maxFiles={1}
                        maxSize={4 * 1024 * 1024}
                        progresses={thumbnailProgresses}
                        onUpload={async (files) => {
                          await uploadThumbnail(files)
                        }}
                        disabled={isUploadingThumbnail || thumbnail.length >= 1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  {thumbnail.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-3">
                        {thumbnail.map((file, idx) => (
                          <div key={file.id} className="relative h-24 w-24 rounded-md overflow-hidden border group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 pointer-events-none">
                              Thumbnail
                            </span>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setThumbnail([])}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full h-px bg-border" />

                {/* ADDITIONAL IMAGES SECTION */}
                <div className="space-y-4">
                  <FormItem className="w-full">
                    <FormLabel>Additional Gallery Images</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Up to 3 extra photos to show the product from different angles.
                    </p>
                    <FormControl>
                      <FileUploader
                        maxFiles={3}
                        maxSize={4 * 1024 * 1024}
                        progresses={imagesProgresses}
                        onUpload={async (files) => {
                          await uploadImages(files)
                        }}
                        disabled={isUploadingImages || images.length >= 3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-3">
                        {images.map((file) => (
                          <div key={file.id} className="relative h-24 w-24 rounded-md overflow-hidden border group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setImages(images.filter((img) => img.id !== file.id))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        </div>
        <Button className="w-fit" disabled={isPending || isUploadingThumbnail || isUploadingImages}>
          {(isPending || isUploadingThumbnail || isUploadingImages) && (
            <Icons.spinner
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Add Product
          <span className="sr-only">Add Product</span>
        </Button>
      </form>
    </Form>
  )
}
