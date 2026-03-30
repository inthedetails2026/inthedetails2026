import type { Metadata } from "next"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"

import {
  getCategoryBySlug,
  getProducts,
  getSubcategoriesByCategory,
} from "@/lib/queries/product"
import { slugify, toTitleCase } from "@/lib/utils"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Products } from "@/components/products"
import { Shell } from "@/components/shell"

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: SearchParams
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: toTitleCase(params.category),
    description: `Buy products from the ${params.category} category`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const categorySlug = slugify(params.category)

  const categoryData = await getCategoryBySlug({ slug: categorySlug })

  const productsTransaction = await getProducts({
    ...searchParams,
    categories: categoryData?.id,
  })

  const subcategories = categoryData
    ? await getSubcategoriesByCategory({ categoryId: categoryData.id })
    : []

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">
          {toTitleCase(categorySlug)}
        </PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {`Explore our ${categorySlug} collection`}
        </PageHeaderDescription>
      </PageHeader>
      <Products
        products={productsTransaction.data}
        pageCount={productsTransaction.pageCount}
        category={categoryData}
        subcategories={subcategories}
      />
    </Shell>
  )
}
