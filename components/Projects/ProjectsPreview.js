import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useScrollTrigger } from "../../hooks/useScrollAnimation";

import commonStyles from "./ProjectsPreviewCommon.module.css";
import lightStyles from "./ProjectsPreviewLight.module.css";
import darkStyles from "./ProjectsPreviewDark.module.css";

// Use the old Project1 card design for dynamic projects
import Project1 from "./Project1";

const ProjectsPreview = ({ projects = [] }) => {
  const { theme } = useTheme();
  const [clientProjects, setClientProjects] = useState(projects);
  // Determine if we have initial data from SSR
  const hasInitialData = projects && projects.length > 0;
  // Start in loading state when SSR gave us nothing — prevents the empty-state
  // flash before the client-side fetch has a chance to run.
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { ref: containerRef, hasEntered } = useScrollTrigger({
    threshold: 0.15,
  });

  const fetchProjects = useCallback(async (signal) => {
    if (hasAttemptedFetch) return;

    setIsLoading(true);
    setHasAttemptedFetch(true);

    const MAX_RETRIES = 2;
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (signal?.aborted) return;

        // Exponential backoff on retry
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }

        const res = await fetch(
          "/api/projects?published=true&featured=true&limit=3",
          { signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (
          json &&
          json.success &&
          Array.isArray(json.data) &&
          json.data.length > 0
        ) {
          setClientProjects(json.data);
          return; // Success — exit retry loop
        } else {
          // Fallback to latest published if no featured projects
          const fallbackRes = await fetch("/api/projects?published=true&limit=3", { signal });
          if (fallbackRes.ok) {
            const fallbackJson = await fallbackRes.json();
            if (
              fallbackJson &&
              fallbackJson.success &&
              Array.isArray(fallbackJson.data)
            ) {
              setClientProjects(fallbackJson.data);
              return; // Success
            }
          }
        }
      } catch (error) {
        if (error.name === "AbortError") return;
        lastError = error;
        console.warn(`Projects fetch attempt ${attempt + 1} failed:`, error.message);
      }
    }

    // All retries exhausted
    if (lastError) {
      console.error("Failed to fetch projects after retries:", lastError);
    }
    setIsLoading(false);
  }, [hasAttemptedFetch]);

  useEffect(() => {
    // Only fetch client-side if no SSR data was provided
    if (!hasInitialData && !hasAttemptedFetch) {
      const controller = new AbortController();
      fetchProjects(controller.signal).finally(() => setIsLoading(false));
      return () => controller.abort();
    }
  }, [hasInitialData, hasAttemptedFetch, fetchProjects]);

  // Sync with SSR data if it changes
  useEffect(() => {
    if (hasInitialData) {
      setClientProjects(projects);
    }
  }, [projects, hasInitialData]);

  // Pick theme-specific styles and theme class
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const themeClass =
    theme === "dark" ? darkStyles.darkTheme : lightStyles.lightTheme;

  const displayProjects = clientProjects;
  const isEmpty = !displayProjects || displayProjects.length === 0;
  // Only declare "empty" once we've actually finished trying to load —
  // either SSR gave us something, or the client fetch completed.
  const hasResolvedData = hasInitialData || hasAttemptedFetch;
  
  // Show empty state if we resolved data and there are no projects.
  const showEmptyState = !isLoading && hasResolvedData && isEmpty;
  
  // Show loading skeleton if we are loading AND there are no projects.
  const showLoading = isLoading && isEmpty;

  return (
    <section
      ref={containerRef}
      className={`${commonStyles.section} ${themeClass}`}
      style={{
        animation: hasEntered ? "fadeInUp 0.6s ease-out" : "none",
        opacity: hasEntered ? 1 : 0.7,
      }}
    >
      <div className={commonStyles.headerRow}>
        <h2 className={`${commonStyles.title} ${themeStyles.title}`}>
          Projects
        </h2>
      </div>
      <div className={commonStyles.grid}>
        {showLoading && !projects?.length && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={`skeleton-${i}`}
                style={{
                  minHeight: 340,
                  maxWidth: 420,
                  width: "100%",
                  background:
                    theme === "dark"
                      ? "linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%)"
                      : "linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.8) 100%)",
                  borderRadius: 20,
                  animation: "pulse 2s ease-in-out infinite",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 200,
                    background:
                      theme === "dark"
                        ? "rgba(55, 65, 81, 0.5)"
                        : "rgba(229, 231, 235, 0.8)",
                  }}
                />
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      height: 24,
                      width: "75%",
                      background:
                        theme === "dark"
                          ? "rgba(55, 65, 81, 0.5)"
                          : "rgba(229, 231, 235, 0.8)",
                      borderRadius: 6,
                      marginBottom: 16,
                    }}
                  />
                  <div
                    style={{
                      height: 16,
                      width: "90%",
                      background:
                        theme === "dark"
                          ? "rgba(55, 65, 81, 0.5)"
                          : "rgba(229, 231, 235, 0.8)",
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 16,
                      width: "60%",
                      background:
                        theme === "dark"
                          ? "rgba(55, 65, 81, 0.5)"
                          : "rgba(229, 231, 235, 0.8)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <div
            style={{
              textAlign: "center",
              width: "100%",
              color: theme === "dark" ? "#9ca3af" : "#6b7280",
              padding: "40px 20px",
            }}
          >
            No projects to show yet.
          </div>
        )}

        {/* Projects Grid — Project1 owns the keyboard/click target so we don't
            duplicate focus stops or trigger navigation twice. */}
        {!showLoading &&
          displayProjects &&
          displayProjects.length > 0 &&
          displayProjects.map((project, index) => {
            const key = project._id || project.slug || `project-${index}`;
            return (
              <div
                key={key}
                className={commonStyles.projectCard}
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "none",
                  boxShadow: "none",
                  minHeight: 340,
                  maxWidth: 420,
                  width: "100%",
                  animation: hasEntered
                    ? `fadeInUp 0.6s ease-out ${index * 50}ms both`
                    : "none",
                  willChange: "transform, opacity",
                }}
              >
                <Project1 project={project} />
              </div>
            );
          })}
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: "2.5rem",
          animation: hasEntered ? "fadeInUp 0.6s ease-out 300ms both" : "none",
        }}
      >
        <button
          className={`${commonStyles.viewAll} ${themeStyles.viewAll}`}
          tabIndex={0}
          type="button"
          onClick={() =>
            window.open("/projects", "_blank", "noopener,noreferrer")
          }
        >
          View All
        </button>
      </div>
    </section>
  );
};

export default ProjectsPreview;
