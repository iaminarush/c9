import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { records } from "./records";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { unitFamilies } from "./unitFamilies";
import { Mass, Volume } from "convert";
import { z } from "zod";

// const unitTypesString: Array<Mass | Volume> = ["g"];
// const unitTypesString = ["g"] satisfies Array<Mass | Volume>;

export const unitTypes = pgTable("unit_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique().$type<Mass | Volume>(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  unitFamilyId: integer("unit_family_id").notNull(),
});

export const unitTypesRelations = relations(unitTypes, ({ one, many }) => ({
  records: many(records),
  unitFamily: one(unitFamilies, {
    fields: [unitTypes.unitFamilyId],
    references: [unitFamilies.id],
  }),
}));

export const unitTypesSchema = createSelectSchema(unitTypes);

export const createUnitTypesSchema = createInsertSchema(unitTypes);
