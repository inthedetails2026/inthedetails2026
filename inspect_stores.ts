import { db } from "./src/db"
import { stores } from "./src/db/schema"

async function main() {
  const allStores = await db.select().from(stores)
  console.log(JSON.stringify(allStores, null, 2))
}

main().catch(console.error)
