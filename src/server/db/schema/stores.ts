import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { prices } from "./prices";
import { records } from "./records";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storesRelations = relations(stores, ({ one, many }) => ({
  records: many(records),
}));
