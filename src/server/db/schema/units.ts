import { relations } from "drizzle-orm";
import { bigint, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { records } from "./records";

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  remark: text("remark"),
  amount: bigint("amount", { mode: "number" }).notNull(),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const unitsRelations = relations(units, ({ one, many }) => ({
  records: many(records),
}));
