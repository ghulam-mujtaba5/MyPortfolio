// scratch/query-articles.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ArticleModule = require("../models/Article");
const Article = ArticleModule.default || ArticleModule;

dotenv.config({ path: ".env.local" });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");
    const articles = await Article.find({}).lean();
    console.log("Found", articles.length, "articles:");
    articles.forEach((a) => {
      console.log(`- Title: "${a.title}"\n  Slug: "${a.slug}"\n  CoverImage: "${a.coverImage}"\n  FeaturedOnHome: ${a.featuredOnHome}\n  Published: ${a.published}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

main();
