import { NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Decodes a JWT payload (base64url) and reads the AMR claim.
 * Supabase stamps password-recovery sessions with amr: [{method:"otp"}].
 * OAuth sessions get [{method:"oauth"}], password logins get [{method:"password"}].
 */
function isRecoveryToken(accessToken: string): boolean {
  try {
    const [, payloadB64] = accessToken.split(".")
    if (!payloadB64) return false
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf-8")
    ) as { amr?: Array<{ method: string }> }
    return (payload.amr ?? []).some((entry) => entry.method === "otp")
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as
    | "recovery"
    | "signup"
    | "email"
    | null
  const next = searchParams.get("next") ?? "/"

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Handle PKCE flow (code exchange)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session) {
      // Detect password recovery via JWT AMR claim or explicit type param.
      // Recovery sessions have amr: [{method: "otp"}].
      const isRecovery =
        type === "recovery" || isRecoveryToken(data.session.access_token)

      if (isRecovery) {
        return NextResponse.redirect(`${origin}/signin/update-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Handle token_hash flow (older email links / non-PKCE)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/signin/update-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to sign-in with an error message
  return NextResponse.redirect(
    `${origin}/signin?error=Could+not+authenticate+user`
  )
}

