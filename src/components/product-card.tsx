"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { type Product } from "@/db/schema"
import { CheckIcon, EyeOpenIcon, PlusIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"

import { addToCart } from "@/lib/actions/cart"
import { cn, formatPrice } from "@/lib/utils"
import { safeParseImages } from "@/lib/images"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { PlaceholderImage } from "@/components/placeholder-image"

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: Pick<Product, "id" | "name" | "price" | "images" | "inventory"> & {
    category: string | null
  }
  variant?: "default" | "switchable"
  isAddedToCart?: boolean
  onSwitch?: () => Promise<void>
}

export function ProductCard({
  product,
  variant = "default",
  isAddedToCart = false,
  onSwitch,
  className,
  ...props
}: ProductCardProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition()
  const images = safeParseImages(product.images) ?? []

  return (
    <Card
      className={cn("size-full overflow-hidden rounded-lg", className)}
      {...props}
    >
      <Link aria-label={product.name} href={`/product/${product.id}`}>
        <CardHeader className="border-b p-0">
          <AspectRatio ratio={4 / 3}>
            {images.length ? (
              <Image
                src={images[0]?.url ?? "/images/product-placeholder.webp"}
                alt={images[0]?.name ?? product.name}
                className="object-cover"
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
                fill
                loading="lazy"
              />
            ) : (
              <PlaceholderImage className="rounded-none" asChild />
            )}
          </AspectRatio>
        </CardHeader>
        <span className="sr-only">{product.name}</span>
      </Link>
      <Link href={`/product/${product.id}`} tabIndex={-1}>
        <CardContent className="space-y-1.5 p-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="line-clamp-1 flex-1">{product.name}</CardTitle>
            {product.category && (
              <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-secondary/30 border-secondary/10 hover:bg-secondary/40 h-fit">
                {product.category}
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-1">
            {formatPrice(product.price)}
          </CardDescription>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-1">
        {variant === "default" ? (
          <div className="flex w-full items-center space-x-2">
            <Button
              aria-label="Add to cart"
              size="sm"
              className="h-8 w-full rounded-sm"
              onClick={async () => {
                startUpdateTransition(() => {})
                const { error } = await addToCart({
                  productId: product.id,
                  quantity: 1,
                })

                if (error) {
                  toast.error(error)
                }
              }}
              disabled={isUpdatePending}
            >
              {isUpdatePending && (
                <Icons.spinner
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Add to cart
            </Button>
            <Link
              href={`/preview/product/${product.id}`}
              title="Preview"
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "icon",
                  className: "h-8 w-8 shrink-0",
                })
              )}
            >
              <EyeOpenIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">Preview</span>
            </Link>
          </div>
        ) : (
          <Button
            aria-label={isAddedToCart ? "Remove from cart" : "Add to cart"}
            size="sm"
            className="h-8 w-full rounded-sm"
            onClick={async () => {
              startUpdateTransition(async () => {})
              await onSwitch?.()
            }}
            disabled={isUpdatePending}
          >
            {isUpdatePending ? (
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            ) : isAddedToCart ? (
              <CheckIcon className="mr-2 size-4" aria-hidden="true" />
            ) : (
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            )}
            {isAddedToCart ? "Added" : "Add to cart"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
