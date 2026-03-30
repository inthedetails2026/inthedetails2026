import { env } from "@/env.js"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

const connectionString = env.DATABASE_URL

declare global {
  var postgresClient: postgres.Sql | undefined
}

export const client = globalThis.postgresClient || postgres(connectionString, { prepare: false })
if (env.NODE_ENV !== "production") globalThis.postgresClient = client

export const db = drizzle(client, { schema })
