import Head from "next/head";
import Link from "next/link";
import SEO from "../components/SEO";
import dbConnect from "../lib/mongoose";
import Article from "../models/Article";
import Project from "../models/Project";
import ScrollReveal from "../components/AnimatedUI/ScrollReveal";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function SearchPage({ q, page, limit, articleResults, projectResults, totalArticles, totalProjects }) {
  const total = (totalArticles || 0) + (totalProjects || 0);
  const canonical = `https://ghulammujtaba.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: q ? `Search results for ${q}` : "Search",
    url: canonical,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://ghulammujtaba.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <SEO
        title={`Search${q ? `: ${q}` : ""} | Ghulam Mujtaba`}
        description={q ? `Results for "${q}" across articles and projects.` : "Search projects and articles on Ghulam Mujtaba's portfolio."}
        canonical={canonical}
        jsonLd={jsonLd}
      />
      <Head>
        <meta name="robots" content="index,follow" />
      </Head>
      <main style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
        <h1 style={{ marginBottom: 12 }}>Search</h1>
        <form role="search" method="GET" action="/search" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <input type="search" name="q" defaultValue={q} placeholder="Search articles or projects" aria-label="Search term" style={{ flex: 1, padding: 10 }} />
          <button type="submit">Search</button>
        </form>

        {q ? (
          <p style={{ color: "#555", marginBottom: 16 }}>
            {total} results for <strong>"{q}"</strong>
          </p>
        ) : (
          <p style={{ color: "#555", marginBottom: 16 }}>Enter a query to search articles and projects.</p>
        )}

        {articleResults?.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2>Articles</h2>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
              {articleResults.map((a, index) => (
                <ScrollReveal key={a.slug} animation="fadeInUp" delay={index * 50} width="100%" as="li">
                  <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                    <Link href={`/articles/${a.slug}`} style={{ fontSize: 18, fontWeight: 600 }}>{a.title}</Link>
                    {a.excerpt && <p style={{ margin: "6px 0", color: "#444" }}>{a.excerpt}</p>}
                    {Array.isArray(a.tags) && a.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {a.tags.slice(0, 5).map((t) => (
                          <span key={t} style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </ul>
          </section>
        )}

        {projectResults?.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2>Projects</h2>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
              {projectResults.map((p, index) => (
                <ScrollReveal key={p.slug} animation="fadeInUp" delay={index * 50} width="100%" as="li">
                  <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                    <Link href={`/projects/${p.slug}`} style={{ fontSize: 18, fontWeight: 600 }}>{p.title}</Link>
                    {p.description && <p style={{ margin: "6px 0", color: "#444" }}>{p.description.substring(0, 160)}</p>}
                    {Array.isArray(p.tags) && p.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {p.tags.slice(0, 5).map((t) => (
                          <span key={t} style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </ul>
          </section>
        )}

        {q && total === 0 && (
          <p>No results found.</p>
        )}

        {/* Simple pagination for combined results: step both lists together for now */}
        {q && (totalArticles > limit || totalProjects > limit) && (
          <nav style={{ display: "flex", gap: 8 }} aria-label="Pagination">
            {page > 1 && (
              <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}&limit=${limit}`}>{"< Prev"}</Link>
            )}
            {(totalArticles > page * limit || totalProjects > page * limit) && (
              <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}&limit=${limit}`}>{"Next >"}</Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const { q = "", page = "1", limit = "10" } = context.query;
  const pageNum = clamp(parseInt(page, 10) || 1, 1, 500);
  const pageSize = clamp(parseInt(limit, 10) || 10, 1, 50);
  const skip = (pageNum - 1) * pageSize;

  await dbConnect();

  const baseFilter = { published: true };
  const hasQuery = typeof q === "string" && q.trim().length > 0;

  // Build filters for articles and projects
  const articleFilter = hasQuery
    ? { ...baseFilter, $text: { $search: q.trim() } }
    : baseFilter;
  const projectFilter = hasQuery
    ? { ...baseFilter, $text: { $search: q.trim() } }
    : baseFilter;

  // Projections and sorting
  const articleProjection = {
    title: 1,
    slug: 1,
    excerpt: 1,
    tags: 1,
    createdAt: 1,
    ...(hasQuery ? { score: { $meta: "textScore" } } : {}),
  };
  const projectProjection = {
    title: 1,
    slug: 1,
    description: 1,
    tags: 1,
    createdAt: 1,
    ...(hasQuery ? { score: { $meta: "textScore" } } : {}),
  };
  const articleSort = hasQuery ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 };
  const projectSort = hasQuery ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 };

  // Fetch in parallel
  const [articles, projects, totalArticles, totalProjects] = await Promise.all([
    Article.find(articleFilter).select(articleProjection).sort(articleSort).skip(skip).limit(pageSize).lean(),
    Project.find(projectFilter).select(projectProjection).sort(projectSort).skip(skip).limit(pageSize).lean(),
    Article.countDocuments(articleFilter),
    Project.countDocuments(projectFilter),
  ]);

  return {
    props: {
      q: typeof q === "string" ? q : "",
      page: pageNum,
      limit: pageSize,
      articleResults: JSON.parse(JSON.stringify(articles)),
      projectResults: JSON.parse(JSON.stringify(projects)),
      totalArticles,
      totalProjects,
    },
  };
}
