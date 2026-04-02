import * as React from "react"
import { redirect } from "next/navigation"

import { getCategories, getFeaturedProducts } from "@/lib/queries/product"

import { Lobby } from "./_components/lobby"
import { LobbySkeleton } from "./_components/lobby-skeleton"

interface IndexPageProps {
  searchParams: { code?: string; token_hash?: string; type?: string }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  // Safety net: if Supabase redirects an auth code to the root instead of
  // /auth/callback, forward it correctly so the reset-password flow works.
  if (searchParams.code) {
    const params = new URLSearchParams({ code: searchParams.code })
    if (searchParams.type) params.set("type", searchParams.type)
    redirect(`/auth/callback?${params.toString()}`)
  }
  if (searchParams.token_hash && searchParams.type) {
    const params = new URLSearchParams({
      token_hash: searchParams.token_hash,
      type: searchParams.type,
    })
    redirect(`/auth/callback?${params.toString()}`)
  }

  /**
   * To avoid sequential waterfall requests, multiple promises are passed to fetch data parallelly.
   * These promises are also passed to the `Lobby` component, making them hot promises. This means they can execute without being awaited, further preventing sequential requests.
   * @see https://www.youtube.com/shorts/A7GGjutZxrs
   * @see https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-data-fetching
   */
  const productsPromise = getFeaturedProducts()
  const categoriesPromise = getCategories()

  return (
    <React.Suspense fallback={<LobbySkeleton />}>
      <Lobby
        productsPromise={productsPromise}
        categoriesPromise={categoriesPromise}
      />
    </React.Suspense>
  )
}
