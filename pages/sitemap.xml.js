export async function getServerSideProps({ res }) {
  const base = "https://ghulammujtaba.com";
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    `<sitemap><loc>${base}/sitemap-0.xml</loc><lastmod>${now}</lastmod></sitemap>` +
    `<sitemap><loc>${base}/sitemap-dynamic.xml</loc><lastmod>${now}</lastmod></sitemap>` +
    `</sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=600");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function SitemapIndex() {
  return null;
}
