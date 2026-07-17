import SEO from "../../components/SEO";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import dbConnect from "../../lib/mongoose";
import Project from "../../models/Project";
import ProjectDetail from "../../components/Projects/ProjectDetail";
import { enhanceProjectData } from "../../utils/projectEnhancements";
import { MAIN_SECTIONS } from "../../constants/navigation";

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

// ...existing code...

const ProjectPage = ({ project }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const sections = MAIN_SECTIONS;
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

  // ...existing code...

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: theme === 'dark' ? '#1d2127' : '#ffffff', color: theme === 'dark' ? '#f3f4f6' : '#1d2127' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Project not found</h1>
        <p style={{ marginBottom: '1.5rem' }}>The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <a href="/projects" style={{ color: '#4573df', textDecoration: 'underline' }}>Browse all projects</a>
      </div>
    );
  }

  const projectSchema = {
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
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ghulammujtaba.com/" },
      { "@type": "ListItem", position: 2, name: "Projects", item: "https://ghulammujtaba.com/projects" },
      { "@type": "ListItem", position: 3, name: project.title, item: `https://ghulammujtaba.com/projects/${project.slug}` },
    ],
  };

  const projectSchemas = [projectSchema, breadcrumbSchema];

  if (project?.links?.github) {
    projectSchemas.push({
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
    });
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      // Brand-flat page background, consistent with the rest of the site
      background: theme === 'dark' ? '#1d2127' : '#ffffff',
      margin: 0,
      padding: 0
    }}>
      <SEO
        title={project.metaTitle || `${project.title} | Project by Ghulam Mujtaba`}
        description={(project.metaDescription || project.description || "").substring(0, 160)}
        url={`https://ghulammujtaba.com/projects/${project.slug}`}
        canonical={`https://ghulammujtaba.com/projects/${project.slug}`}
        image={makeAbsolute(project.ogImage || project.image)}
        imageAlt={project.metaTitle || project.title}
        type="article"
        jsonLd={projectSchemas}
      />

      {isMobile ? <NavBarMobile sections={sections} /> : <NavBarDesktop />}

      <main>
        {/* ...existing code... */}

        <ProjectDetail project={enhanceProjectData(project)} />
      </main>

      <Footer />
    </div>
  );
};

export async function getServerSideProps(context) {
  try {
    const { params } = context;

    // Sanitize slug to prevent injection
    const safeSlug = String(params?.slug || "").replace(/[^a-z0-9_-]/gi, "").substring(0, 200);
    if (!safeSlug) {
      return { notFound: true };
    }

    await dbConnect();

    // Set a timeout so SSR doesn't hang
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB query timeout")), 8000)
    );

    // For public view, fetch by slug and ensure it's published
    const project = await Promise.race([
      Project.findOne({
        slug: safeSlug,
        published: true,
      }).lean(),
      timeoutPromise,
    ]);

    if (!project) {
      return { notFound: true };
    }

    return {
      props: {
        project: JSON.parse(JSON.stringify(project)),
      },
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getServerSideProps project detail error:", err?.message || err);
    return { notFound: true };
  }
}

export default ProjectPage;
