import React from "react";
import Project1 from "./Project1";

const ProjectList = ({ projects }) => {
  const items = Array.isArray(projects) ? projects : [];
  return (
    <div className="project-list">
      {items.length === 0 ? (
        <div className="empty">
          No projects to display.
        </div>
      ) : (
        items.map((project) => (
          <div key={project._id || project.id} className="project-card">
            {project.component ? (
              project.component
            ) : (
              <Project1 project={project} />
            )}
          </div>
        ))
      )}
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
        .empty {
          grid-column: 1 / -1;
          text-align: center;
          color: #6b7280;
          padding: 1.5rem 1rem;
        }
        .project-card {
          background: var(--card-bg, #fff);
          border-radius: 18px;
          box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.08);
          padding: 2rem 1.5rem;
          transition:
            box-shadow 0.3s,
            transform 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .project-card:hover {
          box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.16);
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
