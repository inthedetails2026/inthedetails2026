import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryCardSkeleton() {
  return (
    <Card className="relative h-full overflow-hidden rounded-xl border-none">
      <AspectRatio ratio={1}>
        <Skeleton className="size-full" />
      </AspectRatio>
      <div className="absolute bottom-0 p-6 space-y-2 w-full">
        <Skeleton className="h-6 w-1/2 bg-white/20" />
        <Skeleton className="h-4 w-5/6 bg-white/20" />
        <Skeleton className="h-4 w-1/4 bg-white/20 mt-4" />
      </div>
    </Card>
  )
}
