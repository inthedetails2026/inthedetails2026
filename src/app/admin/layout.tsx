import Link from "next/link"
import { ExternalLink, LayoutDashboard, Package, Settings, ShoppingCart, Users, Tags } from "lucide-react"

import { cn } from "@/lib/utils"
import { SignOutButton } from "./_components/sign-out-button"

interface AdminLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 hidden md:flex flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/admin" className="font-bold">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-all"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
        {/* Bottom actions */}
        <div className="border-t p-4 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <ExternalLink className="h-4 w-4" />
            View Store
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <header className="flex h-14 items-center border-b px-6">
          <h1 className="text-lg font-semibold">Store Management</h1>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              View Store
            </Link>
            <SignOutButton />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
