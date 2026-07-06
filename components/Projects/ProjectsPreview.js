import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useScrollTrigger } from "../../hooks/useScrollAnimation";

import commonStyles from "./ProjectsPreviewCommon.module.css";
import lightStyles from "./ProjectsPreviewLight.module.css";
import darkStyles from "./ProjectsPreviewDark.module.css";

import Project1 from "./Project1";
import SectionHeader from "../AnimatedUI/SectionHeader";
import AmbientOrbs from "../AnimatedUI/AmbientOrbs";

const ProjectsPreview = ({ projects = [] }) => {
  const { theme } = useTheme();
  const [clientProjects, setClientProjects] = useState(projects);
  // Only show loading skeleton when we have NO data at all
  const [isLoading, setIsLoading] = useState(projects.length === 0);
  // Only true when the API explicitly responded success with zero results
  const [confirmedEmpty, setConfirmedEmpty] = useState(false);
  const { ref: containerRef, hasEntered } = useScrollTrigger({ threshold: 0.15 });

  useEffect(() => {
    // Always run a background refresh on every mount.
    // If SSR data already exists it is shown immediately — this silently updates.
    // On navigation back to the page, stale ISR data is replaced with fresh API data.
    const controller = new AbortController();
    let mounted = true;

    (async () => {
      try {
        // 1. Try featured/home projects first
        const res = await fetch(
          "/api/projects?published=true&featured=true&limit=3",
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;

        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setClientProjects(json.data);
          return;
        }

        // 2. No featured projects — fall back to latest published
        const fb = await fetch("/api/projects?published=true&limit=3", {
          signal: controller.signal,
        });
        if (!fb.ok) throw new Error(`HTTP ${fb.status}`);
        const fbJson = await fb.json();
        if (!mounted) return;

        if (fbJson?.success && Array.isArray(fbJson.data)) {
          if (fbJson.data.length > 0) {
            setClientProjects(fbJson.data);
          } else {
            // API explicitly confirmed zero published projects
            setConfirmedEmpty(true);
          }
        }
      } catch (e) {
        if (e.name === "AbortError") return;
        // Network / server error — keep whatever data we already have;
        // do NOT flip into empty-state just because the fetch failed.
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []); // run once per mount; navigation remounts the component

  // Keep in sync if the parent re-renders with new ISR data
  useEffect(() => {
    if (projects.length > 0) {
      setClientProjects(projects);
    }
  }, [projects]);

  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const themeClass = theme === "dark" ? darkStyles.darkTheme : lightStyles.lightTheme;

  const isEmpty = clientProjects.length === 0;
  const showLoading = isLoading && isEmpty;
  // Only declare "empty" when the API confirmed it — never on network failure
  const showEmptyState = !isLoading && confirmedEmpty && isEmpty;

  return (
    <section
      ref={containerRef}
      className={`${commonStyles.section} ${themeClass}`}
      style={{
        animation: hasEntered ? "fadeInUp 0.6s ease-out" : "none",
        opacity: hasEntered ? 1 : 0.7,
      }}
    >
      <AmbientOrbs variant="projects" />
      <SectionHeader
        eyebrow="Proof of work"
        title="Products, not just projects"
        lede="Platforms and systems that shipped — each one a case study in taking an idea to production."
        id="projects-title"
      />
      <div className={commonStyles.grid}>
        {showLoading && (
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
                      ? "linear-gradient(135deg, rgba(31,41,55,0.5) 0%, rgba(17,24,39,0.5) 100%)"
                      : "linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.8) 100%)",
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
                        ? "rgba(55,65,81,0.5)"
                        : "rgba(229,231,235,0.8)",
                  }}
                />
                <div style={{ padding: 20 }}>
                  {[["75%", 24, 16], ["90%", 16, 8], ["60%", 16, 0]].map(
                    ([w, h, mb], idx) => (
                      <div
                        key={idx}
                        style={{
                          height: h,
                          width: w,
                          background:
                            theme === "dark"
                              ? "rgba(55,65,81,0.5)"
                              : "rgba(229,231,235,0.8)",
                          borderRadius: idx === 0 ? 6 : 4,
                          marginBottom: mb,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </>
        )}

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

        {!showLoading &&
          clientProjects.length > 0 &&
          clientProjects.map((project, index) => {
            const key = project._id || project.slug || `project-${index}`;
            return (
              <div
                key={key}
                className={commonStyles.projectCard}
                style={{
                  background: "none",
                  maxWidth: 420,
                  width: "100%",
                  display: "flex",
                  alignItems: "stretch",
                  animation: hasEntered
                    ? `fadeInUp 0.6s ease-out ${index * 50}ms both`
                    : "none",
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
          onClick={() => (window.location.href = "/projects")}
        >
          View all projects →
        </button>
      </div>
    </section>
  );
};

export default ProjectsPreview;
