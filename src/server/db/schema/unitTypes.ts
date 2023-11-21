import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { records } from "./records";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const unitTypes = pgTable("unit_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const unitTypesRelations = relations(unitTypes, ({ many }) => ({
  // units: many(units),
  records: many(records),
}));

export const unitTypesSchema = createSelectSchema(unitTypes);

export const createUnitTypesSchema = createInsertSchema(unitTypes);
