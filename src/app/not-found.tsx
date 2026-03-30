import { Shell } from "@/components/shell"
import { PageHeader, PageHeaderHeading, PageHeaderDescription, PageActions } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <main className="flex-1">
        <Shell>
          <PageHeader>
            <PageHeaderHeading>Page not found</PageHeaderHeading>
            <PageHeaderDescription>
              The page you are looking for does not exist.
            </PageHeaderDescription>
            <PageActions>
              <Link href="/" className={cn(buttonVariants())}>
                Go to Home
              </Link>
            </PageActions>
          </PageHeader>
        </Shell>
      </main>
    </div>
  )
}
