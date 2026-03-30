import * as React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { orders, stores, profiles, addresses } from "@/db/schema"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"
import { and, asc, desc, eq, gte, like, lte, sql } from "drizzle-orm"

import { customersSearchParamsSchema } from "@/lib/validations/params"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { CustomersTable } from "@/components/tables/customers-table"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Customers",
  description: "Customers for your store",
}

import { getStoreId } from "@/lib/store"

interface CustomersPageProps {
  searchParams: SearchParams
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const storeId = await getStoreId()


  const { page, per_page, sort, email, from, to } =
    customersSearchParamsSchema.parse(searchParams)

  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
    columns: {
      id: true,
      name: true,
      description: true,
    },
  })

  if (!store) {
    notFound()
  }

  // Transaction is used to ensure both queries are executed in a single transaction
  const fallbackPage = isNaN(page) || page < 1 ? 1 : page
  // Number of items per page
  const limit = isNaN(per_page) ? 10 : per_page
  // Number of items to skip
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0

  const fromDay = from ? new Date(from) : undefined
  const toDay = to ? new Date(to) : undefined

  const customersPromise = db.transaction(async (tx) => {
    const data = await tx
      .select({
        name: profiles.name,
        email: profiles.email,
        line1: addresses.line1,
        city: addresses.city,
        state: addresses.state,
        country: addresses.country,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .leftJoin(addresses, eq(profiles.userId, addresses.userId))
      .limit(limit)
      .offset(offset)
      .where(
        and(
          email ? like(profiles.email, `%${email}%`) : undefined,
          fromDay && toDay
            ? and(gte(profiles.createdAt, fromDay), lte(profiles.createdAt, toDay))
            : undefined
        )
      )
      .orderBy(
        sort === "name.asc"
          ? asc(profiles.name)
          : sort === "name.desc"
            ? desc(profiles.name)
            : sort === "email.asc"
              ? asc(profiles.email)
              : sort === "email.desc"
                ? desc(profiles.email)
                : sort === "createdAt.asc"
                  ? asc(profiles.createdAt)
                  : sort === "createdAt.desc"
                    ? desc(profiles.createdAt)
                    : desc(profiles.createdAt)
      )

    const count = await tx
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(profiles)
      .where(
        and(
          email ? like(profiles.email, `%${email}%`) : undefined,
          fromDay && toDay
            ? and(gte(profiles.createdAt, fromDay), lte(profiles.createdAt, toDay))
            : undefined
        )
      )
      .execute()
      .then((res) => res[0]?.count ?? 0)

    return {
      data,
      pageCount: Math.ceil(count / limit),
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
        <DateRangePicker align="end" />
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton columnCount={5} filterableColumnCount={0} />
        }
      >
        <CustomersTable promise={customersPromise} />
      </React.Suspense>
    </div>
  )
}
