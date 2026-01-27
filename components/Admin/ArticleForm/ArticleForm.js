import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { articleSchema } from "../../../lib/validation/schemas";
import ImageUploader from "../ImageUploader/ImageUploader";
import toast from "react-hot-toast";
import Modal from "../Modal/Modal";

import styles from "./ArticleForm.premium.module.css";
import ChipInput from "./ChipInput";
import utilities from "../../../styles/utilities.module.css";
// Removed inline card preview; page-level preview uses PublicArticleCard

const RichTextEditor = dynamic(
  () => import("../RichTextEditor/RichTextEditor"),
  {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
  },
);

export default function ArticleForm({
  article = {},
  onSave,
  onPreview,
  serverErrors = {},
  isSubmitting,
  onDataChange,
}) {
  const [previewSplit, setPreviewSplit] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [autoSaveStatus, setAutoSaveStatus] = useState(""); // '', 'saving', 'saved'
  // Removed non-functional AI/assist feature states (suggest tags/headlines, grammar, tone)
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [versionForDiff, setVersionForDiff] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [targetVersion, setTargetVersion] = useState(null);
  const [ariaMessage, setAriaMessage] = useState("");
  // Removed inline card preview state (moved to page-level preview)
  // Diff helpers
  const openDiff = (v) => {
    setVersionForDiff(v);
    setIsDiffOpen(true);
    setAriaMessage(`Opened diff preview for version saved at ${new Date(v.createdAt).toLocaleString()}`);
  };
  const closeDiff = () => {
    setIsDiffOpen(false);
    setVersionForDiff(null);
  };
  const autoSaveTimer = useRef(null);
  const previewRef = useRef(null);
  const confirmRestoreBtnRef = useRef(null);
  const confirmDeleteBtnRef = useRef(null);
  const [dupWarning, setDupWarning] = useState("");
  const dupTimer = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article.title || "",
      content: article.content || "",
      excerpt: article.excerpt || "",
      tags: (article.tags || []).join(", "),
      categories: (article.categories || []).join(", "),
      published: article.published || false,
      featuredOnHome: article.featuredOnHome || false,
      coverImage: article.coverImage || "",
      coverImageFit: article.coverImageFit || "cover",
      showCoverImage:
        article.showCoverImage !== undefined ? article.showCoverImage : true,
      slug: article.slug || "",
      metaTitle: article.metaTitle || "",
      metaDescription: article.metaDescription || "",
      ogImage: article.ogImage || "",
      coverImageAlt: article.coverImageAlt || "",
      publishAt: article.publishAt
        ? new Date(article.publishAt).toISOString().slice(0, 16)
        : "",
    },
  });

  useEffect(() => {
    for (const key in serverErrors) {
      setError(key, { type: "server", message: serverErrors[key] });
    }
  }, [serverErrors, setError]);

  // Autosave Draft to localStorage
  const formValues = watch();
  const formValuesString = useMemo(
    () => JSON.stringify(formValues),
    [formValues],
  );

  // Live ArticleCard preview data derived from current form values
  const previewArticle = useMemo(() => {
    const tagsCsv = formValues?.tags || "";
    const catsCsv = formValues?.categories || "";
    const tagsArr = String(tagsCsv)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const catsArr = String(catsCsv)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    return {
      _id: article?._id, // may be undefined for new article
      id: article?._id,
      title: formValues?.title || "Untitled",
      excerpt: formValues?.excerpt || "",
      tags: tagsArr,
      categories: catsArr,
      coverImage: formValues?.coverImage || "",
      slug: formValues?.slug || "",
      views: article?.views || 0,
      createdAt: article?.createdAt || new Date().toISOString(),
      readingTime: Math.max(1, Math.ceil(((formValues?.content || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length) / 200)) + " min",
      status: (formValues?.published || false) ? "published" : "draft",
      pinned: article?.pinned || false,
    };
  }, [formValues, article?._id, article?.views, article?.createdAt, article?.pinned]);

  // Emit live changes upward for page-level preview (optional)
  useEffect(() => {
    if (typeof onDataChange === 'function') {
      onDataChange(previewArticle);
    }
  }, [previewArticle, onDataChange]);

  const getChangedFields = (v) => {
    const curTitle = watch("title") || "";
    const curExcerpt = watch("excerpt") || "";
    const curTags = (watch("tags") || "").split(",").map((t) => t.trim()).filter(Boolean);
    const curCats = (watch("categories") || "").split(",").map((t) => t.trim()).filter(Boolean);
    const verTags = (v.tags || []).map((t) => (typeof t === "string" ? t.trim() : t)).filter(Boolean);
    const verCats = (v.categories || []).map((t) => (typeof t === "string" ? t.trim() : t)).filter(Boolean);
    const sameArray = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
    const changed = [];
    if ((v.title || "") !== curTitle) changed.push("Title");
    if ((v.excerpt || "") !== curExcerpt) changed.push("Excerpt");
    if (!sameArray(verTags, curTags)) changed.push("Tags");
    if (!sameArray(verCats, curCats)) changed.push("Categories");
    const strip = (s) => (s || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
    if (strip(v.content) !== strip(watch("content") || "")) changed.push("Content");
    return changed;
  };

  // Submit handler: save article, then auto-create a version
  const handleFormSubmit = async (data) => {
    const toastId = toast.loading("Saving article...");
    try {
      const result = await (typeof onSave === "function" ? onSave(data) : null);
      toast.success("Article saved.", { id: toastId });
      // Try to resolve a saved article id from result or current prop
      const savedId = result?.article?._id || result?._id || article?._id;
      await saveVersion(savedId); // this function manages its own toast
    } catch (e) {
      toast.error(e?.message || "Failed to save article.", { id: toastId });
      console.error("Save failed:", e);
    }
  };

  useEffect(() => {
    // Skip if initial values are not ready or form is empty
    if (!formValues.title && !formValues.content) return;

    setAutoSaveStatus("saving");
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      try {
        const key = article?._id
          ? `article-draft-${article._id}`
          : "article-draft-new";
        localStorage.setItem(key,
           formValuesString);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus(""), 2000); // Keep 'saved' message for 2s
      } catch (e) {
        console.warn("Autosave to localStorage failed:", e);
        setAutoSaveStatus("");
      }
    }, 2000); // Debounce for 2 seconds

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formValuesString, article?._id]);

  // Simple word-level diff for visual highlighting
  const tokenize = (str = "") => (str || "").toString().split(/(\s+)/).filter(Boolean);
  const diffWords = (a = "", b = "") => {
    const A = tokenize(a);
    const B = tokenize(b);
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = A[i] === B[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const diffs = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) {
        diffs.push({ type: "equal", text: A[i] });
        i++; j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        diffs.push({ type: "removed", text: A[i] });
        i++;
      } else {
        diffs.push({ type: "added", text: B[j] });
        j++;
      }
    }
    while (i < n) { diffs.push({ type: "removed", text: A[i++] }); }
    while (j < m) { diffs.push({ type: "added", text: B[j++] }); }
    return diffs;
  };
  const renderDiffSpans = (diffArr, side) => (
    diffArr.map((d, idx) => {
      if (d.type === "equal") return <span key={idx}>{d.text}</span>;
      if (d.type === "removed" && side === "current")
        return <span key={idx} className={`${styles.diffMark} ${styles.diffRemoved}`}>{d.text}</span>;
      if (d.type === "added" && side === "version")
        return <span key={idx} className={`${styles.diffMark} ${styles.diffAdded}`}>{d.text}</span>;
      return <span key={idx}>{d.text}</span>;
    })
  );

  // Versions: fetch, save, restore, delete
  const fetchVersions = async () => {
    if (!article?._id) return;
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/admin/article-versions?articleId=${article._id}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load versions");
      setVersions(data.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?._id]);

  const saveVersion = async (overrideArticleId) => {
    const id = overrideArticleId || article?._id;
    if (!id) return;
    const payload = {
      articleId: id,
      title: watch("title") || "",
      content: watch("content") || "",
      excerpt: watch("excerpt") || "",
      tags: (watch("tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      categories: (watch("categories") || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    };
    const toastId = toast.loading("Saving version...");
    try {
      const res = await fetch("/api/admin/article-versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save version");
      toast.success("Version saved", { id: toastId });
      fetchVersions();
      setAriaMessage("Version saved successfully.");
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  };

  const restoreVersion = (v) => {
    setValue("title", v.title || "", { shouldDirty: true });
    setValue("content", v.content || "", { shouldDirty: true });
    setValue("excerpt", v.excerpt || "", { shouldDirty: true });
    setValue("tags", (v.tags || []).join(", "), { shouldDirty: true });
    setValue("categories", (v.categories || []).join(", "), { shouldDirty: true });
    toast.success("Version loaded into editor");
    setAriaMessage("Version restored into editor.");
  };

  const deleteVersion = async (versionId) => {
    const toastId = toast.loading("Deleting version...");
    try {
      const res = await fetch(`/api/admin/article-versions?versionId=${versionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete version");
      toast.success("Version deleted", { id: toastId });
      setVersions((prev) => prev.filter((v) => v._id !== versionId));
      setAriaMessage("Version deleted.");
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  };

  // Keyboard accessibility for version items
  const handleVersionKey = (e, v) => {
    if (e.key === "Enter") {
      // Enter previews diff
      e.preventDefault();
      setVersionForDiff(v);
      setIsDiffOpen(true);
    } else if (e.key === "R" || e.key === "r") {
      // R to restore (with confirmation modal)
      e.preventDefault();
      setTargetVersion(v);
      setConfirmRestoreOpen(true);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      // Delete to delete (with confirmation modal)
      e.preventDefault();
      setTargetVersion(v);
      setConfirmDeleteOpen(true);
    }
  };

  // Removed handlers for non-functional AI/assist features

  // Restore draft if available (only for new article or matching id)
  useEffect(() => {
    try {
      const key = article?._id
        ? `article-draft-${article._id}`
        : "article-draft-new";
      const raw = localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw);
        Object.entries(draft).forEach(([k, v]) =>
          setValue(k, v, { shouldValidate: false }),
        );
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Duplicate checker (title/slug)
  useEffect(() => {
    const title = watch("title");
    const slug = watch("slug");
    if (dupTimer.current) clearTimeout(dupTimer.current);
    if (!title && !slug) {
      setDupWarning("");
      return;
    }
    dupTimer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (slug) params.set("slug", slug);
        else if (title) params.set("title", title);
        if (article?._id) params.set("excludeId", article._id);
        const res = await fetch(
          `/api/articles/check-duplicate?${params.toString()}`,
        );
        const data = await res.json();
        if (res.ok && data.duplicate) {
          setDupWarning(
            "A post with this slug/title already exists. Consider changing it.",
          );
        } else {
          setDupWarning("");
        }
      } catch {
        // ignore
      }
    }, 450);
    return () => {
      if (dupTimer.current) clearTimeout(dupTimer.current);
    };
  }, [watch("title"), watch("slug"), article?._id]);

  // Load Prism assets once (theme + core + autoloader)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__prismLoaded) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css";
    document.head.appendChild(link);

    const scriptCore = document.createElement("script");
    scriptCore.src =
      "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js";
    scriptCore.async = true;
    scriptCore.onload = () => {
      const autoloader = document.createElement("script");
      autoloader.src =
        "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js";
      autoloader.async = true;
      autoloader.onload = () => {
        if (
          window.Prism &&
          window.Prism.plugins &&
          window.Prism.plugins.autoloader
        ) {
          window.Prism.plugins.autoloader.languages_path =
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/";
        }
        window.__prismLoaded = true;
      };
      document.body.appendChild(autoloader);
    };
    document.body.appendChild(scriptCore);
  }, []);

  // Highlight code in preview
  useEffect(() => {
    if (!previewSplit) return;
    const el = previewRef.current;
    if (!el) return;
    if (window.Prism && window.Prism.highlightAllUnder) {
      window.Prism.highlightAllUnder(el);
    }
  }, [previewSplit, formValues?.content, previewDevice]);

  // Word count from content (strip HTML)
  const wordCount = useMemo(() => {
    const html = formValues?.content || "";
    const text = html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }, [formValues?.content]);

  const readingTime = useMemo(() => {
    // Average reading speed ~200 wpm
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const slugify = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-");

  const autoSlug = useMemo(() => slugify(watch("title")), [watch("title")]);

  // Set slug from title if slug is empty
  useEffect(() => {
    if (!watch("slug")) {
      setValue("slug", autoSlug, { shouldValidate: false, shouldDirty: false });
    }
  }, [autoSlug, watch("slug"), setValue]);

  const onSubmit = (data) => {
    const submittedData = {
      ...data,
      tags: data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      categories: (data.categories || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      publishAt: data.publishAt ? new Date(data.publishAt) : null,
    };
    onSave(submittedData);
  };

  const handleImageUpload = (url) => {
    setValue("coverImage", url, { shouldValidate: true });
  };

  const handleImageUsageChange = (useImage) => {
    setValue("showCoverImage", useImage, { shouldValidate: true });
  };

  const handleOgImageUpdate = (imageUrl) => {
    setValue("ogImage", imageUrl, { shouldValidate: true });
  };

  const handleCoverImageAltChange = (altText) => {
    setValue("coverImageAlt", altText, { shouldValidate: true });
  };

  // Removed suggest tags/headlines functions

  // Meta length helpers (traffic-light thresholds)
  const metaTitleLen = (watch("metaTitle") || "").length;
  const metaDescLen = (watch("metaDescription") || "").length;

  const getTitleStatus = () => {
    if (metaTitleLen <= 60) return { label: "Good", cls: "", border: "" };
    if (metaTitleLen <= 70) return { label: "Warn", cls: styles.counterWarn, border: styles.warnLimit };
    return { label: "Over", cls: styles.counterOver, border: styles.overLimit };
  };

  const getDescStatus = () => {
    if (metaDescLen >= 150 && metaDescLen <= 160) return { label: "Good", cls: "", border: "" };
    if ((metaDescLen >= 120 && metaDescLen < 150) || (metaDescLen > 160 && metaDescLen <= 180))
      return { label: "Warn", cls: styles.counterWarn, border: styles.warnLimit };
    return { label: "Over", cls: styles.counterOver, border: styles.overLimit };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={styles.form}
      noValidate
    >
      <div className={styles.srOnly} aria-live="polite" role="status">
        {ariaMessage}
      </div>
      <div
        className={`${styles.formGroup} ${styles.fullWidth} ${styles.rowBetween}`}
      >
        <div className={`${styles.row} ${styles.alignCenter} ${styles.gapMd}`}>
          <span className={`${styles.label} ${styles.muted}`}>
            Word count: {wordCount}
          </span>
          <span className={`${styles.label} ${styles.muted}`}>
            Reading time: ~{readingTime} min
          </span>
        </div>
        <div className={`${styles.row} ${styles.alignCenter} ${styles.gapSm}`}>
          {autoSaveStatus && (
            <span className={`${styles.label} ${styles.textSm} ${styles.muted}`}>
              {autoSaveStatus === "saving" ? "Saving…" : "Saved"}
            </span>
          )}
          <button
            type="button"
            className={`${utilities.btn} ${utilities.btnSecondary}`}
            onClick={() => setPreviewSplit((v) => !v)}
          >
            {previewSplit ? "Editor Only" : "Split Preview"}
          </button>
          {/* Inline card preview toggle removed; page-level preview is used now */}
          {previewSplit && (
            <div className={styles.inlineBtnGroup}>
              <button
                type="button"
                className={`${utilities.btn} ${utilities.btnSecondary}`}
                onClick={() => setPreviewDevice("desktop")}
                disabled={previewDevice === "desktop"}
              >
                Desktop
              </button>
              <button
                type="button"
                className={`${utilities.btn} ${utilities.btnSecondary}`}
                onClick={() => setPreviewDevice("tablet")}
                disabled={previewDevice === "tablet"}
              >
                Tablet
              </button>
              <button
                type="button"
                className={`${utilities.btn} ${utilities.btnSecondary}`}
                onClick={() => setPreviewDevice("mobile")}
                disabled={previewDevice === "mobile"}
              >
                Mobile
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Inline card preview removed; see page-level preview in edit/new pages */}
      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label
          htmlFor="title"
          className={`${styles.label} ${styles.label}`}
        >
          Title
        </label>
        <input
          id="title"
          {...register("title")}
          className={`${styles.input} ${styles.input}`}
        />
        {errors.title && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.title.message}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={`${styles.label} ${styles.label}`}>
          Slug
        </label>
        <input
          {...register("slug")}
          className={`${styles.input} ${styles.input}`}
          placeholder="my-article-slug"
        />
        <p className={styles.helpText}>
          URL-friendly identifier. Auto-generated from title if left blank.
          {dupWarning && (
            <span className={`${styles.error} ${styles.ml8}`}>
              {dupWarning}
            </span>
          )}
        </p>
        {errors.slug && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.slug.message}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label
          htmlFor="tags"
          className={`${styles.label} ${styles.label}`}
        >
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          {...register("tags")}
          className={`${styles.input} ${styles.input}`}
        />
        {errors.tags && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.tags.message}
          </p>
        )}
        <ChipInput
          value={watch("tags") || ""}
          onChange={(csv) => setValue("tags", csv, { shouldDirty: true })}
          placeholder="Add a tag and press Enter"
          ariaLabel="Add tag"
          addButtonLabel="Add tag"
        />
      </div>

      <div className={styles.formGroup}>
        <label
          htmlFor="categories"
          className={`${styles.label} ${styles.label}`}
        >
          Categories (comma-separated)
        </label>
        <input
          id="categories"
          {...register("categories")}
          className={`${styles.input} ${styles.input}`}
        />
        {errors.categories && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.categories.message}
          </p>
        )}
        <ChipInput
          value={watch("categories") || ""}
          onChange={(csv) => setValue("categories", csv, { shouldDirty: true })}
          placeholder="Add a category and press Enter"
          ariaLabel="Add category"
          addButtonLabel="Add category"
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {[
            "Academics & Learning",
            "Projects & Career",
            "Engineering & Development",
            "Tech Insights & Trends",
            "Others",
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const cur = String(watch("categories") || "");
                const list = cur
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                if (!list.includes(preset)) list.push(preset);
                setValue("categories", list.join(", "), { shouldDirty: true });
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 14,
                border: "1px solid #e0e0e0",
                background: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label
          htmlFor="excerpt"
          className={`${styles.label} ${styles.label}`}
        >
          Excerpt
        </label>
        <textarea
          id="excerpt"
          {...register("excerpt")}
          className={`${styles.input} ${styles.input}`}
          rows="4"
        />
        {errors.excerpt && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.excerpt.message}
          </p>
        )}
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label className={`${styles.label} ${styles.label}`}>
          Cover Image
        </label>
        <ImageUploader
          onUpload={handleImageUpload}
          initialImageUrl={watch("coverImage")}
          onImageUsageChange={handleImageUsageChange}
          useImage={watch("showCoverImage")}
          onAltTextChange={handleCoverImageAltChange}
          contextTitle={watch("title")}
          imageType="cover"
          autoRename={true}
        />
        <div className={styles.row} style={{ gap: 12, marginTop: 8 }}>
          <label className={`${styles.label} ${styles.label}`} htmlFor="coverImageFit" style={{ margin: 0 }}>
            Image fit
          </label>
          <select
            id="coverImageFit"
            {...register("coverImageFit")}
            className={`${styles.input} ${styles.input}`}
            style={{ maxWidth: 220 }}
          >
            <option value="cover">cover</option>
            <option value="contain">contain</option>
            <option value="fill">fill</option>
            <option value="none">none</option>
            <option value="scale-down">scale-down</option>
          </select>
        </div>
        {errors.coverImage && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.coverImage.message}
          </p>
        )}
        <input type="hidden" {...register("coverImageAlt")} />
        {errors.coverImageAlt && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.coverImageAlt.message}
          </p>
        )}
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label className={`${styles.label} ${styles.label}`}>
          Content
        </label>
        {previewSplit ? (
          <div className={styles.twoCol}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} contextTitle={watch("title")} />
              )}
            />
            <div className={styles.previewOuter}>
              <div
                className={[
                  styles.previewFrameBase,
                  previewDevice === "tablet" ? styles.previewDeviceTablet : "",
                  previewDevice === "mobile" ? styles.previewDeviceMobile : "",
                  previewDevice === "desktop" ? "" : styles.previewFrame,
                ].filter(Boolean).join(" ")}
              >
                <div
                  ref={previewRef}
                  className={styles.previewContent}
                  dangerouslySetInnerHTML={{
                    __html: formValues?.content || "",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} contextTitle={watch("title")} />
            )}
          />
        )}
        {/* Removed tone adjustment controls */}
        {errors.content && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.content.message}
          </p>
        )}
      </div>

      <details className={`${styles.details} ${styles.details}`}>
        <summary className={`${styles.summary} ${styles.summary}`}>
          SEO Settings
        </summary>
        <div className={styles.detailsContent}>
          <div
            className={`${styles.formGroup} ${styles.fullWidth}`}
          >
            <label
              htmlFor="metaTitle"
              className={`${styles.label} ${styles.label}`}
            >
              Meta Title
            </label>
            <input
              id="metaTitle"
              {...register("metaTitle")}
              className={`${styles.input} ${styles.input} ${titleStatus.border}`}
              placeholder="Optimal length: 50-60 characters"
            />
            <div className={styles.helpText}>
              <span>Recommended 50–60 characters.</span>
              <span className={`${styles.helpRight} ${titleStatus.cls}`} aria-live="polite">
                {metaTitleLen}/60 • {titleStatus.label}
              </span>
            </div>
            {errors.metaTitle && (
              <p className={`${styles.error} ${styles.error}`}>
                {errors.metaTitle.message}
              </p>
            )}
          </div>

          <div
            className={`${styles.formGroup} ${styles.fullWidth}`}
          >
            <label
              htmlFor="metaDescription"
              className={`${styles.label} ${styles.label}`}
            >
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              {...register("metaDescription")}
              className={`${styles.textarea} ${styles.textarea} ${descStatus.border}`}
              placeholder="Optimal length: 150-160 characters"
              rows="3"
            ></textarea>
            <div className={styles.helpText}>
              <span>Recommended 150–160 characters.</span>
              <span className={`${styles.helpRight} ${descStatus.cls}`} aria-live="polite">
                {metaDescLen}/160 • {descStatus.label}
              </span>
            </div>
            {errors.metaDescription && (
              <p className={`${styles.error} ${styles.error}`}>
                {errors.metaDescription.message}
              </p>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={`${styles.label} ${styles.label}`}>
              Open Graph Image (for social sharing)
            </label>
            <ImageUploader
              onUpload={handleOgImageUpdate}
              initialImageUrl={watch("ogImage")}
              contextTitle={watch("title")}
              imageType="og"
              autoRename={true}
            />
            <div className={`${styles.rowBetween}`}>
              <p className={styles.helpText}>
                Recommended size: 1200x630px.
              </p>
              <button
                type="button"
                className={`${utilities.btn} ${utilities.btnSecondary}`}
                onClick={() =>
                  setValue("ogImage", watch("coverImage") || "", {
                    shouldDirty: true,
                  })
                }
                disabled={!watch("coverImage")}
                title="Copy cover image to social image"
              >
                Use Cover Image
              </button>
            </div>
            {errors.ogImage && (
              <p className={`${styles.error} ${styles.error}`}>
                {errors.ogImage.message}
              </p>
            )}
          </div>
        </div>
      </details>

      {/* Diff Modal handled below with visual highlighting */}

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label
          className={`${styles.checkboxContainer} ${styles.label}`}
        >
          <input type="checkbox" {...register("published")} />
          Published
        </label>
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label
          className={`${styles.checkboxContainer} ${styles.label}`}
        >
          <input type="checkbox" {...register("featuredOnHome")} />
          Show on Home
        </label>
        <p className={styles.helpText}>
          Toggle whether this article appears on the homepage sections.
        </p>
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label
          htmlFor="publishAt"
          className={`${styles.label} ${styles.label}`}
        >
          Schedule Publish (optional)
        </label>
        <input
          id="publishAt"
          type="datetime-local"
          {...register("publishAt")}
          className={`${styles.input} ${styles.input}`}
        />
        <p className={styles.helpText}>
          If set and in the future, article will appear as Scheduled until that
          time.
        </p>
        {errors.publishAt && (
          <p className={`${styles.error} ${styles.error}`}>
            {errors.publishAt.message}
          </p>
        )}
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <button
          type="submit"
          className={`${utilities.btn} ${utilities.btnPrimary}`}
          disabled={isSubmitting}
        >
          {article?._id ? "Update" : "Save"} Article
        </button>
      </div>
      {/* Version History */}
      <div className={styles.versionsSection}>
        <div className={styles.versionsActions}>
          <strong>Version History</strong>
          <button
            type="button"
            onClick={saveVersion}
            className={`${utilities.btn} ${utilities.btnSecondary}`}
            disabled={!article?._id || isSubmitting || versionsLoading}
          >
            Save Current Version
          </button>
        </div>
        {versionsLoading ? (
          <p>Loading versions...</p>
        ) : (
          <ul className={styles.versionsList}>
            {versions.length === 0 ? (
              <li className={styles.noVersions}>No versions saved yet.</li>
            ) : (
              versions.map((v) => (
                <li
                  key={v._id}
                  className={styles.versionItem}
                  tabIndex={0}
                  onKeyDown={(e) => handleVersionKey(e, v)}
                  aria-label={`Version ${v.title || "(Untitled)"} saved at ${new Date(v.createdAt).toLocaleString()}. Press Enter to preview diff, R to restore, or Delete to remove.`}
                >
                  <div className={styles.versionMeta}>
                    <strong>{v.title}</strong>
                    <div className={styles.versionRow}>
                      <span>Saved at {new Date(v.createdAt).toLocaleString()}</span>
                      {(() => {
                        const changed = getChangedFields(v);
                        if (changed.length === 0) return null;
                        return (
                          <div className={styles.versionBadges} aria-label="Changed fields">
                            {changed.map((c) => (
                              <span key={c} className={`${styles.versionBadge} ${styles.versionBadge}`}>{c}</span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className={styles.versionActions}>
                    <button
                      type="button"
                      className={`${utilities.btn} ${utilities.btnSecondary}`}
                      onClick={() => {
                        setTargetVersion(v);
                        setConfirmRestoreOpen(true);
                      }}
                      aria-label={`Restore version ${v.title || ''} saved at ${new Date(v.createdAt).toLocaleString()}`}
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      className={`${utilities.btn} ${utilities.btnSecondary}`}
                      onClick={() => openDiff(v)}
                      aria-label={`Preview diff for version ${v.title || ''}`}
                    >
                      Preview Diff
                    </button>
                    <button
                      type="button"
                      className={`${utilities.btn} ${utilities.btnDanger}`}
                      onClick={() => {
                        setTargetVersion(v);
                        setConfirmDeleteOpen(true);
                      }}
                      aria-label={`Delete version ${v.title || ''}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}

        <Modal
          isOpen={confirmRestoreOpen}
          onClose={() => setConfirmRestoreOpen(false)}
          title="Restore this version?"
          initialFocusRef={confirmRestoreBtnRef}
          onConfirm={() => {
            if (targetVersion) restoreVersion(targetVersion);
            setConfirmRestoreOpen(false);
            setTargetVersion(null);
          }}
          confirmText="Restore"
          cancelText="Cancel"
        >
          <p>This will overwrite the editor with the selected version.</p>
        </Modal>

        <Modal
          isOpen={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          title="Delete this version?"
          initialFocusRef={confirmDeleteBtnRef}
          onConfirm={() => {
            if (targetVersion?._id) deleteVersion(targetVersion._id);
            setConfirmDeleteOpen(false);
            setTargetVersion(null);
          }}
          confirmText="Delete"
          cancelText="Cancel"
        >
          <p>This action cannot be undone.</p>
        </Modal>

        <Modal
          isOpen={isDiffOpen}
          onClose={closeDiff}
          title="Compare with selected version"
        >
          {versionForDiff && (
            <div className={styles.diffGrid}>
              <div className={styles.diffPane}>
                <div className={styles.diffTitle}>Current</div>
                <div className={styles.diffContent}>
                  <div><strong>Title:</strong> {renderDiffSpans(diffWords(watch("title") || "", versionForDiff.title || ""), "current")}</div>
                  <div><strong>Excerpt:</strong> {renderDiffSpans(diffWords(watch("excerpt") || "", versionForDiff.excerpt || ""), "current")}</div>
                  <div><strong>Tags:</strong> {renderDiffSpans(diffWords((watch("tags") || ""), (versionForDiff.tags || []).join(", ")), "current")}</div>
                  <div><strong>Categories:</strong> {renderDiffSpans(diffWords((watch("categories") || ""), (versionForDiff.categories || []).join(", ")), "current")}</div>
                  <div><strong>Content:</strong>
                    <div className={styles.diffBlockSpacing}>
                      {renderDiffSpans(diffWords((watch("content") || "").replace(/<[^>]*>/g, " "), (versionForDiff.content || "").replace(/<[^>]*>/g, " ")), "current")}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.diffPane}>
                <div className={styles.diffTitle}>Selected Version</div>
                <div className={styles.diffContent}>
                  <div><strong>Title:</strong> {renderDiffSpans(diffWords(watch("title") || "", versionForDiff.title || ""), "version")}</div>
                  <div><strong>Excerpt:</strong> {renderDiffSpans(diffWords(watch("excerpt") || "", versionForDiff.excerpt || ""), "version")}</div>
                  <div><strong>Tags:</strong> {renderDiffSpans(diffWords((watch("tags") || ""), (versionForDiff.tags || []).join(", ")), "version")}</div>
                  <div><strong>Categories:</strong> {renderDiffSpans(diffWords((watch("categories") || ""), (versionForDiff.categories || []).join(", ")), "version")}</div>
                  <div><strong>Content:</strong>
                    <div className={styles.diffBlockSpacing}>
                      {renderDiffSpans(diffWords((watch("content") || "").replace(/<[^>]*>/g, " "), (versionForDiff.content || "").replace(/<[^>]*>/g, " ")), "version")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={styles.modalFooter}>
            <button className={`${utilities.btn} ${utilities.btnPrimary}`} onClick={() => { if (versionForDiff) restoreVersion(versionForDiff); closeDiff(); }}>Restore this Version</button>
            <button className={`${utilities.btn} ${utilities.btnSecondary}`} onClick={closeDiff}>Close</button>
          </div>
        </Modal>
      </div>
    </form>
  );
}
