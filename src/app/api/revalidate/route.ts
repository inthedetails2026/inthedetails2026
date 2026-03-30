import { revalidatePath } from "next/cache"
import { env } from "@/env"

export async function GET() {
  if (env.NODE_ENV !== "development") {
    return Response.json({ message: "Not allowed" }, { status: 403 })
  }

  revalidatePath("/")
  revalidatePath("/admin/products")
  import("next/cache").then(({ revalidateTag }) => {
    revalidateTag("featured-products")
    revalidateTag("categories-v2")
  })

  return new Response("revalidated everything", { status: 200 })
}
