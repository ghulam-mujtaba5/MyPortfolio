// Forcing a file re-read to clear build cache.
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "../../../lib/validation/schemas";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import ImageUploader from "../ImageUploader/ImageUploader";
import { useTheme } from "../../../context/ThemeContext";

import commonStyles from "./ProjectForm.module.css";
import lightStyles from "./ProjectForm.light.module.css";
import darkStyles from "./ProjectForm.dark.module.css";
import utilities from "../../../styles/utilities.module.css";

function ProjectForm({
  project = {},
  onSave,
  onPreview,
  onDataChange,
  isSubmitting,
  serverErrors = {},
}) {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

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
      // Normalize legacy placeholders like '#' to empty string to avoid URL validation errors
      "links.live": project.links?.live === "#" ? "" : (project.links?.live || ""),
      "links.github": project.links?.github === "#" ? "" : (project.links?.github || ""),
      image: project.image === "#" ? "" : (project.image || ""),
      showImage: project.showImage !== undefined ? project.showImage : true,
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

  // Autosave Draft to localStorage (Project)
  const [autoSaveStatus, setAutoSaveStatus] = useState(""); // '', 'saving', 'saved'
  const autoSaveTimer = useRef(null);
  const watchedData = watch();
  const [dupWarning, setDupWarning] = useState("");
  const dupTimer = useRef(null);

  useEffect(() => {
    if (!watchedData) return;
    setAutoSaveStatus("saving");
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try {
        const key = project?._id
          ? `project-draft-${project._id}`
          : "project-draft-new";
        localStorage.setItem(key, JSON.stringify(watchedData));
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus(""), 1500);
      } catch (e) {
        setAutoSaveStatus("");
      }
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [watchedData, project?._id]);

  // Restore draft if available
  useEffect(() => {
    try {
      const key = project?._id
        ? `project-draft-${project._id}`
        : "project-draft-new";
      const raw = localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw);
        const sanitize = (k, v) => {
          if (v === "#") return ""; // legacy placeholder
          if (k === "image" || k === "ogImage") return ensureProtocol(v || "");
          if (k === "links.live" || k === "links.github") return ensureProtocol(v || "");
          return v;
        };
        Object.entries(draft).forEach(([k, v]) => {
          setValue(k, sanitize(k, v), { shouldValidate: false });
        });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When navigating to Edit for a different project, ensure the form resets with that project's values
  useEffect(() => {
    const defaults = {
      title: project.title || "",
      description: project.description || "",
      tags: (project.tags || []).join(", "),
      status: project.status || "In Progress",
      "links.live": project.links?.live === "#" ? "" : (project.links?.live || ""),
      "links.github": project.links?.github === "#" ? "" : (project.links?.github || ""),
      image: project.image === "#" ? "" : (project.image || ""),
      showImage: project.showImage !== undefined ? project.showImage : true,
      published: !!project.published,
      featuredOnHome: !!project.featuredOnHome,
      metaTitle: project.metaTitle || "",
      metaDescription: project.metaDescription || "",
      ogImage: project.ogImage === "#" ? "" : (project.ogImage || ""),
      scheduledAt: project.scheduledAt
        ? (() => {
            const d = new Date(project.scheduledAt);
            const offMs = d.getTime() - d.getTimezoneOffset() * 60000;
            return new Date(offMs).toISOString().slice(0, 16);
          })()
        : "",
    };
    reset(defaults, { keepDirty: false, keepErrors: true });
  }, [project, reset]);

  // Apply server-side validation errors to the form
  useEffect(() => {
    if (serverErrors && typeof serverErrors === "object") {
      Object.entries(serverErrors).forEach(([path, message]) => {
        if (!path) return;
        setError(path, { type: "server", message: String(message || "Invalid value") });
      });
    }
  }, [serverErrors, setError]);

  // Helper: ensure a URL has protocol if it looks like a domain, otherwise keep as is
  const ensureProtocol = (url) => {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (trimmed === "#") return ""; // normalize legacy
    if (/^\/\//.test(trimmed)) return `https:${trimmed}`; // protocol-relative -> https
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
  }, [watchedData, onDataChange]);

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${commonStyles.form} ${themeStyles.form}`}
      noValidate
    >
      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label
          htmlFor="title"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Project Title
        </label>
        <input
          id="title"
          {...register("title")}
          className={`${commonStyles.input} ${themeStyles.input}`}
        />
        {errors.title && (
          <p className={commonStyles.error}>{errors.title.message}</p>
        )}
        <div className={commonStyles.helpText}>
          Slug: <code>/{liveSlug || "your-slug"}</code>{" "}
          {autoSaveStatus && (
            <span className={`${commonStyles.ml8} ${commonStyles.muted}`}>
              — {autoSaveStatus}
            </span>
          )}{" "}
          {dupWarning && (
            <span className={`${commonStyles.ml8} ${commonStyles.dangerText}`}>
              {dupWarning}
            </span>
          )}
        </div>
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label
          htmlFor="description"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <RichTextEditor {...field} />}
        />
        {errors.description && (
          <p className={commonStyles.error}>{errors.description.message}</p>
        )}
      </div>

      <div className={commonStyles.formGroup}>
        <label
          htmlFor="tags"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          {...register("tags")}
          className={`${commonStyles.input} ${themeStyles.input}`}
        />
        {errors.tags && (
          <p className={commonStyles.error}>{errors.tags.message}</p>
        )}
      </div>

      <div className={commonStyles.formGroup}>
        <label
          htmlFor="status"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Status
        </label>
        <select
          id="status"
          {...register("status")}
          className={`${commonStyles.input} ${themeStyles.input}`}
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
        {errors.status && (
          <p className={commonStyles.error}>{errors.status.message}</p>
        )}
      </div>

      <div className={commonStyles.formGroup}>
        <label
          htmlFor="links.live"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Live URL
        </label>
        <input
          id="links.live"
          type="url"
          {...register("links.live")}
          onBlur={(e) => setValue("links.live", ensureProtocol(e.target.value), { shouldValidate: true })}
          className={`${commonStyles.input} ${themeStyles.input}`}
        />
        {errors.links?.live && (
          <p className={commonStyles.error}>{errors.links.live.message}</p>
        )}
      </div>

      <div className={commonStyles.formGroup}>
        <label
          htmlFor="links.github"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          GitHub URL
        </label>
        <input
          id="links.github"
          type="url"
          {...register("links.github")}
          onBlur={(e) => setValue("links.github", ensureProtocol(e.target.value), { shouldValidate: true })}
          className={`${commonStyles.input} ${themeStyles.input}`}
        />
        {errors.links?.github && (
          <p className={commonStyles.error}>{errors.links.github.message}</p>
        )}
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
          Project Image
        </label>
        <ImageUploader
          onUpload={handleImageUpdate}
          initialImageUrl={watch("image")}
          onImageUsageChange={handleImageUsageChange}
          useImage={watch("showImage")}
        />
        {errors.image && (
          <p className={commonStyles.error}>{errors.image.message}</p>
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
              <span className={`${commonStyles.floatRight} ${commonStyles.muted}`} aria-live="polite">
                {(watch("metaTitle") || "").length}/60
              </span>
            </div>
            {errors.metaTitle && (
              <p className={commonStyles.error}>{errors.metaTitle.message}</p>
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
              <span className={`${commonStyles.floatRight} ${commonStyles.muted}`} aria-live="polite">
                {(watch("metaDescription") || "").length}/160
              </span>
            </div>
            {errors.metaDescription && (
              <p className={commonStyles.error}>
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
            <div className={commonStyles.rowBetween}>
              <p className={commonStyles.helpText}>
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
                title="Copy project image to social image"
              >
                Use Project Image
              </button>
            </div>
            {errors.ogImage && (
              <p className={commonStyles.error}>{errors.ogImage.message}</p>
            )}
          </div>
        </div>
      </details>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
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
                className={commonStyles.checkbox}
              />
            )}
          />
          Publish this project?
        </label>
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label
          htmlFor="scheduledAt"
          className={`${commonStyles.label} ${themeStyles.label}`}
        >
          Schedule Publish (optional)
        </label>
        <input
          id="scheduledAt"
          type="datetime-local"
          {...register("scheduledAt")}
          className={`${commonStyles.input} ${themeStyles.input}`}
        />
        <div className={commonStyles.helpText}>
          Set a future date/time to schedule. Project will remain draft until
          then unless your backend job auto-publishes.
        </div>
        {errors.scheduledAt && (
          <p className={commonStyles.error}>{errors.scheduledAt.message}</p>
        )}
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
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
                className={commonStyles.checkbox}
              />
            )}
          />
          Show on homepage (featured)
        </label>
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth} ${commonStyles.row} ${commonStyles.gapSm}`}>
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
