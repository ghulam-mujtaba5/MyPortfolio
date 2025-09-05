import Head from "next/head";

export default function SEO({
  title = "Ghulam Mujtaba | Portfolio",
  description = "Portfolio of Ghulam Mujtaba: Full Stack Developer, Data Scientist, and AI Specialist. Explore projects, skills, and contact information.",
  url = "https://ghulammujtaba.com",
  image = "https://ghulammujtaba.com/og-image.png",
  type = "website",
  canonical = "https://ghulammujtaba.com",
  keywords = "Ghulam Mujtaba, Portfolio, Full Stack Developer, Data Scientist, AI, Projects, Resume",
  children,
}) {
  // Only render one canonical tag per page. Pass the correct canonical prop from each page.
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Ghulam Mujtaba Portfolio" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {canonical && <link rel="canonical" href={canonical} />}
      <link rel="icon" href="/favicon.ico" />
      {children}
    </Head>
  );
}

