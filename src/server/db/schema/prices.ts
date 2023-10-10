import { relations } from "drizzle-orm";
import { bigint, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { items } from "./items";

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  price: bigint("price", { mode: "number" }).notNull(),
  time: timestamp("timestamp").defaultNow(),
});

export const pricesRelations = relations(prices, ({ one }) => ({
  item: one(items, {
    fields: [prices.id],
    references: [items.id],
  }),
  // stores: many(stores),
}));
