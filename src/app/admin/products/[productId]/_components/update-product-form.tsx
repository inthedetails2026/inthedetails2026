"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { type Product } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { deleteProduct, updateProduct } from "@/lib/actions/product"
import { getErrorMessage } from "@/lib/handle-error"
import {
  type getCategories,
  type getSubcategories,
} from "@/lib/queries/product"
import {
  updateProductSchema,
  type UpdateProductSchema,
} from "@/lib/validations/product"
import { useUploadFile } from "@/hooks/use-upload-file"
import { Button } from "@/components/ui/button"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  UncontrolledFormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "@/components/file-uploader"
import { Icons } from "@/components/icons"

interface UpdateProductFormProps {
  product: Product
  promises: Promise<{
    categories: Awaited<ReturnType<typeof getCategories>>
    subcategories: Awaited<ReturnType<typeof getSubcategories>>
  }>
}

export function UpdateProductForm({
  product,
  promises,
}: UpdateProductFormProps) {
  const { categories, subcategories } = React.use(promises)

  const router = useRouter()
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const { uploadFiles: uploadThumbnail, progresses: thumbnailProgresses, uploadedFiles: thumbnail, setUploadedFiles: setThumbnail, isUploading: isUploadingThumbnail } = useUploadFile("productImage", {
    defaultUploadedFiles: product.images?.length ? [product.images[0]] : [],
  })

  const { uploadFiles: uploadImages, progresses: imagesProgresses, uploadedFiles: images, setUploadedFiles: setImages, isUploading: isUploadingImages } = useUploadFile("productImage", {
    defaultUploadedFiles: (product.images?.length ?? 0) > 1 ? product.images!.slice(1) : [],
  })

  const form = useForm<UpdateProductSchema>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      price: product.price,
      inventory: product.inventory,
    },
  })

  function onSubmit(input: UpdateProductSchema) {
    setIsUpdating(true)

    const { images: _images, ...rest } = input
    const passedSubcategoryId = !rest.subcategoryId || rest.subcategoryId === "empty-subcategory" ? null : rest.subcategoryId;

    toast.promise(
      updateProduct({
        ...rest,
        subcategoryId: passedSubcategoryId,
        storeId: product.storeId,
        id: product.id,
        images: [...thumbnail, ...images],
      }),
      {
        loading: "Updating product...",
        success: () => {
          form.reset()
          setIsUpdating(false)
          router.refresh()
          return "Product updated"
        },
        error: (err) => {
          setIsUpdating(false)
          return getErrorMessage(err)
        },
      }
    )
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
            <FormItem className="w-full">
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
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value: typeof field.value) =>
                      field.onChange(value)
                    }
                    defaultValue={product.categoryId}
                  >
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder={field.value} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subcategoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Subcategory</FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder={field.value} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {subcategories.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormItem className="w-full">
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Type product price here."
                {...form.register("price")}
                defaultValue={product.price}
              />
            </FormControl>
            <UncontrolledFormMessage
              message={form.formState.errors.price?.message}
            />
          </FormItem>
          <FormItem className="w-full">
            <FormLabel>Inventory</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Type product inventory here."
                {...form.register("inventory", {
                  valueAsNumber: true,
                })}
                defaultValue={product.inventory}
              />
            </FormControl>
            <UncontrolledFormMessage
              message={form.formState.errors.inventory?.message}
            />
          </FormItem>
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
        <div className="flex space-x-2">
          <Button disabled={isDeleting || isUpdating || isUploadingThumbnail || isUploadingImages}>
            {(isUpdating || isUploadingThumbnail || isUploadingImages) && (
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Update Product
            <span className="sr-only">Update product</span>
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setIsDeleting(true)

              toast.promise(
                deleteProduct({
                  storeId: product.storeId,
                  id: product.id,
                }),
                {
                  loading: "Deleting product...",
                  success: () => {
                    void form.trigger(["name", "price", "inventory"])
                    router.push(`/admin/products`)
                    setIsDeleting(false)
                    return "Product deleted"
                  },
                  error: (err) => {
                    setIsDeleting(false)
                    return getErrorMessage(err)
                  },
                }
              )
            }}
            disabled={isDeleting}
          >
            {isDeleting && (
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Delete Product
            <span className="sr-only">Delete product</span>
          </Button>
        </div>
      </form>
    </Form>
  )
}
