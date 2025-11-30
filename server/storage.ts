import { 
  users, 
  doctors,
  healthArticles,
  type User, 
  type InsertUser,
  type Doctor,
  type InsertDoctor,
  type HealthArticle,
  type InsertHealthArticle
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Doctor methods
  getAllDoctors(): Promise<Doctor[]>;
  getDoctorsBySpecialty(specialty: string): Promise<Doctor[]>;
  getDoctorById(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  // Health Article methods
  getAllArticles(): Promise<HealthArticle[]>;
  getArticleById(id: number): Promise<HealthArticle | undefined>;
  getArticlesByCategory(category: string): Promise<HealthArticle[]>;
  createArticle(article: InsertHealthArticle): Promise<HealthArticle>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors);
  }

  async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    return await db.select().from(doctors).where(ilike(doctors.specialty, `%${specialty}%`));
  }

  async getDoctorById(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db
      .insert(doctors)
      .values(insertDoctor)
      .returning();
    return doctor;
  }

  async getAllArticles(): Promise<HealthArticle[]> {
    return await db.select().from(healthArticles);
  }

  async getArticleById(id: number): Promise<HealthArticle | undefined> {
    const [article] = await db.select().from(healthArticles).where(eq(healthArticles.id, id));
    return article || undefined;
  }

  async getArticlesByCategory(category: string): Promise<HealthArticle[]> {
    return await db.select().from(healthArticles).where(ilike(healthArticles.category, `%${category}%`));
  }

  async createArticle(insertArticle: InsertHealthArticle): Promise<HealthArticle> {
    const [article] = await db
      .insert(healthArticles)
      .values(insertArticle)
      .returning();
    return article;
  }
}

export const storage = new DatabaseStorage();
