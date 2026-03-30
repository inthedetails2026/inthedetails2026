import { getCategories, getSubcategories } from "@/lib/queries/product"
import { getStoreId } from "@/lib/store"

import { AddProductForm } from "../_components/add-product-form"

export default async function NewProductPage() {
  const storeId = await getStoreId()
  const promises = Promise.all([getCategories(), getSubcategories()]).then(
    ([categories, subcategories]) => ({ categories, subcategories })
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Product</h2>
        <p className="text-muted-foreground">
          Add a new product to your store.
        </p>
      </div>
      <AddProductForm storeId={storeId} promises={promises} />
    </div>
  )
}
