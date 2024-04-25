import { relations } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { unitTypes } from "./unitTypes";
import { createSelectSchema } from "drizzle-zod";

export const unitFamilies = pgTable("unit_families", {
  id: serial("id").primaryKey(),
  name: text("name", { enum: ["Mass", "Volume", "Area"] })
    .notNull()
    .unique(),
});

export const unitFamiliesRelations = relations(unitFamilies, ({ many }) => ({
  unitTypes: many(unitTypes),
}));

export const unitFamilySchema = createSelectSchema(unitFamilies);
