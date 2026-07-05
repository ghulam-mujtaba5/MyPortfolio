// utils/revalidate.js

/**
 * Revalidates public pages associated with projects.
 * @param {import('next').NextApiResponse} res 
 * @param {string} [slug] 
 */
export async function revalidateProject(res, slug) {
  try {
    if (res && typeof res.revalidate === "function") {
      // Revalidate homepage and projects listing page
      await res.revalidate("/");
      await res.revalidate("/projects");
      if (slug) {
        await res.revalidate(`/projects/${slug}`);
      }
    }
  } catch (err) {
    console.error("Failed to revalidate project pages:", err);
  }
}

/**
 * Revalidates public pages associated with articles/insights.
 * @param {import('next').NextApiResponse} res 
 * @param {string} [slug] 
 */
export async function revalidateArticle(res, slug) {
  try {
    if (res && typeof res.revalidate === "function") {
      // Revalidate homepage and insights page
      await res.revalidate("/");
      await res.revalidate("/insights");
      if (slug) {
        await res.revalidate(`/insights/${slug}`);
      }
    }
  } catch (err) {
    console.error("Failed to revalidate article pages:", err);
  }
}
