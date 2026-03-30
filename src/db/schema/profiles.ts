import { pgTable, text, varchar } from "drizzle-orm/pg-core"

import { generateId } from "@/lib/id"

import { lifecycleDates } from "./utils"

export const profiles = pgTable("profiles", {
  id: varchar("id", { length: 30 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().unique(), // uuid v4 from supabase auth
  email: text("email").notNull(),
  name: text("name"),
  ...lifecycleDates,
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
