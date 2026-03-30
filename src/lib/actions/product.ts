"use server"

import {
  unstable_noStore as noStore,
  revalidatePath,
  revalidateTag,
} from "next/cache"
import { db } from "@/db"
import { products } from "@/db/schema"
import type { StoredFile } from "@/types"
import { and, eq } from "drizzle-orm"
import { type z } from "zod"

import { getErrorMessage } from "@/lib/handle-error"
import {
  type CreateProductSchema,
  type createProductSchema,
  type updateProductRatingSchema,
} from "@/lib/validations/product"

export async function filterProducts({ query }: { query: string }) {
  noStore()
  try {
    if (query.length === 0) {
      return {
        data: null,
        error: null,
      }
    }

    const categoriesWithProducts = await db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        products: {
          where: (table, { sql }) =>
            sql`lower(${table.name}) LIKE ${"%" + query.toLowerCase() + "%"}`,
          columns: {
            id: true,
            name: true,
          },
        },
      },
    })

    return {
      data: categoriesWithProducts.filter((c) => c.products.length > 0),
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function addProduct(
  input: Omit<CreateProductSchema, "images"> & {
    storeId: string
    images: StoredFile[]
  }
) {
  try {
    const productWithSameName = await db.query.products.findFirst({
      columns: {
        id: true,
      },
      where: eq(products.name, input.name),
    })

    if (productWithSameName) {
      throw new Error("Product name already taken.")
    }

    await db.insert(products).values({
      ...input,
      images: input.images,
    })

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidateTag("featured-products")
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

export async function updateProduct(
  input: Omit<z.infer<typeof createProductSchema>, "images"> & {
    id: string
    storeId: string
    images: StoredFile[]
  }
) {
  try {
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, input.id),
        eq(products.storeId, input.storeId)
      ),
    })

    if (!product) {
      throw new Error("Product not found.")
    }

    await db
      .update(products)
      .set({
        ...input,
        images: input.images,
      })
      .where(eq(products.id, input.id))

    revalidatePath(`/admin/products/${input.id}`)
    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidateTag("featured-products")
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

export async function updateProductRating(
  input: z.infer<typeof updateProductRatingSchema>
) {
  try {
    const product = await db.query.products.findFirst({
      columns: {
        id: true,
        rating: true,
      },
      where: eq(products.id, input.id),
    })

    if (!product) {
      throw new Error("Product not found.")
    }

    await db
      .update(products)
      .set({ rating: input.rating })
      .where(eq(products.id, input.id))

    revalidatePath("/")

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

export async function deleteProduct(input: { id: string; storeId: string }) {
  try {
    const product = await db.query.products.findFirst({
      columns: {
        id: true,
      },
      where: and(
        eq(products.id, input.id),
        eq(products.storeId, input.storeId)
      ),
    })

    if (!product) {
      throw new Error("Product not found.")
    }

    await db.delete(products).where(eq(products.id, input.id))

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidateTag("featured-products")
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
