import { unstable_noStore as noStore } from "next/cache"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"

import { EditCategoryForm } from "@/app/admin/categories/_components/edit-category-form"

interface EditCategoryPageProps {
  params: Promise<{
    categoryId: string
  }>
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  noStore()
  const { categoryId: rawId } = await params
  const categoryId = decodeURIComponent(rawId)

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Category</h2>
      </div>
      <EditCategoryForm category={category} />
    </div>
  )
}
