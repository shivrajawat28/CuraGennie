import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  rating: real("rating").notNull().default(4.5),
  location: text("location").notNull(),
  distance: text("distance"),
  image: text("image").notNull(),
  availability: text("availability").notNull(),
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

export const healthArticles = pgTable("health_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  readTime: text("read_time").notNull(),
  image: text("image").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull().default("Cura Gennie Health Team"),
  publishedDate: text("published_date").notNull(),
});

export const insertHealthArticleSchema = createInsertSchema(healthArticles).omit({
  id: true,
});

export type InsertHealthArticle = z.infer<typeof insertHealthArticleSchema>;
export type HealthArticle = typeof healthArticles.$inferSelect;
