import Image from "next/image"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
      <Link
        href="/"
        className="absolute left-8 top-6 z-20 flex items-center font-brand text-2xl text-foreground/80 transition-colors hover:text-foreground"
      >
        <Icons.logo className="mr-2 size-6" aria-hidden="true" />
        <span>{siteConfig.name}</span>
      </Link>
      <main className="container flex items-center justify-center lg:p-8">
        {children}
      </main>
      <div className="relative hidden aspect-video size-full lg:block">
        <Image
          src="/images/categories/furniture.png"
          alt="Premium furniture collection"
          fill
          className="absolute inset-0 object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-black/80 lg:to-black/40" />
      </div>
    </div>
  )
}
