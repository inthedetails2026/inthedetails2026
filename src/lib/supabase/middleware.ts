import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value }: any) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }: any) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = [
    "/",
    "/signin",
    "/signup",
    "/auth",
    "/products",
    "/collections",
    "/product",
    "/blog",
  ]
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`)
  )

  if (!user && !isPublicPath) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = "/signin"
    return NextResponse.redirect(url)
  }

  // Protect Admin Route specifically
  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    const userEmail =
      user.email ||
      user.user_metadata?.email ||
      user.identities?.[0]?.identity_data?.email
    if (userEmail !== "inthedetails2026@gmail.com") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally: return myNewResponse

  return supabaseResponse
}
