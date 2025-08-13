// scripts/seed-articles.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const slugify = require("slugify");
const ArticleModule = require("../models/Article");
const Article = ArticleModule.default || ArticleModule;

// Load env from .env.local
dotenv.config({ path: ".env.local" });

const articlesToSeed = [
  {
    title: "Building a Modern Portfolio with Next.js 15",
    excerpt:
      "A practical guide to structuring, theming, and optimizing a personal portfolio using Next.js 15 and a custom CMS.",
    content:
      "<p>In this article, we explore how to build a fast, accessible portfolio using Next.js 15, authenticated admin tools, and a dynamic CMS powering Projects and Articles.</p>" +
      "<p>We cover SSR/ISR decisions, design tokens, dark/light theming, and a MongoDB-backed content model.</p>",
    coverImage: "/og-image.png",
    tags: ["Next.js", "Portfolio", "CMS"],
    published: true,
  },
  {
    title: "Tiptap + Next.js: Rich Text Editing Done Right",
    excerpt:
      "Integrate a modern, theme-aware rich text editor (Tiptap) into your Next.js admin panel with SSR-safe configuration.",
    content:
      "<p>Tiptap provides a powerful editor with extensions, slash commands, and markdown shortcuts. We configure it for SSR and style it with CSS modules.</p>" +
      "<p>This walkthrough adds editor theming, image uploads via Cloudinary, and validation with Zod.</p>",
    coverImage: "/project-2.png",
    tags: ["Tiptap", "Editor", "Next.js"],
    published: true,
  },
  {
    title: "From Static Data to MongoDB: Migrating Projects",
    excerpt:
      "How to migrate hardcoded project cards into a MongoDB collection and manage them through a secure admin panel.",
    content:
      "<p>We design a Project schema, add slugs, seed initial data, and wire up server-side filtering, sorting, and pagination for the admin UI.</p>" +
      "<p>Finally, we render dynamic project cards on both the public site and the admin portal.</p>",
    coverImage: "/project-2.png",
    tags: ["MongoDB", "Migrations", "Next.js"],
    published: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");

    // Optional: do not clear existing; only insert if slug not exists
    for (const item of articlesToSeed) {
      const slug = slugify(item.title, { lower: true, strict: true });
      const exists = await Article.findOne({ slug });
      if (exists) {
        console.log(`Skipping existing article: ${slug}`);
        continue;
      }
      await Article.create({ ...item, slug });
      console.log(`Inserted: ${slug}`);
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

seed();
