import { date, integer, pgTable, serial } from "drizzle-orm/pg-core";
import { items } from "./items";
import { relations } from "drizzle-orm";

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  expiryDate: date("expiry_date"),
  item: integer("item_id").references(() => items.id, {
    onDelete: "set null",
  }),
});

export const inventoryRelations = relations(inventory, ({ one }) => ({
  item: one(items, {
    fields: [inventory.item],
    references: [items.id],
  }),
}));
