import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStore } from "@/lib/store"
import { UpdateStoreForm } from "./_components/update-store-form"
import { Icons } from "@/components/icons"

export const metadata = {
  title: "Settings",
  description: "Manage store settings",
}

export default async function SettingsPage() {
  const store = await getStore()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle as="h2" className="text-2xl">
            Settings
          </CardTitle>
          <CardDescription>
            Manage your store's settings and configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateStoreForm store={store} />
        </CardContent>
      </Card>
    </div>
  )
}
