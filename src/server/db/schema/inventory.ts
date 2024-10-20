import {
  boolean,
  decimal,
  integer,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { items } from "./items";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  expiryDate: timestamp("expiry_date", {
    mode: "string",
    withTimezone: true,
  }),
  itemId: integer("item_id").notNull(),
  quantity: decimal("quantity").notNull(),
  complete: boolean("complete").notNull().default(false),
});

export const inventoryRelations = relations(inventory, ({ one }) => ({
  item: one(items, {
    fields: [inventory.itemId],
    references: [items.id],
  }),
}));

export const inventorySchema = createSelectSchema(inventory);

export const createInventorySchema = createInsertSchema(inventory);

export const updateInventorySchema = inventorySchema.partial();
