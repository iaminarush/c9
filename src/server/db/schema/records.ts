import { relations } from "drizzle-orm";
import { decimal, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  price: decimal("price").notNull(),
  description: text("description"),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recordsRelations = relations(records, ({ many, one }) => ({}));
