import React from 'react';
import styles from './ProjectsShowcaseCommon.module.css';
import darkStyles from './ProjectsShowcaseDark.module.css';
import lightStyles from './ProjectsShowcaseLight.module.css';
import { useTheme } from '../../context/ThemeContext';
import Image from 'next/image';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  link: string;
  category: 'web' | 'mobile' | 'desktop' | 'ai' | 'data';
}

const projects: Project[] = [
  {
    id: 1,
    title: "AI-Powered Analytics Dashboard",
    description: "Enterprise-level analytics platform with machine learning capabilities for real-time data insights and predictive analytics.",
    technologies: ["React", "Python", "TensorFlow", "AWS"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    link: "https://megicode.com/projects/analytics",
    category: "ai"
  },
  {
    id: 2,
    title: "E-Commerce Mobile App",
    description: "Full-featured e-commerce mobile application with AR product visualization and personalized recommendations.",
    technologies: ["React Native", "Node.js", "MongoDB", "Firebase"],
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
    link: "https://megicode.com/projects/ecommerce",
    category: "mobile"
  },
  {
    id: 3,
    title: "Smart Resource Management System",
    description: "Desktop application for enterprise resource planning with advanced automation and workflow management.",
    technologies: ["Electron", "TypeScript", "PostgreSQL", "Docker"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    link: "https://megicode.com/projects/resource-management",
    category: "desktop"
  },
  {
    id: 4,
    title: "Data Visualization Platform",
    description: "Interactive data visualization platform with real-time analytics and customizable dashboards.",
    technologies: ["D3.js", "Vue.js", "Python", "FastAPI"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    link: "https://megicode.com/projects/data-viz",
    category: "data"
  },
  {
    id: 5,
    title: "Cloud-Native Web Application",
    description: "Scalable web application built with microservices architecture and containerized deployment.",
    technologies: ["Next.js", "Kubernetes", "GraphQL", "MongoDB"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    link: "https://megicode.com/projects/cloud-app",
    category: "web"
  }
];

const ProjectsShowcase = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const [activeCategory, setActiveCategory] = React.useState('all');

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <section className={`${styles.showcaseSection} ${themeStyles.showcaseSection}`}>
      <div className={styles.categoryFilter}>
        {['all', 'web', 'mobile', 'desktop', 'ai', 'data'].map((category) => (
          <button
            key={category}
            className={`${styles.filterButton} ${themeStyles.filterButton} 
              ${activeCategory === category ? styles.activeFilter : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.projectsGrid}>
        {filteredProjects.map((project) => (
          <div key={project.id} className={`${styles.projectCard} ${themeStyles.projectCard}`}>
            <div className={styles.imageContainer}>
              <Image
                src={project.image}
                alt={project.title}
                width={400}
                height={300}
                className={styles.projectImage}
              />
            </div>
            <div className={styles.projectContent}>
              <h3 className={`${styles.projectTitle} ${themeStyles.projectTitle}`}>
                {project.title}
              </h3>
              <p className={`${styles.projectDescription} ${themeStyles.projectDescription}`}>
                {project.description}
              </p>
              <div className={styles.technologies}>
                {project.technologies.map((tech, index) => (
                  <span 
                    key={index} 
                    className={`${styles.techTag} ${themeStyles.techTag}`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <a 
                href={project.link}
                className={`${styles.projectLink} ${themeStyles.projectLink}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Project
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsShowcase;
