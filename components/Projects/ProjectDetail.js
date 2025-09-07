import React, { useEffect } from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import baseStyles from "./ProjectDetailBaseCommon.module.css";
import lightStyles from "./ProjectDetail.light.module.css";
import darkStyles from "./ProjectDetail.dark.module.css";

const ProjectDetail = ({ project }) => {
  const { theme } = useTheme();

  // Apply body background for dark mode
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    if (theme === "dark") {
      body.style.background = 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)';
      html.style.background = 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)';
      body.style.minHeight = '100vh';
      html.style.minHeight = '100vh';
    } else {
      body.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)';
      html.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)';
      body.style.minHeight = '100vh';
      html.style.minHeight = '100vh';
    }

    // Cleanup function
    return () => {
      body.style.background = '';
      html.style.background = '';
      body.style.minHeight = '';
      html.style.minHeight = '';
    };
  }, [theme]);

  if (!project) {
    return (
      <div className={`${baseStyles.container} ${theme === "dark" ? darkStyles.container : lightStyles.container}`}>
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          color: theme === "dark" ? "#e5e7eb" : "#374151"
        }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Project Not Found</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>
            The project you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const { title, description, image, showImage, tags, category, links } = project;

  // Combine styles based on theme
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const styles = { ...baseStyles, ...themeStyles };

  // Detect if this is a mobile app project
  const isMobileApp = category?.toLowerCase().includes('mobile') || 
                     tags?.some(tag => tag.toLowerCase().includes('mobile')) ||
                     tags?.some(tag => tag.toLowerCase().includes('app')) ||
                     title?.toLowerCase().includes('mobile') ||
                     title?.toLowerCase().includes('app');

  return (
    <div className={`${baseStyles.container} ${themeStyles.container || ""} ${theme === "dark" ? baseStyles.dark : baseStyles.light}`}>
      {/* Project Title */}
      <h1 className={`${baseStyles.title} ${themeStyles.title || ""}`}>
        {title}
      </h1>

      {/* Project Image */}
      {showImage && image && (
        <div className={`${baseStyles.imageContainer} ${themeStyles.imageContainer || ""} ${isMobileApp ? baseStyles.mobileApp : ""}`}>
          <Image
            src={image}
            alt={`${title} preview`}
            width={isMobileApp ? 400 : 1600}
            height={isMobileApp ? 700 : 900}
            sizes={isMobileApp 
              ? "(max-width: 768px) 300px, 400px" 
              : "(max-width: 768px) 100vw, (max-width: 1200px) 800px, 900px"
            }
            style={{ 
              objectFit: "cover", 
              width: "100%", 
              height: "auto",
              borderRadius: "inherit"
            }}
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7XTvhRakHcMm3+hPM4cBDBj5SJ2H+pD7bFaRKTXuMhNB1O8Dq3wA8QRnKLi5TlwT5WbUZrJeCPmvdVuKldJVEHPMCgw4wnTrA7cY1x5Vt7U2kJQqGDVGnGv4u5h7PF5vhT46wJwNBJLQCuNq8AV/9k="
          />
        </div>
      )}

      {/* Meta Information */}
      <div className={`${baseStyles.meta} ${themeStyles.meta || ""}`}>
        {category && (
          <span 
            className={`${baseStyles.category} ${themeStyles.category || ""}`}
            role="badge"
            aria-label={`Category: ${category}`}
          >
            {category}
          </span>
        )}
        
        {Array.isArray(tags) && tags.length > 0 && (
          <div 
            className={`${baseStyles.tags} ${themeStyles.tags || ""}`}
            role="list"
            aria-label="Project technologies"
          >
            {tags.map((tag, index) => (
              <span 
                key={`${tag}-${index}`} 
                className={`${baseStyles.tag} ${themeStyles.tag || ""}`}
                role="listitem"
                tabIndex="0"
                aria-label={`Technology: ${tag}`}
              >
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Project Description */}
      {description && (
        <div 
          className={`${baseStyles.description} ${themeStyles.description || ""}`}
          dangerouslySetInnerHTML={{ __html: description }}
          role="article"
          aria-label="Project description"
        />
      )}

      {/* Action Links */}
      {(links?.live || links?.github) && (
        <div 
          className={`${baseStyles.links} ${themeStyles.links || ""}`}
          role="group"
          aria-label="Project links"
        >
          {links?.live && (
            <a
              href={links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseStyles.link} ${themeStyles.link || ""}`}
              aria-label={`View live demo of ${title} (opens in new tab)`}
            >
              <span>Live Preview</span>
            </a>
          )}
          {links?.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseStyles.link} ${themeStyles.link || ""}`}
              aria-label={`View source code of ${title} on GitHub (opens in new tab)`}
            >
              <span>Source Code</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
