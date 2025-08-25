import Head from "next/head";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
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

const ProjectPage = ({ project }) => {
  const [isMobile, setIsMobile] = useState(false);

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
              datePublished: project.createdAt,
              dateModified: project.updatedAt,
              keywords: Array.isArray(project.tags) ? project.tags.join(", ") : undefined,
            }),
          }}
        />
      </Head>

      {isMobile ? <NavBarMobile /> : <NavBarDesktop />}

      <main>
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
