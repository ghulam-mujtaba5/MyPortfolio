import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { articleSchema } from "../../../lib/validation/schemas";
import ImageUploader from "../ImageUploader/ImageUploader";
import { useTheme } from "../../../context/ThemeContext";
import toast from "react-hot-toast";
import Modal from "../Modal/Modal";

import commonStyles from "./ArticleForm.module.css";
import lightStyles from "./ArticleForm.light.module.css";
import darkStyles from "./ArticleForm.dark.module.css";
import ChipInput from "./ChipInput";
import utilities from "../../../styles/utilities.module.css";

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
}) {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const [previewSplit, setPreviewSplit] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [autoSaveStatus, setAutoSaveStatus] = useState(""); // '', 'saving', 'saved'
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isSuggestingHeadlines, setIsSuggestingHeadlines] = useState(false);
  const [suggestedHeadlines, setSuggestedHeadlines] = useState([]);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [isAdjustingTone, setIsAdjustingTone] = useState(false);
  const [tone, setTone] = useState("professional"); // 'professional' | 'friendly' | 'casual' | 'concise'
  const [adjustedContent, setAdjustedContent] = useState("");
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [versionForDiff, setVersionForDiff] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [targetVersion, setTargetVersion] = useState(null);
  const [ariaMessage, setAriaMessage] = useState("");
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
      coverImage: article.coverImage || "",
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
        return <span key={idx} className={`${commonStyles.diffMark} ${themeStyles.diffRemoved}`}>{d.text}</span>;
      if (d.type === "added" && side === "version")
        return <span key={idx} className={`${commonStyles.diffMark} ${themeStyles.diffAdded}`}>{d.text}</span>;
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

  // Grammar check using /api/admin/grammar-check
  const handleGrammarCheck = async () => {
    const text = watch("content");
    if (!text || text.trim().length < 10) {
      toast.error("Please add some content first.");
      return;
    }
    setIsCheckingGrammar(true);
    const toastId = toast.loading("Checking grammar...");
    try {
      const res = await fetch("/api/admin/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Grammar check failed");
      const matches = Array.isArray(data?.matches) ? data.matches.length : 0;
      toast.success(`${matches} issue${matches === 1 ? "" : "s"} found.`, { id: toastId });
      // Optionally, we could render a side panel of issues in a future pass.
    } catch (e) {
      toast.error(e.message, { id: toastId });
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  // Adjust tone using /api/admin/adjust-tone
  const handleAdjustTone = async () => {
    const text = watch("content");
    if (!text || text.trim().length < 10) {
      toast.error("Please add some content first.");
      return;
    }
    setIsAdjustingTone(true);
    setAdjustedContent("");
    const toastId = toast.loading("Adjusting tone...");
    try {
      const res = await fetch("/api/admin/adjust-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tone adjustment failed");
      setAdjustedContent(data.adjustedText || "");
      toast.success("Tone suggestion ready!", { id: toastId });
    } catch (e) {
      toast.error(e.message, { id: toastId });
    } finally {
      setIsAdjustingTone(false);
    }
  };

  const applyAdjustedContent = () => {
    if (!adjustedContent) return;
    setValue("content", adjustedContent, { shouldDirty: true });
    setAdjustedContent("");
  };

  // Generate alt text for cover image
  const handleGenerateAltText = async () => {
    const imageUrl = watch("coverImage");
    if (!imageUrl) {
      toast.error("Please upload/select a cover image first.");
      return;
    }
    const toastId = toast.loading("Generating alt text...");
    try {
      const res = await fetch("/api/admin/generate-alt-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate alt text");
      setValue("coverImageAlt", data.altText || "", { shouldDirty: true });
      toast.success("Alt text generated!", { id: toastId });
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  };

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

  const handleSuggestTags = async () => {
    const content = watch("content");
    if (!content || content.trim().length < 50) {
      toast.error(
        "Please write at least 50 characters of content before suggesting tags.",
      );
      return;
    }

    setIsSuggestingTags(true);
    const toastId = toast.loading("Analyzing content...");

    try {
      const res = await fetch("/api/admin/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get suggestions");

      const existingTags = new Set(
        (watch("tags") || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      );
      data.tags.forEach((tag) => existingTags.add(tag));

      setValue("tags", Array.from(existingTags).join(", "), {
        shouldDirty: true,
      });
      toast.success("Tags added!", { id: toastId });
    } catch (e) {
      toast.error(e.message, { id: toastId });
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleSuggestHeadlines = async () => {
    const content = watch("content");
    if (!content || content.trim().length < 100) {
      toast.error(
        "Please write at least 100 characters of content to generate headlines.",
      );
      return;
    }

    setIsSuggestingHeadlines(true);
    setSuggestedHeadlines([]);
    const toastId = toast.loading("Generating headlines...");

    try {
      const res = await fetch("/api/admin/suggest-headlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get suggestions");

      setSuggestedHeadlines(data.headlines);
      toast.success("Suggestions ready!", { id: toastId });
    } catch (e) {
      toast.error(e.message, { id: toastId });
    } finally {
      setIsSuggestingHeadlines(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={commonStyles.form}
      noValidate
    >
      <div className={commonStyles.srOnly} aria-live="polite" role="status">
        {ariaMessage}
      </div>
      <div
        className={`${commonStyles.formGroup} ${commonStyles.fullWidth} ${commonStyles.rowBetween}`}
      >
        <div className={`${commonStyles.row} ${commonStyles.alignCenter} ${commonStyles.gapMd}`}>
          <span className={`${themeStyles.label} ${commonStyles.muted}`}>
            Word count: {wordCount}
          </span>
          <span className={`${themeStyles.label} ${commonStyles.muted}`}>
            Reading time: ~{readingTime} min
          </span>
        </div>
        <div className={`${commonStyles.row} ${commonStyles.alignCenter} ${commonStyles.gapSm}`}>
          {autoSaveStatus && (
            <span className={`${themeStyles.label} ${commonStyles.textSm} ${commonStyles.muted}`}>
              {autoSaveStatus === "saving" ? "Saving…" : "Saved"}
            </span>
          )}
          <button type="button" className={`${utilities.btn} ${utilities.btnSecondary}`} onClick={handleGrammarCheck} disabled={isCheckingGrammar}>
            {isCheckingGrammar ? "Checking…" : "Grammar Check"}
          </button>
          <button
            type="button"
            className={`${utilities.btn} ${utilities.btnSecondary}`}
            onClick={() => setPreviewSplit((v) => !v)}
          >
            {previewSplit ? "Editor Only" : "Split Preview"}
          </button>
          {previewSplit && (
            <div className={commonStyles.inlineBtnGroup}>
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
      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label
          htmlFor="title"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Title
        </label>
        <div className={`${commonStyles.row} ${commonStyles.alignCenter} ${commonStyles.gapSm}`}>
          <input
            id="title"
            {...register("title")}
            className={`${commonStyles.input} ${themeStyles.input} ${commonStyles.flex1}`}
          />
          <button
            type="button"
            className={`${utilities.btn} ${utilities.btnSecondary}`}
            onClick={handleSuggestHeadlines}
            disabled={isSuggestingHeadlines}
          >
            {isSuggestingHeadlines ? "Generating..." : "Suggest Headlines"}
          </button>
        </div>
        {suggestedHeadlines.length > 0 && (
          <div className={commonStyles.suggestionsContainer}>
            <h4 className={commonStyles.suggestionsTitle}>Suggestions:</h4>
            <ul className={commonStyles.suggestionsList}>
              {suggestedHeadlines.map((headline, index) => (
                <li
                  key={index}
                  onClick={() =>
                    setValue("title", headline, { shouldDirty: true })
                  }
                  className={commonStyles.suggestionItem}
                >
                  {headline}
                </li>
              ))}
            </ul>
          </div>
        )}
        {errors.title && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
            {errors.title.message}
          </p>
        )}
      </div>

      <div className={commonStyles.formGroup}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
          Slug
        </label>
        <input
          {...register("slug")}
          className={`${commonStyles.input} ${themeStyles.input}`}
          placeholder="my-article-slug"
        />
        <p className={commonStyles.helpText}>
          URL-friendly identifier. Auto-generated from title if left blank.
          {dupWarning && (
            <span className={`${themeStyles.error} ${commonStyles.ml8}`}>
              {dupWarning}
            </span>
          )}
        </p>
        {errors.slug && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
            {errors.slug.message}
          </p>
        )}
      </div>

      <div className={commonStyles.formGroup}>
        <label
          htmlFor="tags"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Tags (comma-separated)
        </label>
        <div className={`${commonStyles.row} ${commonStyles.alignCenter} ${commonStyles.gapSm}`}>
          <input
            id="tags"
            {...register("tags")}
            className={`${commonStyles.input} ${themeStyles.input} ${commonStyles.flex1}`}
          />
          <button
            type="button"
            className={`${utilities.btn} ${utilities.btnSecondary}`}
            onClick={handleSuggestTags}
            disabled={isSuggestingTags}
          >
            {isSuggestingTags ? "Suggesting..." : "Suggest Tags"}
          </button>
        </div>
        {errors.tags && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
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

      <div className={commonStyles.formGroup}>
        <label
          htmlFor="categories"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Categories (comma-separated)
        </label>
        <input
          id="categories"
          {...register("categories")}
          className={`${commonStyles.input} ${themeStyles.input}`}
        />
        {errors.categories && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
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
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label
          htmlFor="excerpt"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Excerpt
        </label>
        <textarea
          id="excerpt"
          {...register("excerpt")}
          className={`${commonStyles.input} ${themeStyles.input}`}
          rows="4"
        />
        {errors.excerpt && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
            {errors.excerpt.message}
          </p>
        )}
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
          Cover Image
        </label>
        <ImageUploader
          onUpload={handleImageUpload}
          initialImageUrl={watch("coverImage")}
          onImageUsageChange={handleImageUsageChange}
          useImage={watch("showCoverImage")}
          onAltTextChange={handleCoverImageAltChange}
        />
        <div className={commonStyles.inlineRow}>
          <button type="button" className={`${utilities.btn} ${utilities.btnSecondary}`} onClick={handleGenerateAltText}>
            Generate Alt Text
          </button>
        </div>
        {errors.coverImage && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
            {errors.coverImage.message}
          </p>
        )}
        <input type="hidden" {...register("coverImageAlt")} />
        {errors.coverImageAlt && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
            {errors.coverImageAlt.message}
          </p>
        )}
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
          Content
        </label>
        {previewSplit ? (
          <div className={commonStyles.twoCol}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} />
              )}
            />
            <div className={commonStyles.previewOuter}>
              <div
                className={[
                  commonStyles.previewFrameBase,
                  previewDevice === "tablet" ? commonStyles.previewDeviceTablet : "",
                  previewDevice === "mobile" ? commonStyles.previewDeviceMobile : "",
                  previewDevice === "desktop" ? "" : themeStyles.previewFrame,
                ].filter(Boolean).join(" ")}
              >
                <div
                  ref={previewRef}
                  className={commonStyles.previewContent}
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
              <RichTextEditor value={field.value} onChange={field.onChange} />
            )}
          />
        )}
        {/* Tone adjustment controls */}
        <div className={commonStyles.inlineRow}>
          <label className={`${commonStyles.label} ${themeStyles.label} ${commonStyles.noMargin}`}>Tone:</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className={`${commonStyles.input} ${themeStyles.input} ${commonStyles.maxW200}`}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="confident">Confident</option>
          </select>
          <button type="button" className={`${utilities.btn} ${utilities.btnSecondary}`} onClick={handleAdjustTone} disabled={isAdjustingTone}>
            {isAdjustingTone ? "Adjusting…" : "Adjust Tone"}
          </button>
          {adjustedContent && (
            <button type="button" className={`${utilities.btn} ${utilities.btnSecondary}`} onClick={applyAdjustedContent}>
              Apply Suggestion
            </button>
          )}
        </div>
        {errors.content && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
            {errors.content.message}
          </p>
        )}
      </div>

      <details className={`${commonStyles.details} ${themeStyles.details}`}>
        <summary className={`${commonStyles.summary} ${themeStyles.summary}`}>
          SEO Settings
        </summary>
        <div className={commonStyles.detailsContent}>
          <div
            className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}
          >
            <label
              htmlFor="metaTitle"
              className={`${commonStyles.label} ${themeStyles.label}`}
            >
              Meta Title
            </label>
            <input
              id="metaTitle"
              {...register("metaTitle")}
              className={`${commonStyles.input} ${themeStyles.input} ${((watch("metaTitle") || "").length > 60) ? themeStyles.overLimit : ""}`}
              placeholder="Optimal length: 50-60 characters"
            />
            <div className={commonStyles.helpText}>
              <span>Recommended 50–60 characters.</span>
              <span className={commonStyles.helpRight} aria-live="polite">
                {(watch("metaTitle") || "").length}/60
              </span>
            </div>
            {errors.metaTitle && (
              <p className={`${commonStyles.error} ${themeStyles.error}`}>
                {errors.metaTitle.message}
              </p>
            )}
          </div>

          <div
            className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}
          >
            <label
              htmlFor="metaDescription"
              className={`${commonStyles.label} ${themeStyles.label}`}
            >
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              {...register("metaDescription")}
              className={`${commonStyles.textarea} ${themeStyles.textarea} ${((watch("metaDescription") || "").length > 160) ? themeStyles.overLimit : ""}`}
              placeholder="Optimal length: 150-160 characters"
              rows="3"
            ></textarea>
            <div className={commonStyles.helpText}>
              <span>Recommended 150–160 characters.</span>
              <span className={commonStyles.helpRight} aria-live="polite">
                {(watch("metaDescription") || "").length}/160
              </span>
            </div>
            {errors.metaDescription && (
              <p className={`${commonStyles.error} ${themeStyles.error}`}>
                {errors.metaDescription.message}
              </p>
            )}
          </div>

          <div
            className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}
          >
            <label className={`${commonStyles.label} ${themeStyles.label}`}>
              Open Graph Image (for social sharing)
            </label>
            <ImageUploader
              onUpload={handleOgImageUpdate}
              initialImageUrl={watch("ogImage")}
            />
            <div className={`${commonStyles.rowBetween}`}>
              <p className={commonStyles.helpText}>
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
              <p className={`${commonStyles.error} ${themeStyles.error}`}>
                {errors.ogImage.message}
              </p>
            )}
          </div>
        </div>
      </details>

      {/* Diff Modal handled below with visual highlighting */}

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label
          className={`${commonStyles.checkboxContainer} ${themeStyles.label}`}
        >
          <input type="checkbox" {...register("published")} />
          Published
        </label>
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label
          htmlFor="publishAt"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Schedule Publish (optional)
        </label>
        <input
          id="publishAt"
          type="datetime-local"
          {...register("publishAt")}
          className={`${commonStyles.input} ${themeStyles.input}`}
        />
        <p className={commonStyles.helpText}>
          If set and in the future, article will appear as Scheduled until that
          time.
        </p>
        {errors.publishAt && (
          <p className={`${commonStyles.error} ${themeStyles.error}`}>
            {errors.publishAt.message}
          </p>
        )}
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <button
          type="submit"
          className={`${utilities.btn} ${utilities.btnPrimary}`}
          disabled={isSubmitting}
        >
          {article?._id ? "Update" : "Save"} Article
        </button>
      </div>
      {/* Version History */}
      <div className={commonStyles.versionsSection}>
        <div className={commonStyles.versionsActions}>
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
          <ul className={commonStyles.versionsList}>
            {versions.length === 0 ? (
              <li className={commonStyles.noVersions}>No versions saved yet.</li>
            ) : (
              versions.map((v) => (
                <li
                  key={v._id}
                  className={commonStyles.versionItem}
                  tabIndex={0}
                  onKeyDown={(e) => handleVersionKey(e, v)}
                  aria-label={`Version ${v.title || "(Untitled)"} saved at ${new Date(v.createdAt).toLocaleString()}. Press Enter to preview diff, R to restore, or Delete to remove.`}
                >
                  <div className={commonStyles.versionMeta}>
                    <strong>{v.title}</strong>
                    <div className={commonStyles.versionRow}>
                      <span>Saved at {new Date(v.createdAt).toLocaleString()}</span>
                      {(() => {
                        const changed = getChangedFields(v);
                        if (changed.length === 0) return null;
                        return (
                          <div className={commonStyles.versionBadges} aria-label="Changed fields">
                            {changed.map((c) => (
                              <span key={c} className={`${commonStyles.versionBadge} ${themeStyles.versionBadge}`}>{c}</span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className={commonStyles.versionActions}>
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
            <div className={commonStyles.diffGrid}>
              <div className={commonStyles.diffPane}>
                <div className={commonStyles.diffTitle}>Current</div>
                <div className={commonStyles.diffContent}>
                  <div><strong>Title:</strong> {renderDiffSpans(diffWords(watch("title") || "", versionForDiff.title || ""), "current")}</div>
                  <div><strong>Excerpt:</strong> {renderDiffSpans(diffWords(watch("excerpt") || "", versionForDiff.excerpt || ""), "current")}</div>
                  <div><strong>Tags:</strong> {renderDiffSpans(diffWords((watch("tags") || ""), (versionForDiff.tags || []).join(", ")), "current")}</div>
                  <div><strong>Categories:</strong> {renderDiffSpans(diffWords((watch("categories") || ""), (versionForDiff.categories || []).join(", ")), "current")}</div>
                  <div><strong>Content:</strong>
                    <div className={commonStyles.diffBlockSpacing}>
                      {renderDiffSpans(diffWords((watch("content") || "").replace(/<[^>]*>/g, " "), (versionForDiff.content || "").replace(/<[^>]*>/g, " ")), "current")}
                    </div>
                  </div>
                </div>
              </div>
              <div className={commonStyles.diffPane}>
                <div className={commonStyles.diffTitle}>Selected Version</div>
                <div className={commonStyles.diffContent}>
                  <div><strong>Title:</strong> {renderDiffSpans(diffWords(watch("title") || "", versionForDiff.title || ""), "version")}</div>
                  <div><strong>Excerpt:</strong> {renderDiffSpans(diffWords(watch("excerpt") || "", versionForDiff.excerpt || ""), "version")}</div>
                  <div><strong>Tags:</strong> {renderDiffSpans(diffWords((watch("tags") || ""), (versionForDiff.tags || []).join(", ")), "version")}</div>
                  <div><strong>Categories:</strong> {renderDiffSpans(diffWords((watch("categories") || ""), (versionForDiff.categories || []).join(", ")), "version")}</div>
                  <div><strong>Content:</strong>
                    <div className={commonStyles.diffBlockSpacing}>
                      {renderDiffSpans(diffWords((watch("content") || "").replace(/<[^>]*>/g, " "), (versionForDiff.content || "").replace(/<[^>]*>/g, " ")), "version")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={commonStyles.modalFooter}>
            <button className={`${utilities.btn} ${utilities.btnPrimary}`} onClick={() => { if (versionForDiff) restoreVersion(versionForDiff); closeDiff(); }}>Restore this Version</button>
            <button className={`${utilities.btn} ${utilities.btnSecondary}`} onClick={closeDiff}>Close</button>
          </div>
        </Modal>
      </div>
    </form>
  );
}
