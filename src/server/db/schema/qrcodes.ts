import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const qrcodes = pgTable("qrcodes", {
  id: serial("id").primaryKey(),
  data: text("data").notNull(),
  name: text("name").notNull(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  image: text("image"),
});

export const qrcodeSchema = createSelectSchema(qrcodes);

export const createQrcodeSchema = createInsertSchema(qrcodes);

export const updateQrcodeSchema = createQrcodeSchema.partial();
