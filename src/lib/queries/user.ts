import "server-only"

import { cache } from "react"
import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/db"
import { products, stores } from "@/db/schema"
import { count, countDistinct, eq } from "drizzle-orm"

import { getPlan } from "@/lib/actions/stripe"
import { getPlanLimits } from "@/lib/subscription"
import { createClient } from "@/lib/supabase/server"

const getSupabaseUser = async () => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const getCachedUser = cache(getSupabaseUser)

export async function getUserUsageMetrics(input: { userId: string }) {
  noStore()
  try {
    const data = await db
      .select({
        storeCount: countDistinct(stores.id),
        productCount: count(products.id),
      })
      .from(stores)
      .leftJoin(products, eq(stores.id, products.storeId))
      .where(eq(stores.userId, input.userId))
      .groupBy(stores.userId)
      .execute()
      .then((res) => res[0])

    return {
      storeCount: data?.storeCount ?? 0,
      productCount: data?.productCount ?? 0,
    }
  } catch (err) {
    return {
      storeCount: 0,
      productCount: 0,
    }
  }
}

export async function getUserPlanMetrics(input: { userId: string }) {
  noStore()

  const fallback = {
    storeCount: 0,
    storeLimit: 0,
    productCount: 0,
    productLimit: 0,
    storeLimitExceeded: false,
    productLimitExceeded: false,
    subscriptionPlan: null,
  }

  try {
    const subscriptionPlan = await getPlan({ userId: input.userId })

    if (!subscriptionPlan) {
      return fallback
    }

    const { storeCount, productCount } = await getUserUsageMetrics({
      userId: input.userId,
    })

    const { storeLimit, productLimit } = getPlanLimits({
      planId: subscriptionPlan.id,
    })

    const storeLimitExceeded = storeCount >= storeLimit
    const productLimitExceeded = productCount >= productLimit

    return {
      storeCount,
      storeLimit,
      productCount,
      productLimit,
      storeLimitExceeded,
      productLimitExceeded,
      subscriptionPlan,
    }
  } catch (err) {
    return fallback
  }
}
