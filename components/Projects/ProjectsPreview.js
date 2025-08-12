import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';

import commonStyles from './ProjectsPreviewCommon.module.css';
import lightStyles from './ProjectsPreviewLight.module.css';
import darkStyles from './ProjectsPreviewDark.module.css';

// Use the old Project1 card design for dynamic projects
import Project1 from './Project1';

// All projects (add more as needed)



const ProjectsPreview = ({ projects = [] }) => {
  const { theme } = useTheme();
  const [clientProjects, setClientProjects] = useState(projects);

  useEffect(() => {
    // If no projects provided from SSR, fetch a small set client-side as a fallback
    if (!projects || projects.length === 0) {
      fetch('/api/projects?published=true&featured=true&limit=3')
        .then((res) => res.json())
        .then((json) => {
          if (json && json.success && Array.isArray(json.data)) {
            if (json.data.length > 0) {
              setClientProjects(json.data);
            } else {
              // Fallback to latest published if no featured
              fetch('/api/projects?published=true&limit=3')
                .then((r) => r.json())
                .then((j) => {
                  if (j && j.success && Array.isArray(j.data)) {
                    setClientProjects(j.data);
                  }
                })
                .catch(() => setClientProjects([]));
            }
          }
        })
        .catch(() => {
          setClientProjects([]);
        });
    }
  }, [projects]);

  // Pick theme-specific styles

  // Pick theme-specific styles and theme class
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const themeClass = theme === 'dark' ? darkStyles.darkTheme : lightStyles.lightTheme;

  return (
    <section className={`${commonStyles.section} ${themeClass}`}>
      <div className={commonStyles.headerRow}>
        <h2 className={`${commonStyles.title} ${themeStyles.title}`}>Projects</h2>
      </div>
      <div className={commonStyles.grid}>
        {(!clientProjects || clientProjects.length === 0) && (
          <div style={{ textAlign: 'center', width: '100%', color: '#6b7280' }}>No projects to show yet.</div>
        )}
        {clientProjects && clientProjects.length > 0 && clientProjects.map((project) => (
          <div
            key={project._id || project.slug || project.title}
            className={commonStyles.projectCard}
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'none',
              boxShadow: 'none',
              transition: 'box-shadow 0.3s',
              minHeight: 340,
              maxWidth: 420,
              width: '100%',
            }}
          >
            <Project1 project={project} />
          </div>
        ))}
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
        <button
          className={`${commonStyles.viewAll} ${themeStyles.viewAll}`}
          tabIndex={0}
          type="button"
          onClick={() => window.open('/projects', '_blank', 'noopener,noreferrer')}
        >
          View All
        </button>
      </div>
    </section>
  );
};

export default ProjectsPreview;
