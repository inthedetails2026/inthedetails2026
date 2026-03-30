import * as React from "react"
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { addresses, orders, products, stores, type Order } from "@/db/schema"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"
import { and, asc, desc, eq, gte, inArray, like, lte, sql } from "drizzle-orm"

import { getStoreId } from "@/lib/store"
import { ordersSearchParamsSchema } from "@/lib/validations/params"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { OrdersTable } from "@/components/tables/orders-table"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Orders",
  description: "Manage your orders",
}

interface OrdersPageProps {
  searchParams: SearchParams
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const storeId = await getStoreId()

  const { page, per_page, sort, customer, status, from, to } =
    ordersSearchParamsSchema.parse(searchParams)

  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
    columns: {
      id: true,
      name: true,
    },
  })

  if (!store) {
    notFound()
  }

  // Fallback page for invalid page numbers

  const fallbackPage = isNaN(page) || page < 1 ? 1 : page
  // Number of items per page
  const limit = isNaN(per_page) ? 10 : per_page
  // Number of items to skip
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0
  // Column and order to sort by
  const [column, order] = (sort.split(".") as [
    keyof Order | undefined,
    "asc" | "desc" | undefined,
  ]) ?? ["createdAt", "desc"]

  const statuses = status ? status.split(".") : []

  const fromDay = from ? new Date(from) : undefined
  const toDay = to ? new Date(to) : undefined

  // Transaction is used to ensure both queries are executed in a single transaction
  noStore()
  const ordersPromise = db.transaction(async (tx) => {
    try {
      console.log("DEBUG: Admin Fetching Orders for Store ID:", storeId)
      const data = await tx
        .select({
          id: orders.id,
          storeId: orders.storeId,
          quantity: orders.quantity,
          amount: orders.amount,
          paymentIntentId: orders.stripePaymentIntentId,
          status: orders.stripePaymentIntentStatus,
          customer: orders.email,
          name: orders.name,
          items: orders.items,
          phone: addresses.phone,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(addresses, eq(orders.addressId, addresses.id))
        .limit(limit)
        .offset(offset)
        .where(
          and(
            eq(orders.storeId, storeId),
            // Filter by email
            customer ? like(orders.email, `%${customer}%`) : undefined,
            // Filter by status
            statuses.length > 0
              ? inArray(orders.stripePaymentIntentStatus, statuses)
              : undefined,
            // Filter by createdAt
            fromDay && toDay
              ? and(
                  gte(orders.createdAt, fromDay),
                  lte(orders.createdAt, toDay)
                )
              : undefined
          )
        )
        .orderBy(
          column && column in orders
            ? order === "asc"
              ? asc(orders[column])
              : desc(orders[column])
            : desc(orders.createdAt)
        )

      const count = await tx
        .select({
          count: sql<number>`count(*)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.storeId, storeId),
            // Filter by email
            customer ? like(orders.email, `%${customer}%`) : undefined,
            // Filter by status
            statuses.length > 0
              ? inArray(orders.stripePaymentIntentStatus, statuses)
              : undefined,
            // Filter by createdAt
            fromDay && toDay
              ? and(
                  gte(orders.createdAt, fromDay),
                  lte(orders.createdAt, toDay)
                )
              : undefined
          )
        )
        .execute()
        .then((res) => res[0]?.count ?? 0)

      const pageCount = Math.ceil(count / limit)

      const productIds = Array.from(
        new Set(
          data.flatMap(
            (order) =>
              (order.items as any[])?.map((item) => item.productId) ?? []
          )
        )
      )

      const productsMap = new Map<string, string>()
      if (productIds.length > 0) {
        const foundProducts = await tx
          .select({ id: products.id, name: products.name })
          .from(products)
          .where(inArray(products.id, productIds))

        foundProducts.forEach((p) => productsMap.set(p.id, p.name))
      }

      const enrichedData = data.map((order) => {
        const enhancedItems = ((order.items as any[]) ?? []).map((item) => ({
          ...item,
          name: productsMap.get(item.productId) ?? undefined,
        }))
        return {
          ...order,
          items: enhancedItems,
        }
      })

      return {
        data: enrichedData,
        pageCount,
      }
    } catch (err) {
      console.error(err)
      return {
        data: [],
        pageCount: 0,
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <DateRangePicker align="end" />
      </div>
      <React.Suspense fallback={<DataTableSkeleton columnCount={6} />}>
        <OrdersTable promise={ordersPromise} storeId={storeId} />
      </React.Suspense>
    </div>
  )
}
