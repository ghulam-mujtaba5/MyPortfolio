// lib/validation/schemas.js
import { z } from "zod";

// Helper: allow common image URL patterns beyond strict absolute URLs
const isLooseImageUrl = (val) => {
  if (typeof val !== "string") return false;
  const v = val.trim();
  if (v === "") return true; // empty allowed separately
  // Absolute http(s)
  if (/^https?:\/\//i.test(v)) return true;
  // Protocol-relative
  if (/^\/\//.test(v)) return true;
  // Root-relative path
  if (/^\//.test(v)) return true;
  // Data URL (base64)
  if (/^data:image\//i.test(v)) return true;
  // Blob URL (used by browsers for temp previews)
  if (/^blob:/.test(v)) return true;
  // File-like path or URL ending with common image extensions (even without protocol)
  if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(v)) return true;
  return false;
};

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
  // Accept either CSV string from form or array from API consumers
  tags: z
    .union([
      z.string().min(1, "At least one tag is required."),
      z.array(z.string()).min(1, "At least one tag is required."),
    ]),
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
  image: z
    .string()
    .trim()
    .refine((v) => v === "" || isLooseImageUrl(v), {
      message: "Invalid URL for image.",
    })
    .optional(),
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
    .trim()
    .refine((v) => v === "" || isLooseImageUrl(v), {
      message: "Invalid URL for OG image.",
    })
    .optional(),
  // Accept ISO datetime, HTML datetime-local (YYYY-MM-DDTHH:mm), empty string, or null
  scheduledAt: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/i, "Invalid date & time."),
      z.string().datetime(),
      z.literal(""),
      z.null()
    ])
    .optional(),
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
