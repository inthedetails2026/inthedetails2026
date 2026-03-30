import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import {
  getProductCountByCategory,
  type getCategories,
} from "@/lib/queries/product"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"

interface CategoryCardProps {
  category: Awaited<ReturnType<typeof getCategories>>[number]
}

export function CategoryCard({ category }: CategoryCardProps) {
  const productCountPromise = getProductCountByCategory({
    categoryId: category.id,
  })

  return (
    <Link href={`/collections/${category.slug}`}>
      <Card className="group relative h-full overflow-hidden rounded-xl border-none transition-all hover:ring-2 hover:ring-primary">
        <AspectRatio ratio={1} className="overflow-hidden">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/10">
              <Icons.placeholder className="size-12 animate-pulse text-primary/40" />
            </div>
          )}
        </AspectRatio>
        <div className="absolute inset-x-0 bottom-0 top-0 bg-black/20 transition-colors group-hover:bg-black/40" />
        <div className="absolute bottom-3 left-3 right-3 z-10 w-fit max-w-[calc(100%-1.5rem)] rounded-lg bg-black/50 p-3 text-white transition-colors group-hover:bg-black/70 shadow-lg">
          <CardTitle className="font-heading text-lg capitalize md:text-xl">
            {category.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-1 text-xs text-white/90 md:text-sm">
            {category.description}
          </CardDescription>
          <div className="mt-2 text-[0.7rem] text-white/70">
            <React.Suspense fallback={<Skeleton className="h-3 w-16 bg-white/20" />}>
              <ProductCount productCountPromise={productCountPromise} />
            </React.Suspense>
          </div>
        </div>
      </Card>
    </Link>
  )
}

interface ProductCountProps {
  productCountPromise: ReturnType<typeof getProductCountByCategory>
}

async function ProductCount({ productCountPromise }: ProductCountProps) {
  const count = await productCountPromise

  return (
    <div className="flex w-fit items-center text-[0.8rem] text-white/90">
      <Icons.product className="mr-1.5 size-3.5" aria-hidden="true" />
      {count} pieces
    </div>
  )
}
