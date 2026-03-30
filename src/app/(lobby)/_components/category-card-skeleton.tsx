import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryCardSkeleton() {
  return (
    <Card className="relative h-full overflow-hidden rounded-xl border-none">
      <AspectRatio ratio={1}>
        <Skeleton className="size-full" />
      </AspectRatio>
      <div className="absolute bottom-0 w-full space-y-2 p-6">
        <Skeleton className="h-6 w-1/2 bg-white/20" />
        <Skeleton className="h-4 w-5/6 bg-white/20" />
        <Skeleton className="mt-4 h-4 w-1/4 bg-white/20" />
      </div>
    </Card>
  )
}
