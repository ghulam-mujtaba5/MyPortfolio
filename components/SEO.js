import Head from "next/head";

export default function SEO({
  title = "Ghulam Mujtaba | Portfolio",
  description = "Portfolio of Ghulam Mujtaba: Full Stack Developer, Data Scientist, and AI Specialist. Explore projects, skills, and contact information.",
  url = "https://ghulammujtaba.com",
  image = "https://ghulammujtaba.com/og-image.png",
  type = "website",
  canonical = "https://ghulammujtaba.com",
  keywords = "Ghulam Mujtaba, Portfolio, Full Stack Developer, Data Scientist, AI, Projects, Resume",
  jsonLd, // optional JSON-LD object or array of objects
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
      
      {/* Favicon - Multiple formats for maximum compatibility */}
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="icon" href="/gm-icon-32.png" sizes="32x32" type="image/png" />
      <link rel="icon" href="/gm-icon-16.png" sizes="16x16" type="image/png" />
      <link rel="shortcut icon" href="/favicon.png" />
      
      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/gm-icon-180.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/gm-icon-128.png" />
      
      {/* PWA Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Microsoft Tiles */}
      <meta name="msapplication-TileImage" content="/gm-icon-256.png" />
      <meta name="msapplication-TileColor" content="#23272F" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Optional JSON-LD passed as prop */}
      {jsonLd && Array.isArray(jsonLd)
        ? jsonLd.map((obj, i) => (
            <script
              key={`jsonld-${i}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
            />
          ))
        : jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          )}
      {children}
    </Head>
  );
}

