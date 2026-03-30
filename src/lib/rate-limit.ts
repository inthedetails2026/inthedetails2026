/** Simple rate-limit helper that is a no-op when Upstash Redis is not configured. */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL ?? ""
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? ""

const isUpstashConfigured =
  UPSTASH_URL.length > 0 &&
  !UPSTASH_URL.includes("YOUR_UPSTASH") &&
  UPSTASH_TOKEN.length > 0 &&
  !UPSTASH_TOKEN.includes("•••")

type RateLimitResult = { success: boolean }

export const ratelimit = {
  limit: async (_id: string): Promise<RateLimitResult> => {
    if (!isUpstashConfigured) {
      // Upstash not configured — skip rate limiting
      return { success: true }
    }

    const { Ratelimit } = await import("@upstash/ratelimit")
    const { Redis } = await import("@upstash/redis")

    const limiter = new Ratelimit({
      redis: new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      prefix: "intothedetails/ratelimit",
    })

    return limiter.limit(_id)
  },
}

