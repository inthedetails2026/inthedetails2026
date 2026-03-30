import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"

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
