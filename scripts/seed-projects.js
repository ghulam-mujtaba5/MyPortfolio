// scripts/seed-projects.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Project = require("../models/Project");
const slugify = require("slugify");

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const projectsToSeed = [
  {
    title: "AI-Powered Analytics Dashboard",
    description:
      "Enterprise-level analytics platform with machine learning capabilities for real-time data insights and predictive analytics.",
    image: "/project-2.png",
    tags: ["React", "Python", "TensorFlow", "AWS"],
    category: ["Web", "AI", "Data"],
    liveUrl: "#",
    codeUrl: "#",
    status: "Published",
  },
  {
    title: "E-Commerce Mobile App",
    description:
      "Full-featured e-commerce mobile application with AR product visualization and personalized recommendations.",
    image: "/project img 1.png",
    tags: ["React Native", "MongoDB", "Firebase"],
    category: ["Mobile", "Web"],
    liveUrl: "#",
    codeUrl: "#",
    status: "Published",
  },
  {
    title: "Smart Resource Management System",
    description:
      "Desktop application for enterprise resource planning with advanced automation and workflow management.",
    image: "/project img 3.png",
    tags: ["Electron", "TypeScript", "PostgreSQL", "Docker"],
    category: ["Desktop", "Web"],
    liveUrl: "#",
    codeUrl: "#",
    status: "Published",
  },
  {
    title: "Data Visualization Platform",
    description:
      "Interactive data visualization platform with real-time analytics and customizable dashboards.",
    image: "/project-2.png",
    tags: ["D3.Js", "Vue.Js", "Python", "FastAPI"],
    category: ["Web", "Data"],
    liveUrl: "#",
    codeUrl: "#",
    status: "Published",
  },
];

const seedDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");

    // Optional: Clear existing projects
    await Project.deleteMany({});
    console.log("Existing projects cleared.");

    const projectsWithSlugs = projectsToSeed.map((p) => ({
      ...p,
      slug: slugify(p.title, { lower: true, strict: true }),
    }));

    await Project.insertMany(projectsWithSlugs);
    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Database seeding failed:", err.message);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

seedDB();
