"use client"

import * as React from "react"
import Link from "next/link"
import { type Order } from "@/db/schema"
import type { DataTableFilterField, StripePaymentStatus } from "@/types"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { type ColumnDef } from "@tanstack/react-table"
import { Phone } from "lucide-react"

import {
  getStripePaymentStatusColor,
  stripePaymentStatuses,
} from "@/lib/checkout"
import { cn, formatDate, formatId, formatPrice } from "@/lib/utils"
import { useDataTable } from "@/hooks/use-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

type OrderItem = {
  productId: string
  price: number
  quantity: number
  name?: string
}

type AwaitedOrder = Pick<Order, "id" | "quantity" | "amount" | "createdAt"> & {
  customer: string | null
  name: string | null
  status: string
  paymentIntentId: string
  items: OrderItem[] | null
  phone: string | null
}

interface OrdersTableProps {
  promise: Promise<{
    data: AwaitedOrder[]
    pageCount: number
  }>
  storeId: string
  isSearchable?: boolean
}

export function OrdersTable({
  promise,
  storeId,
  isSearchable = true,
}: OrdersTableProps) {
  const { data, pageCount } = React.use(promise)

  const columns = React.useMemo<ColumnDef<AwaitedOrder, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order ID" />
        ),
        cell: ({ cell }) => (
          <span className="font-mono text-xs">
            {formatId(String(cell.getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Customer Name" />
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.original.name ?? row.original.customer ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.customer}
            </p>
            {row.original.phone && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="size-3" />
                {row.original.phone}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "items",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Items Purchased" />
        ),
        cell: ({ row }) => {
          const items = row.original.items
          if (!items || items.length === 0)
            return <span className="text-xs text-muted-foreground">—</span>
          return (
            <div className="space-y-1">
              {items.map((item, i) => (
                <div key={i} className="text-xs">
                  <span className="font-medium">
                    {item.name ?? `Product #${item.productId?.slice(0, 6)}`}
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    × {item.quantity} @ {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ cell }) => (
          <Badge
            variant="outline"
            className={cn(
              "pointer-events-none text-xs capitalize text-white",
              getStripePaymentStatusColor({
                status: cell.getValue() as StripePaymentStatus,
                shade: 600,
              })
            )}
          >
            {String(cell.getValue())}
          </Badge>
        ),
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Qty" />
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ cell }) => (
          <span className="font-semibold">
            {formatPrice(cell.getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ cell }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(cell.getValue() as Date)}
          </span>
        ),
        enableColumnFilter: false,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <DotsHorizontalIcon className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem asChild>
                <Link href={`/admin/orders/${row.original.id}`}>
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`https://dashboard.stripe.com/test/payments/${row.original.paymentIntentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Stripe
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [storeId]
  )

  const filterFields: DataTableFilterField<AwaitedOrder>[] = [
    {
      label: "Customer",
      value: "customer",
      placeholder: "Filter by email...",
    },
    {
      label: "Status",
      value: "status",
      options: stripePaymentStatuses,
    },
  ]

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    defaultSort: "createdAt.desc",
  })

  return <DataTable table={table} />
}
