import type { Metadata } from "next"
import { env } from "@/env.js"

import { getProducts, getCategoryBySlug, getSubcategoriesByCategory } from "@/lib/queries/product"
import { getStores } from "@/lib/queries/store"
import { slugify, toTitleCase, unslugify } from "@/lib/utils"
import { productsSearchParamsSchema } from "@/lib/validations/params"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Products } from "@/components/products"
import { Shell } from "@/components/shell"

interface SubcategoryPageProps {
  params: {
    category: string
    subcategory: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export function generateMetadata({ params }: SubcategoryPageProps): Metadata {
  const subcategory = unslugify(params.subcategory)

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: toTitleCase(subcategory),
    description: `Buy the best ${subcategory}`,
  }
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { category, subcategory } = params
  
  const categorySlug = slugify(category)
  const subcategorySlug = slugify(subcategory)

  const categoryData = await getCategoryBySlug({ slug: categorySlug })

  const productsTransaction = await getProducts({
    ...searchParams,
    categories: categoryData?.id,
    subcategory: subcategorySlug,
  })

  const subcategories = categoryData
    ? await getSubcategoriesByCategory({ categoryId: categoryData.id })
    : []

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">
          {toTitleCase(unslugify(subcategory))}
        </PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {`Explore our ${unslugify(subcategory)} collection`}
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
