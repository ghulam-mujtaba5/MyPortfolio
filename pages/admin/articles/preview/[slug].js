// pages/admin/articles/preview/[slug].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../../components/Admin/AdminLayout/AdminLayout";
import Link from "next/link";
import styles from "../articles.module.css";

export default function AdminArticlePreviewPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/admin/articles/preview/${encodeURIComponent(slug)}`,
        );
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Failed to load preview");
        setArticle(data.data);
      } catch (e) {
        setError(e.message || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const publishNow = async () => {
    if (!article) return;
    if (
      !confirm(
        "Publish now? This will make the article publicly visible immediately.",
      )
    )
      return;
    try {
      setUpdating(true);
      const res = await fetch(
        `/api/articles/${encodeURIComponent(article.slug)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publishAt: null, published: true }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to publish");
      // refresh
      router.replace(router.asPath);
    } catch (e) {
      alert(e.message || "Failed to publish");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout
      title={article ? `Preview: ${article.title}` : "Preview Article"}
    >
      <div className={styles.header}>
        <h1>Preview</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={styles.iconButton} onClick={() => router.back()}>
            Back
          </button>
          {article &&
            article.published &&
            (!article.publishAt ||
              new Date(article.publishAt) <= new Date()) && (
              <Link
                href={`/articles/${encodeURIComponent(article.slug)}`}
                className={`${styles.iconButton} ${styles.iconButtonPrimary}`}
                title="View public"
                aria-label="View public"
              >
                View Public
              </Link>
            )}
          {article &&
            article.published &&
            article.publishAt &&
            new Date(article.publishAt) > new Date() && (
              <button
                disabled={updating}
                onClick={publishNow}
                className={`${styles.iconButton} ${styles.iconButtonPrimary}`}
                title="Publish now"
                aria-label="Publish now"
              >
                {updating ? "Publishing…" : "Publish Now"}
              </button>
            )}
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {article && (
        <article style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0 }}>{article.title}</h2>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              {article.published
                ? article.publishAt && new Date(article.publishAt) > new Date()
                  ? "Scheduled"
                  : "Published"
                : "Draft"}
            </span>
            {article.publishAt && (
              <span style={{ opacity: 0.8 }}>
                Publish At: {new Date(article.publishAt).toLocaleString()}
              </span>
            )}
          </div>

          {article.coverImage && article.showCoverImage !== false && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt={article.title}
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
            </div>
          )}

          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {article.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {Array.isArray(article.categories) &&
            article.categories.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {article.categories.map((c) => (
                  <span
                    key={c}
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

          {Array.isArray(article.highlights) &&
            article.highlights.length > 0 && (
              <div
                style={{ display: "grid", gap: 8, marginTop: 8 }}
                aria-label="Highlights"
              >
                <h3 style={{ margin: "8px 0 0 0" }}>Highlights</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {article.highlights.map((q, idx) => (
                    <figure
                      key={idx}
                      style={{
                        margin: 0,
                        padding: "10px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        background: "#f9fafb",
                        maxWidth: "100%",
                      }}
                    >
                      <blockquote style={{ margin: 0, fontStyle: "italic" }}>
                        “{q}”
                      </blockquote>
                    </figure>
                  ))}
                </div>
              </div>
            )}

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              marginTop: 8,
              paddingTop: 12,
            }}
          >
            {/* Attempt to render HTML; fallback to text */}
            <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
          </div>
        </article>
      )}
    </AdminLayout>
  );
}
