import { relations } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const storesRelations = relations(stores, ({ one, many }) => ({}));
