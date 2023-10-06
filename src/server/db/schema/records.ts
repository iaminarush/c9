import { relations } from "drizzle-orm";
import {
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { stores } from "./stores";

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  price: decimal("price").notNull(),
  description: text("description"),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  storeId: integer("store_id"),
});

export const recordsRelations = relations(records, ({ many, one }) => ({
  store: one(stores, {
    fields: [records.storeId],
    references: [stores.id],
  }),
}));
