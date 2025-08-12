const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');
const Project = require('../models/Project');

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-');

const addSlugs = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');

    const projectsToUpdate = await Project.find({ slug: { $exists: false } });

    if (projectsToUpdate.length === 0) {
      console.log('All projects already have slugs. No action needed.');
      return;
    }

    console.log(`Found ${projectsToUpdate.length} projects to update.`);

    for (const project of projectsToUpdate) {
      const newSlug = slugify(project.title);
      project.slug = newSlug;
      await project.save();
      console.log(`Updated project: ${project.title} -> ${newSlug}`);
    }

    console.log('Successfully added slugs to all projects.');
  } catch (error) {
    console.error('Error during slug migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

addSlugs();
