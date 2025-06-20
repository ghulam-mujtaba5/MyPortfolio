import React from 'react';
import Project1 from './Project1';

const projects = [
  { id: 1, component: <Project1 /> },
  // Add more projects here as you create them
];

const ProjectList = () => {
  return (
    <div className="project-list">
      {projects.map(project => (
        <div key={project.id} className="project-card">
          {project.component}
        </div>
      ))}
      <style jsx>{`
        .project-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 2.5rem;
          padding: 2rem 0;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .project-card {
          background: var(--card-bg, #fff);
          border-radius: 18px;
          box-shadow: 0 4px 24px 0 rgba(60,60,60,0.08);
          padding: 2rem 1.5rem;
          transition: box-shadow 0.3s, transform 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .project-card:hover {
          box-shadow: 0 8px 32px 0 rgba(60,60,60,0.16);
          transform: translateY(-6px) scale(1.03);
        }
        @media (max-width: 600px) {
          .project-list {
            grid-template-columns: 1fr;
            padding: 1rem 0;
          }
          .project-card {
            padding: 1.2rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectList;

