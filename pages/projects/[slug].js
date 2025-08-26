import Head from "next/head";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import shareStyles from "./ProjectShare.module.css";
import dbConnect from "../../lib/mongoose";
import Project from "../../models/Project";
import ProjectDetail from "../../components/Projects/ProjectDetail";

const NavBarDesktop = dynamic(
  () => import("../../components/NavBar_Desktop/nav-bar"),
  { ssr: false },
);
const NavBarMobile = dynamic(
  () => import("../../components/NavBar_Mobile/NavBar-mobile"),
  { ssr: false },
);
const Footer = dynamic(() => import("../../components/Footer/Footer"), {
  ssr: false,
});

// Local helper: copy to clipboard
function handleCopy(text) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  } catch (_) {}
}

const ProjectPage = ({ project }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareAnim, setShareAnim] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef(null);
  const projectUrl = `https://ghulammujtaba.com/projects/${project?.slug}`;

  // Ensure absolute URLs for OG/Twitter/JSON-LD
  const makeAbsolute = (url) => {
    if (!url) return undefined;
    try {
      const u = new URL(url, "https://ghulammujtaba.com");
      return u.toString();
    } catch (_) {
      return undefined;
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Open/close helpers with animation
  const openShare = () => {
    setShareOpen(true);
    requestAnimationFrame(() => setShareAnim(true));
  };
  const closeShare = () => {
    setShareAnim(false);
    setTimeout(() => setShareOpen(false), 150);
  };

  // Click-outside to close
  useEffect(() => {
    function onDocClick(e) {
      if (!shareOpen) return;
      const node = shareRef.current;
      if (node && !node.contains(e.target)) {
        closeShare();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [shareOpen]);

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div>
      <Head>
        <title>
          {project.metaTitle || `${project.title} | Project by Ghulam Mujtaba`}
        </title>
        <meta
          name="description"
          content={
            project.metaDescription || project.description.substring(0, 160)
          }
        />
        <link
          rel="canonical"
          href={`https://ghulammujtaba.com/projects/${project.slug}`}
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={project.metaTitle || project.title}
        />
        <meta
          property="og:description"
          content={
            project.metaDescription || project.description.substring(0, 160)
          }
        />
        <meta property="og:image" content={makeAbsolute(project.ogImage || project.image)} />
        <meta
          property="og:url"
          content={`https://ghulammujtaba.com/projects/${project.slug}`}
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content={project.metaTitle || project.title}
        />
        <meta
          property="twitter:description"
          content={
            project.metaDescription || project.description.substring(0, 160)
          }
        />
        <meta
          property="twitter:image"
          content={makeAbsolute(project.ogImage || project.image)}
        />
        <meta
          property="twitter:url"
          content={`https://ghulammujtaba.com/projects/${project.slug}`}
        />

        {/* JSON-LD: Project as CreativeWork */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: project.metaTitle || project.title,
              description: project.metaDescription || project.description,
              url: `https://ghulammujtaba.com/projects/${project.slug}`,
              image: makeAbsolute(project.ogImage || project.image),
              author: {
                "@type": "Person",
                name: "Ghulam Mujtaba",
                url: "https://ghulammujtaba.com",
              },
              publisher: {
                "@type": "Organization",
                name: "Ghulam Mujtaba",
                logo: {
                  "@type": "ImageObject",
                  url: "https://ghulammujtaba.com/og-image.png",
                },
              },
              datePublished: project.createdAt,
              dateModified: project.updatedAt,
              keywords: Array.isArray(project.tags) ? project.tags.join(", ") : undefined,
            }),
          }}
        />
        {/* JSON-LD: Breadcrumbs for Project */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://ghulammujtaba.com/" },
                { "@type": "ListItem", position: 2, name: "Projects", item: "https://ghulammujtaba.com/projects" },
                { "@type": "ListItem", position: 3, name: project.title, item: `https://ghulammujtaba.com/projects/${project.slug}` },
              ],
            }),
          }}
        />
        {/* JSON-LD: SoftwareSourceCode when GitHub link exists */}
        {project?.links?.github && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareSourceCode",
                name: project.metaTitle || project.title,
                description: project.metaDescription || project.description,
                codeRepository: project.links.github,
                url: `https://ghulammujtaba.com/projects/${project.slug}`,
                image: makeAbsolute(project.ogImage || project.image),
                author: { "@type": "Person", name: "Ghulam Mujtaba", url: "https://ghulammujtaba.com" },
                datePublished: project.createdAt,
                dateModified: project.updatedAt,
                keywords: Array.isArray(project.tags) ? project.tags.join(", ") : undefined,
              }),
            }}
          />
        )}
      </Head>

      {isMobile ? <NavBarMobile /> : <NavBarDesktop />}

      <main>
        {/* Share bar */}
        <div ref={shareRef} className={shareStyles.shareBar}>
          <button
            aria-label="Share this project"
            aria-haspopup="menu"
            aria-expanded={shareOpen ? "true" : "false"}
            title="Share"
            onClick={async () => {
              try {
                if (typeof navigator !== "undefined" && navigator.share) {
                  await navigator.share({
                    title: project.metaTitle || project.title,
                    text: project.metaDescription || project.description?.slice(0, 120) || project.title,
                    url: projectUrl,
                  });
                  return;
                }
              } catch (_) {}
              if (!shareOpen) openShare(); else closeShare();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!shareOpen) openShare(); else closeShare();
              }
              if (e.key === "Escape") closeShare();
            }}
            className={`${shareStyles.shareButton} ${theme === "dark" ? shareStyles.shareButtonDark : ""}`}
          >
            {/* Modern share icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M15 4h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 14L20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 14v5a1 1 0 0 1-1 1h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {shareOpen && (
            <div
              role="menu"
              aria-label="Share options"
              className={`${shareStyles.shareMenu} ${theme === "dark" ? shareStyles.shareMenuDark : ""} ${shareAnim ? shareStyles.shareMenuOpen : ""}`}
            >
              <button
                role="menuitem"
                onClick={() => {
                  handleCopy(projectUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                  closeShare();
                }}
                className={`${shareStyles.shareItem} ${shareStyles.copyItem}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {copied ? "Copied!" : "Copy link"}
              </button>
              <a
                role="menuitem"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(projectUrl)}&text=${encodeURIComponent(project.metaTitle || project.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={shareStyles.shareItem}
              >
                Share on X (Twitter)
              </a>
              <a
                role="menuitem"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={shareStyles.shareItem}
              >
                Share on LinkedIn
              </a>
              <a
                role="menuitem"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={shareStyles.shareItem}
              >
                Share on Facebook
              </a>
              <a
                role="menuitem"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent((project.metaTitle || project.title) + " " + projectUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={shareStyles.shareItem}
              >
                Share on WhatsApp
              </a>
            </div>
          )}
        </div>

        <ProjectDetail project={project} />
      </main>

      <Footer />
    </div>
  );
};

export async function getServerSideProps(context) {
  const { params } = context;
  await dbConnect();

  // For public view, fetch by slug and ensure it's published
  const project = await Project.findOne({
    slug: params.slug,
    published: true,
  }).lean();

  if (!project) {
    return { notFound: true };
  }

  return {
    props: {
      project: JSON.parse(JSON.stringify(project)),
    },
  };
}

export default ProjectPage;
