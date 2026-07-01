// /articles was the old route name for the insights listing.
// /insights is now canonical (nav, sitemap, robots.txt all point there).
// Redirect keeps any inbound links/backlinks and stops duplicate-content
// competition between two fully-built, self-canonicalized page sets.

export default function ArticlesRedirect() {
  return null;
}

export async function getServerSideProps({ query }) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (typeof value === "string" && value) qs.set(key, value);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return {
    redirect: {
      destination: `/insights${suffix}`,
      permanent: true,
    },
  };
}
