import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { units } from "./units";

export const unitType = pgTable("unit_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const unitTypeRelations = relations(unitType, ({ one, many }) => ({
  units: many(units),
}));
