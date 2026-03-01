// This page previously served a separate dynamic sitemap.
// Now sitemap.xml.js serves the complete sitemap (static + dynamic).
// Redirect to the canonical sitemap URL to avoid 404s for any cached references.

export async function getServerSideProps({ res }) {
  res.setHeader("Location", "https://ghulammujtaba.com/sitemap.xml");
  res.statusCode = 301;
  res.end();
  return { props: {} };
}

export default function SiteMapDynamic() {
  return null;
}

