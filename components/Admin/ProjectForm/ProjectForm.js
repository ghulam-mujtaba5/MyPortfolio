// Forcing a file re-read to clear build cache.
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "../../../lib/validation/schemas";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import ImageUploader from "../ImageUploader/ImageUploader";
import GalleryManager from "../GalleryManager/GalleryManager";

import styles from "./ProjectForm.premium.module.css";
import utilities from "../../../styles/utilities.module.css";

function ProjectForm({
  project = {},
  onSave,
  onPreview,
  onDataChange,
  isSubmitting,
  serverErrors = {},
}) {
  // Local state and refs
  const [ariaMessage, setAriaMessage] = useState("");
  const [dupWarning, setDupWarning] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const dupTimer = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title || "",
      description: project.description || "",
      tags: (project.tags || []).join(", "),
      status: project.status || "In Progress",
      category: project.category || "Others",
      // Normalize legacy placeholders like '#' to empty string to avoid URL validation errors
      "links.live": project.links?.live === "#" ? "" : (project.links?.live || ""),
      "links.github": project.links?.github === "#" ? "" : (project.links?.github || ""),
      image: project.image === "#" ? "" : (project.image || ""),
      gallery: project.gallery || [],
      imageFit: project.imageFit || "cover",
      showImage: project.showImage !== undefined ? project.showImage : true,
      showGallery: project.showGallery !== undefined ? project.showGallery : true,
      published: project.published || false,
      featuredOnHome: project.featuredOnHome || false,
      metaTitle: project.metaTitle || "",
      metaDescription: project.metaDescription || "",
      ogImage: project.ogImage === "#" ? "" : (project.ogImage || ""),
      scheduledAt: project.scheduledAt
        ? (() => {
            const d = new Date(project.scheduledAt);
            // Convert to local "YYYY-MM-DDTHH:mm" for datetime-local input
            const offMs = d.getTime() - d.getTimezoneOffset() * 60000;
            return new Date(offMs).toISOString().slice(0, 16);
          })()
        : "",
    },
  });

  // Watch entire form for external consumers
  const watchedData = watch();

  // Normalize and ensure protocol for URLs
  const ensureProtocol = (url = "") => {
    const trimmed = (url || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // Looks like a domain (contains a dot, no spaces)
    if (/^[^\s]+\.[^\s]{2,}/.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const slugify = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-");

  const liveSlug = useMemo(() => slugify(watch("title")), [watch("title")]);

  // Duplicate checker (based on generated slug from title)
  useEffect(() => {
    const title = watch("title");
    if (dupTimer.current) clearTimeout(dupTimer.current);
    if (!title) {
      setDupWarning("");
      return;
    }
    const slug = slugify(title);
    dupTimer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (slug) params.set("slug", slug);
        if (project?._id) params.set("excludeId", project._id);
        const res = await fetch(
          `/api/projects/check-duplicate?${params.toString()}`,
        );
        const data = await res.json();
        if (res.ok && data.duplicate) {
          setDupWarning(
            "A project with this slug/title already exists. Consider changing the title.",
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
  }, [watch("title"), project?._id]);

  useEffect(() => {
    for (const key in serverErrors) {
      setError(key, { type: "server", message: serverErrors[key] });
    }
  }, [serverErrors, setError]);

  useEffect(() => {
    if (onDataChange && watchedData) {
      const formattedData = {
        ...watchedData,
        tags: (watchedData.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      onDataChange(formattedData);
    }
  }, [watchedData, onDataChange, onPreview]);

  const onSubmit = (data) => {
    // Normalize scheduledAt: convert HTML datetime-local to ISO for backend, or null
    let scheduledAt = data.scheduledAt || null;
    if (scheduledAt) {
      try {
        const d = new Date(scheduledAt);
        if (!isNaN(d.getTime())) scheduledAt = d.toISOString();
        else scheduledAt = null;
      } catch {
        scheduledAt = null;
      }
    }

    // Normalize URLs at submit time in case user didn't blur fields
    const links = {
      live: ensureProtocol(data?.links?.live || ""),
      github: ensureProtocol(data?.links?.github || ""),
    };

    const submittedData = {
      ...data,
      links,
      image: ensureProtocol(data.image || ""),
      ogImage: ensureProtocol(data.ogImage || ""),
      gallery: data.gallery || [],
      tags: data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      scheduledAt,
    };
    onSave(submittedData);
  };

  const handleImageUpdate = (imageUrl) => {
    setValue("image", ensureProtocol(imageUrl), { shouldValidate: true });
  };

  const handleImageUsageChange = (useImage) => {
    setValue("showImage", useImage, { shouldValidate: true });
  };

  const handleOgImageUpdate = (imageUrl) => {
    setValue("ogImage", ensureProtocol(imageUrl), { shouldValidate: true });
  };

  const handleGalleryChange = (newGallery) => {
    setValue("gallery", newGallery, { shouldValidate: true, shouldDirty: true });
    // Auto-sync main image with first gallery item
    if (newGallery && newGallery.length > 0) {
      setValue("image", ensureProtocol(newGallery[0].url), { shouldValidate: true });
      setValue("showImage", true); // Show image if gallery exists
    }
  };

  // Meta length helpers (traffic-light thresholds + remaining + ARIA announcements)
  const metaTitleLen = (watch("metaTitle") || "").length;
  const metaDescLen = (watch("metaDescription") || "").length;

  const getTitleStatus = () => {
    if (metaTitleLen <= 60)
      return { label: "Good", cls: "", border: "", badge: styles.badgeGood };
    if (metaTitleLen <= 70)
      return { label: "Warn", cls: styles.counterWarn, border: styles.warnLimit, badge: styles.badgeWarn };
    return { label: "Over", cls: styles.counterOver, border: styles.overLimit, badge: styles.badgeOver };
  };

  const getDescStatus = () => {
    if (metaDescLen >= 150 && metaDescLen <= 160)
      return { label: "Good", cls: "", border: "", badge: styles.badgeGood };
    if ((metaDescLen >= 120 && metaDescLen < 150) || (metaDescLen > 160 && metaDescLen <= 180))
      return { label: "Warn", cls: styles.counterWarn, border: styles.warnLimit, badge: styles.badgeWarn };
    return { label: "Over", cls: styles.counterOver, border: styles.overLimit, badge: styles.badgeOver };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();
  const remainingTitle = 60 - metaTitleLen;
  const remainingDesc = 160 - metaDescLen;

  const prevTitle = useRef(titleStatus.label);
  const prevDesc = useRef(descStatus.label);
  useEffect(() => {
    if (titleStatus.label !== prevTitle.current) {
      setAriaMessage(`Meta title status: ${titleStatus.label}.`);
      prevTitle.current = titleStatus.label;
    }
  }, [titleStatus.label]);
  useEffect(() => {
    if (descStatus.label !== prevDesc.current) {
      setAriaMessage(`Meta description status: ${descStatus.label}.`);
      prevDesc.current = descStatus.label;
    }
  }, [descStatus.label]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${styles.form} ${styles.form}`}
      noValidate
    >
      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label
          htmlFor="title"
          className={`${styles.label} ${styles.label}`}
        >
          Project Title
        </label>
        <input
          id="title"
          {...register("title")}
          className={`${styles.input} ${styles.input}`}
        />
        {errors.title && (
          <p className={styles.error}>{errors.title.message}</p>
        )}
        <div className={styles.helpText}>
          Slug: <code>/{liveSlug || "your-slug"}</code>{" "}
          {autoSaveStatus && (
            <span className={`${styles.ml8} ${styles.muted}`}>
              — {autoSaveStatus}
            </span>
          )}{" "}
          {dupWarning && (
            <span className={`${styles.ml8} ${styles.dangerText}`}>
              {dupWarning}
            </span>
          )}
        </div>
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label
          htmlFor="description"
          className={`${styles.label} ${styles.label}`}
        >
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <RichTextEditor {...field} />}
        />
        {errors.description && (
          <p className={styles.error}>{errors.description.message}</p>
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
          <p className={styles.error}>{errors.tags.message}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label
          htmlFor="status"
          className={`${styles.label} ${styles.label}`}
        >
          Status
        </label>
        <select
          id="status"
          {...register("status")}
          className={`${styles.input} ${styles.input}`}
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
        {errors.status && (
          <p className={styles.error}>{errors.status.message}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label
          htmlFor="category"
          className={`${styles.label} ${styles.label}`}
        >
          Category
        </label>
        <select
          id="category"
          {...register("category")}
          className={`${styles.input} ${styles.input}`}
        >
          <option value="All">All</option>
          <option value="Software Development">Software Development</option>
          <option value="Web Development">Web Development</option>
          <option value="AI">AI</option>
          <option value="Data Science">Data Science</option>
          <option value="UI/UX">UI/UX</option>
          <option value="Others">Others</option>
        </select>
        {errors.category && (
          <p className={styles.error}>{errors.category.message}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label
          htmlFor="links.live"
          className={`${styles.label} ${styles.label}`}
        >
          Live URL
        </label>
        <input
          id="links.live"
          type="url"
          {...register("links.live")}
          onBlur={(e) => setValue("links.live", ensureProtocol(e.target.value), { shouldValidate: true })}
          className={`${styles.input} ${styles.input}`}
        />
        {errors.links?.live && (
          <p className={styles.error}>{errors.links.live.message}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label
          htmlFor="links.github"
          className={`${styles.label} ${styles.label}`}
        >
          GitHub URL
        </label>
        <input
          id="links.github"
          type="url"
          {...register("links.github")}
          onBlur={(e) => setValue("links.github", ensureProtocol(e.target.value), { shouldValidate: true })}
          className={`${styles.input} ${styles.input}`}
        />
        {errors.links?.github && (
          <p className={styles.error}>{errors.links.github.message}</p>
        )}
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label className={`${styles.label} ${styles.label}`}>
          Project Images
        </label>
        <p className={styles.helpText} style={{ marginBottom: 12 }}>
          📌 <strong>First image is your cover image.</strong> Drag to reorder all images. Additional images become your project gallery.
        </p>
        <GalleryManager
          gallery={watch("gallery") || []}
          onChange={handleGalleryChange}
          maxImages={20}
          contextTitle={watch("title")}
        />
        
        {/* Image Fit for Cover */}
        {watch("gallery")?.length > 0 && (
          <div className={styles.row} style={{ gap: 12, marginTop: 12 }}>
            <label className={`${styles.label} ${styles.label}`} htmlFor="imageFit" style={{ margin: 0 }}>
              Cover Image Fit
            </label>
            <select
              id="imageFit"
              {...register("imageFit")}
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
        )}
        
        {/* Show Image Toggle */}
        <div className={styles.row} style={{ gap: 12, marginTop: 12 }}>
          <label className={`${styles.label} ${styles.label}`} style={{ margin: 0 }}>
            <Controller
              name="showImage"
              control={control}
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                  onBlur={onBlur}
                  ref={ref}
                  className={styles.checkbox}
                />
              )}
            />
            Show cover image on project page
          </label>
        </div>

        {/* Show Gallery Toggle */}
        <div className={styles.row} style={{ gap: 12, marginTop: 8 }}>
          <label className={`${styles.label} ${styles.label}`} style={{ margin: 0 }}>
            <Controller
              name="showGallery"
              control={control}
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                  onBlur={onBlur}
                  ref={ref}
                  className={styles.checkbox}
                />
              )}
            />
            Show gallery (additional images) on project page
          </label>
        </div>

        {errors.image && (
          <p className={styles.error}>{errors.image.message}</p>
        )}
        {errors.gallery && (
          <p className={styles.error}>{errors.gallery.message}</p>
        )}
      </div>

      <div className={styles.srOnly} aria-live="polite" role="status">{ariaMessage}</div>
      <details className={`${styles.details} ${styles.details}`}>
        <summary className={`${styles.summary} ${styles.summary}`}>
          SEO Settings
        </summary>
        <div className={styles.detailsContent}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label
              htmlFor="metaTitle"
              className={`${styles.label} ${styles.label}`}
            >
              Meta Title
              <span className={`${styles.badge} ${titleStatus.badge}`} style={{ marginLeft: 8 }}>{titleStatus.label}</span>
            </label>
            <input
              id="metaTitle"
              {...register("metaTitle")}
              className={`${styles.input} ${styles.input} ${titleStatus.border}`}
              placeholder="Optimal length: 50-60 characters"
            />
            <div className={styles.helpText}>
              <span>Recommended 50–60 characters.</span>
              <span className={`${styles.floatRight} ${titleStatus.cls}`} aria-live="polite">
                {remainingTitle} left • {titleStatus.label}
              </span>
            </div>
            {errors.metaTitle && (
              <p className={styles.error}>{errors.metaTitle.message}</p>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label
              htmlFor="metaDescription"
              className={`${styles.label} ${styles.label}`}
            >
              Meta Description
              <span className={`${styles.badge} ${descStatus.badge}`} style={{ marginLeft: 8 }}>{descStatus.label}</span>
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
              <span className={`${styles.floatRight} ${descStatus.cls}`} aria-live="polite">
                {remainingDesc} left • {descStatus.label}
              </span>
            </div>
            {errors.metaDescription && (
              <p className={styles.error}>
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
            <div className={styles.rowBetween}>
              <p className={styles.helpText}>
                Recommended size: 1200x630px.
              </p>
              <button
                type="button"
                className={`${utilities.btn} ${utilities.btnSecondary}`}
                onClick={() =>
                  setValue("ogImage", watch("image") || "", {
                    shouldDirty: true,
                  })
                }
                disabled={!watch("image")}
                title="Copy cover image to social image"
              >
                Use Cover Image
              </button>
            </div>
            {errors.ogImage && (
              <p className={styles.error}>{errors.ogImage.message}</p>
            )}
          </div>
        </div>
      </details>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label className={`${styles.label} ${styles.label}`}>
          <Controller
            name="published"
            control={control}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={onBlur}
                ref={ref}
                className={styles.checkbox}
              />
            )}
          />
          Publish this project?
        </label>
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label
          htmlFor="scheduledAt"
          className={`${styles.label} ${styles.label}`}
        >
          Schedule Publish (optional)
        </label>
        <input
          id="scheduledAt"
          type="datetime-local"
          {...register("scheduledAt")}
          className={`${styles.input} ${styles.input}`}
        />
        <div className={styles.helpText}>
          Set a future date/time to schedule. Project will remain draft until
          then unless your backend job auto-publishes.
        </div>
        {errors.scheduledAt && (
          <p className={styles.error}>{errors.scheduledAt.message}</p>
        )}
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label className={`${styles.label} ${styles.label}`}>
          <Controller
            name="featuredOnHome"
            control={control}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={onBlur}
                ref={ref}
                className={styles.checkbox}
              />
            )}
          />
          Show on homepage (featured)
        </label>
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth} ${styles.row} ${styles.gapSm}`}>
        <button
          type="button"
          className={`${utilities.btn} ${utilities.btnSecondary}`}
          onClick={onPreview}
          disabled={isSubmitting}
        >
          Preview
        </button>
        <button
          type="submit"
          className={`${utilities.btn} ${utilities.btnPrimary}`}
          disabled={isSubmitting}
        >
          {project?._id ? "Update" : "Create"} Project
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
