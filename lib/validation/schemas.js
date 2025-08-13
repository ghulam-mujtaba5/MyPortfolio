// lib/validation/schemas.js
import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

// Base schema for a project
export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long.")
    .max(100, "Title cannot exceed 100 characters."),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters long.")
    .optional(), // Comma-separated string
  tags: z.string().min(1, "At least one tag is required."), // Comma-separated string
  status: z
    .enum(["In Progress", "Completed", "Archived"])
    .optional()
    .default("In Progress"),
  links: z
    .object({
      live: z.string().url("Invalid URL.").or(z.literal("")).optional(),
      github: z.string().url("Invalid URL.").or(z.literal("")).optional(),
    })
    .optional(),
  image: z.string().url("Invalid URL for image.").or(z.literal("")).optional(),
  showImage: z.boolean().optional().default(true),
  published: z.boolean().optional().default(false),
  featuredOnHome: z.boolean().optional().default(false),
  // SEO Fields
  metaTitle: z
    .string()
    .trim()
    .max(70, "Meta title should not exceed 70 characters.")
    .optional(),
  metaDescription: z
    .string()
    .trim()
    .max(160, "Meta description should not exceed 160 characters.")
    .optional(),
  ogImage: z
    .string()
    .url("Invalid URL for OG image.")
    .or(z.literal(""))
    .optional(),
  scheduledAt: z.string().datetime().optional().or(z.literal("")).optional(),
});

// Specific schemas for creation and update
export const createProjectSchema = projectSchema; // full validation on create

// Allow partial fields on update and specifically allow description to be empty
export const updateProjectSchema = projectSchema.partial().extend({
  description: z.string().trim().optional(),
});

// You can create specific schemas for creation or updates if needed, for now, one schema is good.
// export const updateProjectSchema = projectSchema.partial();

// Schema for creating an article
export const articleSchema = z.object({
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(20),
  excerpt: z.string().trim().max(500).optional(),
  // Accept either CSV string from form or array from API consumers
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  categories: z.union([z.string(), z.array(z.string())]).optional(),
  published: z.boolean().optional(),
  coverImage: z.string().url().or(z.literal("")).optional(),
  coverImageAlt: z
    .string()
    .trim()
    .max(125, "Alt text should not exceed 125 characters.")
    .optional(),
  showCoverImage: z.boolean().optional(),
  slug: z.string().trim().optional(),
  // SEO Fields
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  ogImage: z.string().url().or(z.literal("")).optional(),
  // Accept ISO string, Date, empty string, or undefined
  publishAt: z
    .union([z.string().datetime(), z.date(), z.literal("")])
    .optional(),
});

// Schema for bulk actions
export const bulkActionSchema = z.object({
  ids: z.array(objectId).min(1, "At least one item must be selected."),
  action: z.enum(["publish", "draft", "delete"]),
});

// Allow partial updates for articles
export const updateArticleSchema = articleSchema.partial();

// Aliases expected by API routes
export const createArticleSchema = articleSchema;
export const articleBulkActionSchema = bulkActionSchema;
