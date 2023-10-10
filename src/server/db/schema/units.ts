import { relations } from "drizzle-orm";
import {
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { records } from "./records";
import { unitType } from "./unitType";

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  remark: text("remark"),
  // amount: bigint("amount", { mode: "number" }).notNull(),
  amount: decimal("amount").notNull(),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  unitTypeId: integer("unit_type_id"),
});

export const unitsRelations = relations(units, ({ one, many }) => ({
  records: many(records),
  unitType: one(unitType, {
    fields: [units.unitTypeId],
    references: [unitType.id],
  }),
}));
