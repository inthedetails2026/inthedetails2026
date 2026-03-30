import { db } from "@/db"
import { stores } from "@/db/schema"
import { asc, eq } from "drizzle-orm"

export async function getStore() {
  // First, try to find the canonical store by slug
  const canonicalStore = await db.query.stores.findFirst({
    where: eq(stores.slug, "in-the-details"),
  })

  if (canonicalStore) {
    return canonicalStore
  }

  // Fallback to the first available store (useful if slug was changed)
  const existingStore = await db.query.stores.findFirst({
    orderBy: (stores, { asc }) => [asc(stores.createdAt)],
  })

  if (existingStore) {
    return existingStore
  }

  // Create a default store if none exists
  // Using a placeholder userId as it is required by the schema
  const [newStore] = await db
    .insert(stores)
    .values({
      name: "in the details",
      slug: "in-the-details",
      description: "A premium store.",
      userId: "system-admin",
    })
    .returning()

  if (!newStore) {
    throw new Error("Failed to create default store")
  }

  return newStore
}

export async function getStoreId() {
  const store = await getStore()
  return store.id
}
