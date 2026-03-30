import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { products } from "@/db/schema"
import { env } from "@/env.js"
import type { StoredFile } from "@/types"
import { and, eq } from "drizzle-orm"

import { safeParseImages } from "@/lib/images"
import { getCategories, getSubcategories } from "@/lib/queries/product"
import { getStoreId } from "@/lib/store"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { UpdateProductForm } from "./_components/update-product-form"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Manage Product",
  description: "Manage your product",
}

interface UpdateProductPageProps {
  params: {
    productId: string
  }
}

export default async function UpdateProductPage({
  params,
}: UpdateProductPageProps) {
  const storeId = await getStoreId()
  const productId = decodeURIComponent(params.productId)

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, storeId)),
  })

  if (!product) {
    notFound()
  }

  // Handle case where images might be double-stringified in the database
  product.images = safeParseImages(product.images) as StoredFile[] | null

  const promises = Promise.all([getCategories(), getSubcategories()]).then(
    ([categories, subcategories]) => ({ categories, subcategories })
  )

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle as="h2" className="text-2xl">
          Update product
        </CardTitle>
        <CardDescription>
          Update your product information, or delete it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateProductForm promises={promises} product={product} />
      </CardContent>
    </Card>
  )
}
