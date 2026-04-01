import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ContentSection } from "@/components/content-section"
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { Shell } from "@/components/shell"
import { StoreCardSkeleton } from "@/components/store-card-skeleton"

import { CategoryCardSkeleton } from "./category-card-skeleton"

export function LobbySkeleton() {
  return (
    <Shell className="max-w-6xl gap-0">
      <PageHeader
        as="section"
        className="mx-auto items-center gap-2 text-center"
        withPadding
      >
        <Skeleton className="h-7 w-44 rounded-full" />
        <PageHeaderHeading
          className="animate-fade-up font-brand text-7xl sm:text-8xl md:text-9xl"
          style={{ animationDelay: "0.20s", animationFillMode: "both" }}
        >
          {siteConfig.name}
        </PageHeaderHeading>
        <PageHeaderDescription
          className="max-w-[46.875rem] animate-fade-up"
          style={{ animationDelay: "0.30s", animationFillMode: "both" }}
        >
          Where unique design meets everyday living.
        </PageHeaderDescription>
        <PageActions
          className="animate-fade-up"
          style={{ animationDelay: "0.40s", animationFillMode: "both" }}
        >
          <Link href="/products" className={cn(buttonVariants())}>
            Shop now
          </Link>
        </PageActions>
      </PageHeader>
      <section className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </section>
      <ContentSection
        title="Featured products"
        description="Handpicked pieces for a more beautiful home"
        href="/products"
        linkText="View all products"
        className="pt-14 md:pt-20 lg:pt-24"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </ContentSection>
    </Shell>
  )
}
