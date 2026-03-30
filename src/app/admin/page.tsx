import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStore } from "@/lib/store"
import { getSaleCount, getOrderCount } from "@/lib/actions/order"
import { formatPrice } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const store = await getStore()
  
  const [revenue, sales] = await Promise.all([
    getSaleCount({ storeId: store.id }),
    getOrderCount({ storeId: store.id })
  ])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <p className="text-muted-foreground">Managing: {store.name}</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{sales}</div>
          </CardContent>
        </Card>
        {/* More stats... */}
      </div>
    </div>
  )
}
