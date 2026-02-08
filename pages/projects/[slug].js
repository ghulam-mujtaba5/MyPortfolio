import Head from "next/head";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import dbConnect from "../../lib/mongoose";
import Project from "../../models/Project";
import ProjectDetail from "../../components/Projects/ProjectDetail";
import { enhanceProjectData } from "../../utils/projectEnhancements";

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

const ProjectPage = ({ project, relatedProjects = [] }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
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
    return <div>Project not found.</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0f1419 0%, #1f2937 50%, #111827 100%)' 
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f4 100%)',
      margin: 0,
      padding: 0
    }}>
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
        {/* ...existing code... */}

        <ProjectDetail project={enhanceProjectData(project)} relatedProjects={relatedProjects} />
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

    // Fetch related projects (same category or similar tags, excluding current project)
    let relatedProjects = [];
    try {
      relatedProjects = await Promise.race([
        Project.find({
          _id: { $ne: project._id },
          published: true,
          $or: [
            { category: project.category },
            { tags: { $in: project.tags || [] } }
          ]
        })
        .limit(3)
        .select('title slug image shortDescription description category tags')
        .lean(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Related query timeout")), 5000)),
      ]);
    } catch {
      // Related projects are non-critical — continue without them
      relatedProjects = [];
    }

    return {
      props: {
        project: JSON.parse(JSON.stringify(project)),
        relatedProjects: JSON.parse(JSON.stringify(relatedProjects)),
      },
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getServerSideProps project detail error:", err?.message || err);
    return { notFound: true };
  }
}

export default ProjectPage;
