import "server-only"

import {
  unstable_cache as cache,
  unstable_noStore as noStore,
} from "next/cache"
import { db } from "@/db"
import {
  categories,
  products,
  stores,
  subcategories,
  type Product,
} from "@/db/schema"
import type { SearchParams } from "@/types"
import { and, asc, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm"

import { getProductsSchema } from "@/lib/validations/product"

// See the unstable_cache API docs: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
export async function getFeaturedProducts() {
  return await cache(
    async () => {
      return db
        .select({
          id: products.id,
          name: products.name,
          images: products.images,
          category: categories.name,
          price: products.price,
          inventory: products.inventory,
        })
        .from(products)
        .limit(8)
        .leftJoin(stores, eq(products.storeId, stores.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .groupBy(products.id, categories.name)
        .orderBy(

          desc(count(products.images)),
          desc(products.createdAt)
        )
    },
    ["featured-products"],
    {
      revalidate: 3600, // every hour
      tags: ["featured-products"],
    }
  )()
}

// See the unstable_noStore API docs: https://nextjs.org/docs/app/api-reference/functions/unstable_noStore
export async function getProducts(input: SearchParams) {
  noStore()

  try {
    const search = getProductsSchema.parse(input)

    const limit = search.per_page
    const offset = (search.page - 1) * limit

    const [column, order] = (search.sort?.split(".") as [
      keyof Product | undefined,
      "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"]
    const [minPrice, maxPrice] = (Array.isArray(search.price_range) ? search.price_range[0] : search.price_range)?.split("-") ?? []
    const categoriesParam = (Array.isArray(search.categories) ? search.categories[0] : search.categories)?.split(".") ?? []
    const subcategoriesParam = (Array.isArray(search.subcategories) ? search.subcategories[0] : search.subcategories)?.split(".") ?? []
    const storeIds = (Array.isArray(search.store_ids) ? search.store_ids[0] : search.store_ids)?.split(".") ?? []
    const activeParam = Array.isArray(search.active) ? search.active[0] : search.active
    const active = activeParam === "true"

    const navbarSubcategorySlug = Array.isArray(search.subcategory) ? search.subcategory[0] : search.subcategory

    const [data, total] = await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          images: products.images,
          category: categories.name,
          subcategory: subcategories.name,
          price: products.price,
          inventory: products.inventory,
          rating: products.rating,
          storeId: products.storeId,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .limit(limit)
        .offset(offset)
        .leftJoin(stores, eq(products.storeId, stores.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
        .where(
          and(
            categoriesParam.length > 0
              ? inArray(products.categoryId, categoriesParam)
              : undefined,
            subcategoriesParam.length > 0
              ? inArray(products.subcategoryId, subcategoriesParam)
              : undefined,
            navbarSubcategorySlug
              ? sql`lower(${subcategories.slug}) LIKE ${"%" + navbarSubcategorySlug.toLowerCase().replace(/s$/, "") + "%"}`
              : undefined,
            minPrice ? gte(products.price, minPrice) : undefined,
            maxPrice ? lte(products.price, maxPrice) : undefined,
            storeIds.length ? inArray(products.storeId, storeIds) : undefined,
            active === true
              ? sql`(${stores.stripeAccountId}) is not null`
              : undefined
          )
        )
        .orderBy(
          column && column in products
            ? order === "asc"
              ? asc(products[column])
              : desc(products[column])
            : desc(products.createdAt)
        ),
      db
        .select({
          count: count(products.id),
        })
        .from(products)
        .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
        .where(
          and(
            categoriesParam.length > 0
              ? inArray(products.categoryId, categoriesParam)
              : undefined,
            subcategoriesParam.length > 0
              ? inArray(products.subcategoryId, subcategoriesParam)
              : undefined,
            navbarSubcategorySlug
              ? sql`lower(${subcategories.slug}) LIKE ${"%" + navbarSubcategorySlug.toLowerCase().replace(/s$/, "") + "%"}`
              : undefined,
            minPrice ? gte(products.price, minPrice) : undefined,
            maxPrice ? lte(products.price, maxPrice) : undefined,
            storeIds.length ? inArray(products.storeId, storeIds) : undefined
          )
        )
        .execute()
        .then((res) => res[0]?.count ?? 0),
    ])

    const pageCount = Math.ceil(total / limit)

    return {
      data,
      pageCount,
    }
  } catch (err) {
    return {
      data: [],
      pageCount: 0,
    }
  }
}

export async function getProductCountByCategory({
  categoryId,
}: {
  categoryId: string
}) {
  return await cache(
    async () => {
      return db
        .select({
          count: count(products.id),
        })
        .from(products)
        .where(eq(products.categoryId, categoryId))
        .execute()
        .then((res) => res[0]?.count ?? 0)
    },
    [`product-count-${categoryId}`],
    {
      revalidate: 3600, // every hour
      tags: [`product-count-${categoryId}`],
    }
  )()
}

export async function getCategories() {
  return await cache(
    async () => {
      return db
        .selectDistinct({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          image: categories.image,
        })
        .from(categories)
        .orderBy(desc(categories.name))
    },
    ["categories-v2"],
    {
      revalidate: 3600, // every hour
      tags: ["categories-v2"],
    }
  )()
}

export async function getCategoryBySlug({ slug }: { slug: string }) {
  return await cache(
    async () => {
      return db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          image: categories.image,
        })
        .from(categories)
        .where(sql`${categories.slug} ILIKE ${slug}`)
        .execute()
        .then((res) => res[0])
    },
    [`category-${slug}`],
    {
      revalidate: 3600, // every hour
      tags: [`category-${slug}`],
    }
  )()
}

export async function getSubcategories() {
  return await cache(
    async () => {
      return db
        .selectDistinct({
          id: subcategories.id,
          name: subcategories.name,
          slug: subcategories.slug,
          description: subcategories.description,
          categoryId: subcategories.categoryId,
        })
        .from(subcategories)
    },
    ["subcategories"],
    {
      revalidate: 3600, // every hour
      tags: ["subcategories"],
    }
  )()
}

export async function getSubcategorySlugFromId({ id }: { id: string }) {
  return await cache(
    async () => {
      return db
        .select({
          slug: subcategories.slug,
        })
        .from(subcategories)
        .where(eq(subcategories.id, id))
        .execute()
        .then((res) => res[0]?.slug)
    },
    [`subcategory-slug-${id}`],
    {
      revalidate: 3600, // every hour
      tags: [`subcategory-slug-${id}`],
    }
  )()
}

export async function getSubcategoriesByCategory({
  categoryId,
}: {
  categoryId: string
}) {
  return await cache(
    async () => {
      return db
        .selectDistinct({
          id: subcategories.id,
          name: subcategories.name,
          slug: subcategories.slug,
          description: subcategories.description,
        })
        .from(subcategories)
        .where(eq(subcategories.categoryId, categoryId))
    },
    [`subcategories-${categoryId}`],
    {
      revalidate: 3600, // every hour
      tags: [`subcategories-${categoryId}`],
    }
  )()
}
