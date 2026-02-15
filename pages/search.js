import Head from "next/head";
import Link from "next/link";
import SEO from "../components/SEO";
import NavBarDesktop from "../components/NavBar_Desktop/nav-bar";
import NavBarMobile from "../components/NavBar_Mobile/NavBar-mobile";
import Footer from "../components/Footer/Footer";
import { useTheme } from "../context/ThemeContext";
import { MAIN_SECTIONS } from "../constants/navigation";
import dbConnect from "../lib/mongoose";
import Article from "../models/Article";
import Project from "../models/Project";
import ScrollReveal from "../components/AnimatedUI/ScrollReveal";
import styles from "../styles/Search.module.css";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function SearchPage({ q, page, limit, articleResults, projectResults, totalArticles, totalProjects }) {
  const { theme } = useTheme();
  const total = (totalArticles || 0) + (totalProjects || 0);
  const canonical = `https://ghulammujtaba.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`;
  const themeClass = theme === "dark" ? styles.darkTheme : styles.lightTheme;

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
        noindex={true}
      />
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className={`${styles.searchPage} ${themeClass}`} style={{ backgroundColor: theme === "dark" ? "#1d2127" : "#ffffff" }}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <header>
          <nav><NavBarDesktop /></nav>
          <nav><NavBarMobile sections={MAIN_SECTIONS} /></nav>
        </header>
        <main id="main-content" className={styles.searchMain}>
          <h1 className={styles.searchTitle}>Search</h1>
          <form role="search" method="GET" action="/search" className={styles.searchForm}>
            <input type="search" name="q" defaultValue={q} placeholder="Search articles or projects" aria-label="Search term" className={styles.searchInput} />
            <button type="submit" className={styles.searchButton}>Search</button>
          </form>

          {q ? (
            <p className={styles.resultSummary}>
              {total} results for <strong>&ldquo;{q}&rdquo;</strong>
            </p>
          ) : (
            <p className={styles.resultSummary}>Enter a query to search articles and projects.</p>
          )}

          {articleResults?.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Articles</h2>
              <ul className={styles.resultList}>
                {articleResults.map((a, index) => (
                  <ScrollReveal key={a.slug} animation="fadeInUp" delay={index * 50} width="100%" as="li">
                    <div className={styles.resultItem}>
                      <Link href={`/articles/${a.slug}`} className={styles.resultLink}>{a.title}</Link>
                      {a.excerpt && <p className={styles.resultExcerpt}>{a.excerpt}</p>}
                      {Array.isArray(a.tags) && a.tags.length > 0 && (
                        <div className={styles.tagsRow}>
                          {a.tags.slice(0, 5).map((t) => (
                            <span key={t} className={styles.tag}>#{t}</span>
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
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Projects</h2>
              <ul className={styles.resultList}>
                {projectResults.map((p, index) => (
                  <ScrollReveal key={p.slug} animation="fadeInUp" delay={index * 50} width="100%" as="li">
                    <div className={styles.resultItem}>
                      <Link href={`/projects/${p.slug}`} className={styles.resultLink}>{p.title}</Link>
                      {p.description && <p className={styles.resultExcerpt}>{p.description.substring(0, 160)}</p>}
                      {Array.isArray(p.tags) && p.tags.length > 0 && (
                        <div className={styles.tagsRow}>
                          {p.tags.slice(0, 5).map((t) => (
                            <span key={t} className={styles.tag}>#{t}</span>
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
            <p className={styles.noResults}>No results found.</p>
          )}

          {q && (totalArticles > limit || totalProjects > limit) && (
            <nav className={styles.pagination} aria-label="Pagination">
              {page > 1 && (
                <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}&limit=${limit}`}>{"< Prev"}</Link>
              )}
              {(totalArticles > page * limit || totalProjects > page * limit) && (
                <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}&limit=${limit}`}>{"Next >"}</Link>
              )}
            </nav>
          )}
        </main>
        <Footer />
      </div>
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
