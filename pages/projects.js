import Icon from "../components/Icon/gmicon";
import SEO, {
  collectionPageSchema,
  breadcrumbSchema,
  softwareProjectSchema,
} from "../components/SEO";

import React, { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import dbConnect from "../lib/mongoose";
import Project from "../models/Project";
import NavBar from "../components/NavBar_Desktop/nav-bar";
import NavBarMobile from "../components/NavBar_Mobile/NavBar-mobile";

import Footer from "../components/Footer/Footer";
import { MAIN_SECTIONS } from "../constants/navigation";

// Dynamically import Project1 to avoid SSR issues with next/image
import Project1 from "../components/Projects/Project1";
import styles from "../components/Projects/ProjectsPage.module.css";

const TAGS = [
  "All",
  "Software Development",
  "Web Development",
  "AI",
  "Data Science",
  "UI/UX",
  "Client Projects",
  "Others",
];

// Use shared navigation sections
const sections = MAIN_SECTIONS;

import Spinner from "../components/Spinner/Spinner";
import ScrollReveal from "../components/AnimatedUI/ScrollReveal";

const ProjectsPage = ({ projects = [], projectsError = null }) => {
  const [selectedTag, setSelectedTag] = useState("All");
  // Since this page uses ISR via getStaticProps, default to not loading and no error.
  const [loading] = useState(false);
  const [error] = useState(null);

  const safeProjects = Array.isArray(projects) ? projects : [];

  // Client-side fallback fetch when SSR failed or returned empty.
  // Pre-initialize loading=true if SSR gave us nothing so the empty-state
  // message doesn't flash for one frame before the fetch begins.
  const willClientFetch = Boolean(projectsError) || safeProjects.length === 0;
  const [clientProjects, setClientProjects] = useState([]);
  const [clientLoading, setClientLoading] = useState(willClientFetch);
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    if ((projectsError || safeProjects.length === 0) && typeof window !== "undefined") {
      const ac = new AbortController();
      setClientLoading(true);
      fetch(`/api/projects?published=true&limit=50`, { signal: ac.signal })
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const json = await r.json();
          const list = Array.isArray(json?.data) ? json.data : [];
          setClientProjects(
            list.map((p) => ({
              _id: p?._id?.toString?.() || String(p?._id || ""),
              slug: typeof p?.slug === "string" ? p.slug : "",
              title: typeof p?.title === "string" && p.title.trim() ? p.title : "Untitled",
              description: typeof p?.description === "string" ? p.description : "",
              image: typeof p?.image === "string" ? p.image : "",
              imageFit: typeof p?.imageFit === "string" ? p.imageFit : undefined,
              tags: Array.isArray(p?.tags) ? p.tags : [],
              category: typeof p?.category === "string" && p.category.trim() ? p.category : "Others",
              links: {
                live: typeof p?.links?.live === "string" ? p.links.live : "",
                github: typeof p?.links?.github === "string" ? p.links.github : "",
              },
            }))
          );
        })
        .catch((e) => setClientError(e?.message || "fetch_failed"))
        .finally(() => setClientLoading(false));
      return () => ac.abort();
    }
  }, [projectsError, safeProjects.length]);

  const effectiveProjects = clientProjects.length > 0 ? clientProjects : safeProjects;
  const projectSchemas = useMemo(() => {
    const items = (effectiveProjects || []).map((project) => ({
      name: project?.title || "Untitled",
      description: project?.description || "",
      url:
        project?.links?.live && String(project.links.live).trim() && String(project.links.live).trim() !== "#"
          ? project.links.live
          : project?.slug
            ? `https://ghulammujtaba.com/projects/${project.slug}`
            : "",
      image: project?.image || "",
      github: project?.links?.github || "",
      tags: project?.tags || [],
    }));
    return [
      collectionPageSchema({
        name: "Projects by Ghulam Mujtaba",
        url: "https://ghulammujtaba.com/projects",
        description: "Showcase of advanced, modern projects spanning web development, AI, data science, and mobile applications by Ghulam Mujtaba.",
        items: items.map((p, idx) => ({
          name: p.name,
          description: p.description,
          url: p.url,
          image: p.image,
        })),
      }),
      breadcrumbSchema([
        { name: "Home", url: "https://ghulammujtaba.com/" },
        { name: "Projects", url: "https://ghulammujtaba.com/projects" },
      ]),
      // Individual SoftwareSourceCode schemas for richer results
      ...items
        .filter((p) => p.url || p.github)
        .slice(0, 10)
        .map((p) =>
          softwareProjectSchema({
            name: p.name,
            description: p.description,
            url: p.url,
            codeRepository: p.github,
            image: p.image,
            programmingLanguages: p.tags,
          })
        ),
    ];
  }, [effectiveProjects]);
  const filteredProjects =
    selectedTag === "All"
      ? effectiveProjects
      : effectiveProjects.filter((p) => (p?.category || "Others") === selectedTag);

  return (
    <>
      <SEO
        title="Projects | Ghulam Mujtaba — Full Stack & AI"
        description="Showcase of advanced, modern, and professional projects by Ghulam Mujtaba. Explore software, web, mobile, AI, data science, and UI/UX work."
        url="https://ghulammujtaba.com/projects"
        canonical="https://ghulammujtaba.com/projects"
        image="https://ghulammujtaba.com/og-image.png"
        imageWidth={1200}
        imageHeight={630}
        imageAlt="Projects by Ghulam Mujtaba"
        author="Ghulam Mujtaba"
        jsonLd={projectSchemas}
      />
      <div className={styles.pageWrap}>
        {/* Desktop NavBar */}
        <div className="hide-on-mobile">
          <NavBar />
        </div>
        {/* Mobile NavBar with top-left icon and hamburger alignment (logo only here, not in NavBarMobile) */}
        <div className={`show-on-mobile ${styles.mobileNavbarContainer}`}>
          <div className={styles.mobileNavbarRow}>
            <div className={styles.mobileLogoAlign}>
              <Icon name="gmicon" size={32} />
            </div>
            <div className={styles.mobileHamburgerAlign}>
              {/* Ensure menu is always visible in NavBarMobile */}
              <NavBarMobile sections={sections} />
            </div>
          </div>
        </div>
        <div className={styles.pageBg}>
          <section className={styles.hero}>
            <div className={styles.heroBgVisual} aria-hidden="true">
              {/* Abstract lines SVG background */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 900 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline
                  points="60,60 200,40 350,100 500,60 700,120 850,60"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  opacity="0.13"
                  fill="none"
                />
                <polyline
                  points="100,120 300,80 450,180 600,100 800,180"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  opacity="0.10"
                  fill="none"
                />
                <polyline
                  points="80,180 250,160 400,200 650,160 820,200"
                  stroke="#a5b4fc"
                  strokeWidth="1.5"
                  opacity="0.09"
                  fill="none"
                />
                <circle cx="60" cy="60" r="4" fill="#3b82f6" opacity="0.18" />
                <circle cx="850" cy="60" r="3" fill="#3b82f6" opacity="0.13" />
                <circle cx="800" cy="180" r="3" fill="#60a5fa" opacity="0.13" />
                <circle cx="100" cy="120" r="3" fill="#60a5fa" opacity="0.13" />
              </svg>
            </div>
            <div className={styles.heroIntro}>
              <h1 className={styles.heroTitle}>
                <span>Products I&rsquo;ve Shipped</span>
              </h1>
              <h2 className={styles.heroSub}>
                Platforms, client systems, and AI products — built end to end
              </h2>
              <p className={styles.heroDesc}>
                Each project is a case study: the problem, my role, what I
                built, and what shipped — from student platforms serving 260+
                universities to commercial systems for paying clients.
              </p>
            </div>
          </section>

          <div className={styles.tagRow}>
            {TAGS.map((tag, i) => (
              <button
                key={tag}
                className={`${styles.tagBtn}${selectedTag === tag ? ` ${styles.tagBtnActive}` : ""}`}
                onClick={() => setSelectedTag(tag)}
                aria-pressed={selectedTag === tag}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className={styles.grid}>
            {clientLoading ? (
              <div className={styles.loadingWrap}>
                <Spinner size="lg" label="Loading projects" />
                <span className={styles.srOnly}>Loading projects…</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className={styles.emptyState}>
                {projectsError || clientError
                  ? "Projects could not be loaded. Please try again later."
                  : selectedTag === "All"
                  ? "No projects available at the moment."
                  : `No projects found for tag: ${selectedTag}.`}
              </div>
            ) : (
              filteredProjects.map((project, index) => {
                const isFeatured = index === 0 && selectedTag === "All";
                return (
                  <ScrollReveal
                    key={project._id}
                    className={isFeatured ? styles.featuredCard : undefined}
                    animation="fadeInUp"
                    delay={Math.min(index, 5) * 50} // Stagger effect, capped
                    width="100%"
                  >
                    {isFeatured && (
                      <span className={styles.featuredLabel} aria-hidden="true">
                        Featured
                      </span>
                    )}
                    <Project1 project={project} />
                  </ScrollReveal>
                );
              })
            )}
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export async function getStaticProps() {
  try {
    await dbConnect();

    // Set a timeout so SSR doesn't hang if the DB query is slow
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB query timeout")), 8000)
    );

    const raw = await Promise.race([
      Project.find({ published: true })
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean(),
      timeoutPromise,
    ]);

    const LinkSchema = z
      .object({
        live: z.string().url().optional().or(z.literal("")),
        github: z.string().url().optional().or(z.literal("")),
      })
      .partial();
    const ProjectSchema = z.object({
      _id: z.any(),
      slug: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      imageFit: z.enum(["contain", "cover", "fill", "none", "scale-down"]).optional(),
      tags: z.array(z.string()).optional(),
      category: z
        .enum([
          "All",
          "Software Development",
          "Web Development",
          "AI",
          "Data Science",
          "UI/UX",
          "Client Projects",
          "Others",
        ])
        .optional(),
      links: LinkSchema.optional(),
      role: z.string().optional(),
      outcome: z.string().optional(),
      status: z.string().optional(),
    });
    const ProjectsSchema = z.array(ProjectSchema);

    const parsed = ProjectsSchema.safeParse(raw);
    let normalized;
    if (!parsed.success) {
      // eslint-disable-next-line no-console
      console.warn("Projects validation failed; falling back to best-effort normalization.");
      normalized = Array.isArray(raw)
        ? raw.map((p) => ({
            _id: p?._id?.toString?.() || String(p?._id || ""),
            slug: typeof p?.slug === "string" ? p.slug : "",
            title: typeof p?.title === "string" && p.title.trim() ? p.title : "Untitled",
            description: typeof p?.description === "string" ? p.description : "",
            image: typeof p?.image === "string" ? p.image : "",
            imageFit: typeof p?.imageFit === "string" ? p.imageFit : undefined,
            tags: Array.isArray(p?.tags) ? p.tags : [],
            category: typeof p?.category === "string" && p.category.trim() ? p.category : "Others",
            links: {
              live: typeof p?.links?.live === "string" ? p.links.live : "",
              github: typeof p?.links?.github === "string" ? p.links.github : "",
            },
            role: typeof p?.role === "string" ? p.role : "",
            outcome: typeof p?.outcome === "string" ? p.outcome : "",
            status: typeof p?.status === "string" ? p.status : "",
          }))
        : [];
    } else {
      // Normalize minimal shape used by UI to avoid undefined access downstream
      normalized = parsed.data.map((p) => ({
        _id: p._id?.toString?.() || String(p._id),
        slug: p.slug || "",
        title: p.title || "Untitled",
        description: p.description || "",
        image: p.image || "",
        imageFit: p.imageFit || undefined,
        tags: Array.isArray(p.tags) ? p.tags : [],
        category: p.category || "Others",
        links: { live: p.links?.live || "", github: p.links?.github || "" },
        role: p.role || "",
        outcome: p.outcome || "",
        status: p.status || "",
      }));
    }

    return {
      props: {
        projects: JSON.parse(JSON.stringify(normalized)),
        projectsError: parsed.success ? null : "invalid_data",
      },
      revalidate: 3600, // Regenerate every hour
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getStaticProps projects error:", err?.message || err);
    // Return empty projects so the client-side fallback fetch can take over
    return {
      props: {
        projects: [],
        projectsError: err?.message || "ssr_failed",
      },
      revalidate: 60, // Retry sooner on error
    };
  }
}

export default ProjectsPage;
