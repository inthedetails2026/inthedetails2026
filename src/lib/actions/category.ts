"use server"

import {
  unstable_noStore as noStore,
  revalidatePath,
  revalidateTag,
} from "next/cache"
import { db } from "@/db"
import { categories, subcategories } from "@/db/schema"
import { eq } from "drizzle-orm"

import { getErrorMessage } from "@/lib/handle-error"
import { generateId } from "@/lib/id"
import { slugify } from "@/lib/utils"

export async function addCategory(input: {
  name: string
  description?: string
  image?: string
}) {
  try {
    const categoryWithSameName = await db.query.categories.findFirst({
      columns: { id: true },
      where: eq(categories.name, input.name),
    })

    if (categoryWithSameName) {
      throw new Error("Category name already taken.")
    }

    await db.insert(categories).values({
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      image: input.image,
    })

    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidateTag("categories-v2")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateCategory(input: {
  id: string
  name: string
  description?: string
  image?: string
}) {
  try {
    await db
      .update(categories)
      .set({
        name: input.name,
        slug: slugify(input.name),
        description: input.description,
        image: input.image,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, input.id))

    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidateTag("categories-v2")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function addSubcategory(input: {
  categoryId: string
  name: string
  description?: string
}) {
  try {
    const subWithSameName = await db.query.subcategories.findFirst({
      columns: { id: true },
      where: eq(subcategories.name, input.name),
    })

    if (subWithSameName) {
      throw new Error("Subcategory name already taken.")
    }

    await db.insert(subcategories).values({
      categoryId: input.categoryId,
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
    })

    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidateTag("subcategories")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteCategory(input: { id: string }) {
  try {
    await db.delete(categories).where(eq(categories.id, input.id))

    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidateTag("categories-v2")
    revalidateTag("subcategories")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteSubcategory(input: { id: string }) {
  try {
    await db.delete(subcategories).where(eq(subcategories.id, input.id))

    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidateTag("subcategories")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}
