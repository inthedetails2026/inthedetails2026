import { NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

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
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (type === "recovery") {
        // Redirect to update-password page after recovery
        return NextResponse.redirect(`${origin}/signin/update-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Handle token_hash flow (older email links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/signin/update-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong, redirect to error page with message
  return NextResponse.redirect(
    `${origin}/signin?error=Could+not+authenticate+user`
  )
}
