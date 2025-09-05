// Static project data for simplified portfolio
export const projects = [
  {
    id: '1',
    slug: 'portfolio-website',
    title: 'Personal Portfolio Website',
    description: 'A modern, responsive portfolio website built with Next.js',
    technologies: ['Next.js', 'React', 'CSS Modules', 'JavaScript'],
    featured: true,
    category: 'Web Development',
    status: 'completed',
    image: '/project-1.png',
    demoUrl: 'https://ghulammujtaba.com',
    githubUrl: 'https://github.com/ghulam-mujtaba5/MyPortfolio',
    content: 'A comprehensive portfolio website showcasing my development skills and projects.',
    createdAt: '2023-01-01'
  },
  {
    id: '2', 
    slug: 'e-commerce-app',
    title: 'E-Commerce Application',
    description: 'Full-stack e-commerce platform with payment integration',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    featured: true,
    category: 'Full Stack',
    status: 'completed',
    image: '/project-2.png',
    demoUrl: '#',
    githubUrl: '#',
    content: 'A complete e-commerce solution with user authentication, product management, and secure payments.',
    createdAt: '2023-02-01'
  },
  {
    id: '3',
    slug: 'mobile-app',
    title: 'React Native Mobile App',
    description: 'Cross-platform mobile application for task management',
    technologies: ['React Native', 'Firebase', 'Redux'],
    featured: false,
    category: 'Mobile Development', 
    status: 'completed',
    image: '/project-3.png',
    demoUrl: '#',
    githubUrl: '#',
    content: 'A productivity app for managing tasks and projects on mobile devices.',
    createdAt: '2023-03-01'
  }
];

export const getProjectBySlug = (slug) => {
  return projects.find(project => project.slug === slug);
};

export const getFeaturedProjects = () => {
  return projects.filter(project => project.featured);
};

export const getProjectsByCategory = (category) => {
  return projects.filter(project => project.category === category);
};