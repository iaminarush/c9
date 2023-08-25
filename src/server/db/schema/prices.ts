import { bigint, pgTable, serial } from "drizzle-orm/pg-core";

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  price: bigint("price", { mode: "number" }).notNull(),
});
