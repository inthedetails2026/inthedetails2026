import { getCategories } from "@/lib/queries/product"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { AddCategoryForm } from "./_components/add-category-form"

export default async function NewCategoryPage() {
  const categories = await getCategories()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Add Category</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Main Category</CardTitle>
            <CardDescription>
              A top level category that shows in the header navigation (e.g.
              Lighting, Furniture).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddCategoryForm type="category" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Subcategory</CardTitle>
            <CardDescription>
              A nested category that belongs to a Main Category (e.g. Couches
              belongs to Furniture).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddCategoryForm type="subcategory" categories={categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
