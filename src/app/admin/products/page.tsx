import * as React from "react"
import Link from "next/link"
import { getStoreId } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { getProducts, getCategories } from "@/lib/queries/product"
import { ProductsTable } from "@/components/tables/products-table"

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}) {
  const storeId = await getStoreId()
  
  const productsPromise = getProducts({
    ...searchParams,
    store_ids: storeId,
    active: 'false',
  })
  const categoriesPromise = getCategories()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold italic tracking-tight">Products</h2>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
      
      <React.Suspense fallback={<div>Loading...</div>}>
        <ProductsTable
          promise={productsPromise}
          categoriesPromise={categoriesPromise}
          storeId={storeId}
        />
      </React.Suspense>
    </div>
  )
}
