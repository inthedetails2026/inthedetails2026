import { type Metadata } from "next"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"

import { getProducts, getCategories } from "@/lib/queries/product"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"
import { Products } from "@/components/products"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Products",
  description: "Buy products from our stores",
}

interface ProductsPageProps {
  searchParams: SearchParams
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { data, pageCount } = await getProducts(searchParams)
  const categories = await getCategories()

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">Products</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Buy products from our stores
        </PageHeaderDescription>
      </PageHeader>
      <Products
        products={data}
        pageCount={pageCount}
        categories={categories}
      />
    </Shell>
  )
}
