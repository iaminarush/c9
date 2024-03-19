import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { records } from "./records";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  image: text("image"),
});

export const storesRelations = relations(stores, ({ many }) => ({
  records: many(records),
}));

export const storeSchema = createSelectSchema(stores);

export const createStoreSchema = createInsertSchema(stores);

export const updateStoreSchema = createStoreSchema.partial();
