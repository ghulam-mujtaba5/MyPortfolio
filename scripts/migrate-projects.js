const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('../models/Project').default;

dotenv.config({ path: '.env.local' });

// Seed data to migrate into MongoDB (previously in components/Projects/projectsData)
const projects = [
  {
    title: "AI-Powered Analytics Dashboard",
    description: "Enterprise-level analytics platform with machine learning capabilities for real-time data insights and predictive analytics.",
    image: "/project-2.png",
    tags: ["React", "Python", "TensorFlow", "AWS"],
    category: ["Web", "AI", "Data"],
    liveUrl: "#",
    codeUrl: "#",
    status: 'Published'
  },
  {
    title: "E-Commerce Mobile App",
    description: "Full-featured e-commerce mobile application with AR product visualization and personalized recommendations.",
    image: "/project img 1.png",
    tags: ["React Native", "MongoDB", "Firebase"],
    category: ["Mobile", "Web"],
    liveUrl: "#",
    codeUrl: "#",
    status: 'Published'
  },
  {
    title: "Smart Resource Management System",
    description: "Desktop application for enterprise resource planning with advanced automation and workflow management.",
    image: "/project img 3.png",
    tags: ["Electron", "TypeScript", "PostgreSQL", "Docker"],
    category: ["Desktop", "Web"],
    liveUrl: "#",
    codeUrl: "#",
    status: 'Published'
  },
  {
    title: "Data Visualization Platform",
    description: "Interactive data visualization platform with real-time analytics and customizable dashboards.",
    image: "/project-2.png",
    tags: ["D3.Js", "Vue.Js", "Python", "FastAPI"],
    category: ["Web", "Data"],
    liveUrl: "#",
    codeUrl: "#",
    status: 'Published'
  }
];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

const migrateProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected...');

    // Clear existing projects to avoid duplicates
    await Project.deleteMany({});
    console.log('Cleared existing projects.');

    // Transform to match current Project schema
    const projectsToInsert = projects.map(p => ({
      title: p.title,
      slug: slugify(p.title),
      description: p.description,
      image: p.image || '',
      showImage: true,
      tags: Array.isArray(p.tags) ? p.tags : [],
      category: Array.isArray(p.category) ? (p.category[0] || 'General') : (p.category || 'General'),
      links: {
        live: p.liveUrl || '',
        github: p.codeUrl || '',
      },
      published: p.status ? String(p.status).toLowerCase() === 'published' : true,
      views: 0,
    }));

    await Project.insertMany(projectsToInsert);
    console.log(`Successfully migrated ${projectsToInsert.length} projects.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

migrateProjects();
