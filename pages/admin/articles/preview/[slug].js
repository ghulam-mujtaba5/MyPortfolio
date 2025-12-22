// pages/admin/articles/preview/[slug].js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../../components/Admin/AdminLayout/AdminLayout";
import Link from "next/link";
import styles from "./articles-preview.premium.module.css";
import Modal from "../../../../components/Admin/Modal/Modal";
import utilities from "../../../../styles/utilities.module.css";

export default function AdminArticlePreviewPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmBtnRef = useRef(null);

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

  const doPublishNow = async () => {
    if (!article) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/articles/${encodeURIComponent(article.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishAt: null, published: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to publish");
      router.replace(router.asPath);
    } catch (e) {
      // Surface error inline below title using error state
      setError(e.message || "Failed to publish");
    } finally {
      setUpdating(false);
      setConfirmOpen(false);
    }
  };

  return (
    <AdminLayout
      title={article ? `Preview: ${article.title}` : "Preview Article"}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Preview</h1>
        <div className={styles.actions}>
          <button className={`${utilities.btn} ${utilities.btnIcon}`} onClick={() => router.back()}>
            Back
          </button>
          {article &&
            article.published &&
            (!article.publishAt ||
              new Date(article.publishAt) <= new Date()) && (
              <Link
                href={`/articles/${encodeURIComponent(article.slug)}`}
                className={`${utilities.btn} ${utilities.btnIcon} ${utilities.btnPrimary}`}
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
                onClick={() => setConfirmOpen(true)}
                className={`${utilities.btn} ${utilities.btnIcon} ${utilities.btnPrimary}`}
                title="Publish now"
                aria-label="Publish now"
              >
                {updating ? "Publishing…" : "Publish Now"}
              </button>
            )}
        </div>
      </div>

      {loading && (
        <p className={styles.statusText}>Loading…</p>
      )}
      {error && (
        <p className={styles.statusError}>{error}</p>
      )}

      {article && (
        <article>
          <div className={styles.metaSection}>
            <h2 className={styles.articleTitle}>{article.title}</h2>
            <div className={styles.metaRow}>
              <span
                className={`${styles.chip} ${article.published ? (article.publishAt && new Date(article.publishAt) > new Date() ? styles.chipAmber : styles.chipGreen) : styles.chipGray}`}
              >
                {article.published
                  ? article.publishAt && new Date(article.publishAt) > new Date()
                    ? "Scheduled"
                    : "Published"
                  : "Draft"}
              </span>
              {article.publishAt && (
                <span className={styles.publishDate}>
                  Publish At: {new Date(article.publishAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {article.coverImage && article.showCoverImage !== false && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt={article.title}
                className={styles.coverImage}
              />
            </div>
          )}

          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className={styles.tagsRow}>
              {article.tags.map((t) => (
                <span
                  key={t}
                  className={`${styles.chip} ${styles.chipGray}`}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {Array.isArray(article.categories) &&
            article.categories.length > 0 && (
              <div className={styles.tagsRow}>
                {article.categories.map((c) => (
                  <span
                    key={c}
                    className={`${styles.chip} ${styles.chipGray}`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

          {Array.isArray(article.highlights) &&
            article.highlights.length > 0 && (
              <div aria-label="Highlights" className={styles.highlightsSection}>
                <h3 className={styles.highlightsTitle}>Highlights</h3>
                <div>
                  {article.highlights.map((q, idx) => (
                    <figure key={idx} className={styles.quoteCard}>
                      <blockquote className={styles.blockquote}>“{q}”</blockquote>
                    </figure>
                  ))}
                </div>
              </div>
            )}

          <div className={styles.content}>
            {/* Attempt to render HTML; fallback to text */}
            <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
          </div>
        </article>
      )}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Publish Article Now"
        onConfirm={doPublishNow}
        initialFocusRef={confirmBtnRef}
        confirmText={updating ? "Publishing…" : "Publish"}
        cancelText="Cancel"
      >
        <p>
          This will make the article publicly visible immediately. Do you want to continue?
        </p>
      </Modal>
    </AdminLayout>
  );
}
