import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { articleSchema } from "../../../lib/validation/schemas";
import ImageUploader from "../ImageUploader/ImageUploader";
import { useTheme } from "../../../context/ThemeContext";

import commonStyles from "./ArticleForm.module.css";
import lightStyles from "./ArticleForm.light.module.css";
import darkStyles from "./ArticleForm.dark.module.css";
import ChipInput from "./ChipInput";

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
  const autoSaveTimer = useRef(null);
  const previewRef = useRef(null);
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
        localStorage.setItem(key, formValuesString);
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
      onSubmit={handleSubmit(onSubmit)}
      className={commonStyles.form}
      noValidate
    >
      <div
        className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span className={themeStyles.label} style={{ opacity: 0.8 }}>
            Word count: {wordCount}
          </span>
          <span className={themeStyles.label} style={{ opacity: 0.8 }}>
            Reading time: ~{readingTime} min
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {autoSaveStatus && (
            <span
              className={themeStyles.label}
              style={{ fontSize: "0.85rem", opacity: 0.8 }}
            >
              {autoSaveStatus === "saving" ? "Saving…" : "Saved"}
            </span>
          )}
          <button
            type="button"
            className={commonStyles.button}
            onClick={() => setPreviewSplit((v) => !v)}
          >
            {previewSplit ? "Editor Only" : "Split Preview"}
          </button>
          {previewSplit && (
            <div style={{ display: "inline-flex", gap: 6, marginLeft: 8 }}>
              <button
                type="button"
                className={commonStyles.button}
                onClick={() => setPreviewDevice("desktop")}
                disabled={previewDevice === "desktop"}
              >
                Desktop
              </button>
              <button
                type="button"
                className={commonStyles.button}
                onClick={() => setPreviewDevice("tablet")}
                disabled={previewDevice === "tablet"}
              >
                Tablet
              </button>
              <button
                type="button"
                className={commonStyles.button}
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            id="title"
            {...register("title")}
            className={`${commonStyles.input} ${themeStyles.input}`}
            style={{ flexGrow: 1 }}
          />
          <button
            type="button"
            className={commonStyles.button}
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
            <span style={{ color: "#ef4444", marginLeft: "8px" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            id="tags"
            {...register("tags")}
            className={`${commonStyles.input} ${themeStyles.input}`}
            style={{ flexGrow: 1 }}
          />
          <button
            type="button"
            className={commonStyles.button}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} />
              )}
            />
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "1rem",
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width:
                    previewDevice === "desktop"
                      ? "100%"
                      : previewDevice === "tablet"
                        ? 768
                        : 375,
                  maxWidth: "100%",
                  border:
                    previewDevice === "desktop" ? "none" : "1px solid #e5e7eb",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow:
                    previewDevice === "desktop"
                      ? "none"
                      : "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  ref={previewRef}
                  style={{ padding: "1rem" }}
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
              className={`${commonStyles.input} ${themeStyles.input}`}
              placeholder="Optimal length: 50-60 characters"
              style={{
                borderColor:
                  (watch("metaTitle") || "").length > 60
                    ? "#ef4444"
                    : undefined,
              }}
            />
            <div className={commonStyles.helpText}>
              <span>Recommended 50–60 characters.</span>
              <span style={{ float: "right", opacity: 0.8 }} aria-live="polite">
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
              className={`${commonStyles.textarea} ${themeStyles.textarea}`}
              placeholder="Optimal length: 150-160 characters"
              rows="3"
              style={{
                borderColor:
                  (watch("metaDescription") || "").length > 160
                    ? "#ef4444"
                    : undefined,
              }}
            ></textarea>
            <div className={commonStyles.helpText}>
              <span>Recommended 150–160 characters.</span>
              <span style={{ float: "right", opacity: 0.8 }} aria-live="polite">
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p className={commonStyles.helpText}>
                Recommended size: 1200x630px.
              </p>
              <button
                type="button"
                className={commonStyles.button}
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
          className={commonStyles.button}
          disabled={isSubmitting}
        >
          {article?._id ? "Update" : "Save"} Article
        </button>
      </div>
      {/* Local Version History */}
      <VersionHistory
        articleId={article?._id}
        values={formValues}
        setValues={(vals) => {
          Object.entries(vals).forEach(([k, v]) =>
            setValue(k, v, { shouldValidate: false }),
          );
        }}
      />
    </form>
  );
}

function VersionHistory({ articleId, values, setValues }) {
  const [snapshots, setSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVersions = async () => {
    if (!articleId) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/article-versions?articleId=${articleId}`,
      );
      const data = await res.json();
      if (data.success) {
        setSnapshots(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch versions", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVersions();
  }, [articleId]);

  const saveSnapshot = async () => {
    if (!articleId) {
      toast.error("Cannot save version for an unsaved article.");
      return;
    }
    const toastId = toast.loading("Saving version...");
    try {
      const res = await fetch("/api/admin/article-versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, articleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      toast.success("Version saved!", { id: toastId });
      fetchVersions(); // Refresh list
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  };

  const restoreSnapshot = (entry) => {
    if (
      window.confirm(
        "Are you sure you want to restore this version? This will overwrite the current content in the editor.",
      )
    ) {
      const { title, content, excerpt, tags, categories } = entry;
      setValues({
        ...values, // keep other fields like slug, images, etc.
        title,
        content,
        excerpt,
        tags: (tags || []).join(", "),
        categories: (categories || []).join(", "),
      });
      toast.success("Content restored in editor.");
    }
  };

  const deleteSnapshot = async (versionId) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this version?",
      )
    ) {
      const toastId = toast.loading("Deleting version...");
      try {
        const res = await fetch(
          `/api/admin/article-versions?versionId=${versionId}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error("Failed to delete");
        toast.success("Version deleted.", { id: toastId });
        fetchVersions(); // Refresh list
      } catch (e) {
        toast.error(e.message, { id: toastId });
      }
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>Version History</strong>
        <button
          type="button"
          onClick={saveSnapshot}
          className={commonStyles.button}
          disabled={!articleId}
        >
          Save Current Version
        </button>
      </div>
      {isLoading ? (
        <p>Loading versions...</p>
      ) : (
        <ul style={{ marginTop: 8, display: "grid", gap: 8 }}>
          {snapshots.length === 0 ? (
            <p
              style={{ textAlign: "center", color: "#6b7280", padding: "1rem" }}
            >
              No versions saved yet.
            </p>
          ) : (
            snapshots.map((s) => (
              <li
                key={s._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <div>
                  <strong>{s.title}</strong>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    Saved at {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
                <span style={{ display: "inline-flex", gap: 8 }}>
                  <button
                    type="button"
                    className={commonStyles.button}
                    onClick={() => restoreSnapshot(s)}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    className={commonStyles.button}
                    onClick={() => deleteSnapshot(s._id)}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
