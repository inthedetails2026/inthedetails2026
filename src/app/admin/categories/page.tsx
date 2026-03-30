import * as React from "react"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { Edit2, Plus, Trash2 } from "lucide-react"

import { getCategories, getSubcategories } from "@/lib/queries/product"
import { deleteCategory, deleteSubcategory } from "@/lib/actions/category"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteCategoryButton } from "./_components/delete-buttons"

export default async function AdminCategoriesPage() {
  noStore()
  const categories = await getCategories()
  const subcategories = await getSubcategories()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <div className="flex items-center space-x-2">
          <Link href="/admin/categories/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category / Subcategory
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Main Categories</CardTitle>
            <CardDescription>
              Top-level categories shown in the navigation bar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Link href={`/admin/categories/${category.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <DeleteCategoryButton id={category.id!} type="category" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subcategories</CardTitle>
            <CardDescription>
              Nested categories used for specific filtering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent Category (ID)</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No subcategories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subcategories.map((sub) => {
                    const parent = categories.find((c) => c.id === sub.categoryId)

                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.name}</TableCell>
                        <TableCell>{parent?.name ?? sub.categoryId}</TableCell>
                        <TableCell>
                          <DeleteCategoryButton id={sub.id!} type="subcategory" />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
