// Project Enhancement Utilities
// These utilities add sample data for demonstration of new UI features

/**
 * Add sample performance metrics to a project for demonstration
 * In production, these would come from actual Lighthouse audits or similar tools
 */
export function addSampleMetrics(project) {
  if (!project) return project;

  // Only add metrics for certain project types for demonstration
  const webProjects = ['web', 'website', 'frontend', 'fullstack'];
  const hasWebCategory = webProjects.some(type => 
    project.category?.toLowerCase().includes(type) ||
    project.tags?.some(tag => tag.toLowerCase().includes(type))
  );

  if (hasWebCategory) {
    project.metrics = {
      performance: Math.floor(Math.random() * 20) + 80, // 80-100
      accessibility: Math.floor(Math.random() * 15) + 85, // 85-100
      seo: Math.floor(Math.random() * 25) + 75, // 75-100
      bestPractices: Math.floor(Math.random() * 20) + 80, // 80-100
    };
  }

  return project;
}

/**
 * Calculate estimated reading time for project description
 */
export function calculateReadingTime(description) {
  if (!description) return 1;
  
  const wordCount = description.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const avgWordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / avgWordsPerMinute));
}

/**
 * Generate enhanced project metadata
 */
export function enhanceProjectData(project) {
  if (!project) return project;

  let enhanced = { ...project };

  // Add sample metrics for web projects
  enhanced = addSampleMetrics(enhanced);

  // Add reading time
  enhanced.readingTime = calculateReadingTime(project.description);

  // Add short description if not present
  if (!enhanced.shortDescription && enhanced.description) {
    enhanced.shortDescription = enhanced.description
      .replace(/<[^>]*>/g, '')
      .substring(0, 150) + '...';
  }

  // Add last updated date if not present
  if (!enhanced.updatedAt) {
    enhanced.updatedAt = enhanced.createdAt || new Date().toISOString();
  }

  return enhanced;
}

/**
 * Filter and sort related projects by relevance
 */
export function getRelatedProjects(currentProject, allProjects, limit = 3) {
  if (!currentProject || !allProjects) return [];

  const scored = allProjects
    .filter(p => p._id !== currentProject._id && p.published)
    .map(project => {
      let score = 0;
      
      // Same category gets highest score
      if (project.category === currentProject.category) {
        score += 10;
      }
      
      // Matching tags
      const currentTags = currentProject.tags || [];
      const projectTags = project.tags || [];
      const matchingTags = currentTags.filter(tag => 
        projectTags.some(ptag => ptag.toLowerCase() === tag.toLowerCase())
      );
      score += matchingTags.length * 3;
      
      // Similar title keywords
      const currentWords = currentProject.title.toLowerCase().split(/\s+/);
      const projectWords = project.title.toLowerCase().split(/\s+/);
      const matchingWords = currentWords.filter(word => 
        projectWords.includes(word) && word.length > 2
      );
      score += matchingWords.length * 2;
      
      return { ...project, relevanceScore: score };
    })
    .filter(project => project.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

  return scored;
}

export default {
  addSampleMetrics,
  calculateReadingTime,
  enhanceProjectData,
  getRelatedProjects,
};