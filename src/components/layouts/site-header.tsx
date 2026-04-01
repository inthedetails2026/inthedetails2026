import type { MainNavItem } from "@/types"
import type { User } from "@supabase/supabase-js"

import { siteConfig } from "@/config/site"
import { getCategories, getSubcategories } from "@/lib/queries/product"
import { slugify } from "@/lib/utils"
import { CartSheet } from "@/components/checkout/cart-sheet"
import { AuthDropdown } from "@/components/layouts/auth-dropdown"
import { MainNav } from "@/components/layouts/main-nav"
import { MobileNav } from "@/components/layouts/mobile-nav"
import { ProductsCombobox } from "@/components/products-combobox"

interface SiteHeaderProps {
  user: User | null
}

export async function SiteHeader({ user }: SiteHeaderProps) {
  const categories = await getCategories()
  const subcategories = await getSubcategories()

  const dynamicMainNav: MainNavItem[] = categories.map((category) => ({
    title: String(category.name),
    items: [
      {
        title: "All",
        href: `/collections/${category.slug}`,
        description: `All ${category.name}.`,
        items: [],
      },
      ...subcategories
        .filter((sub) => sub.categoryId === category.id)
        .map((subcategory) => ({
          title: String(subcategory.name),
          href: `/collections/${category.slug}/${subcategory.slug}`,
          description: String(subcategory.description ?? ""),
          items: [],
        })),
    ],
  }))

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background font-heading">
      <div className="bg-yellow-100 py-1.5 text-center text-xs font-medium text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-400">
        Site under construction • Thanks for visiting!
      </div>
      <div className="container flex h-20 items-center">
        <MainNav items={dynamicMainNav} />
        <MobileNav items={dynamicMainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ProductsCombobox />
            <CartSheet />
            <AuthDropdown user={user} />
          </nav>
        </div>
      </div>
    </header>
  )
}
