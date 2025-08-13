// Forcing a file re-read to clear build cache.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../../../lib/validation/schemas';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import ImageUploader from '../ImageUploader/ImageUploader';
import { useTheme } from '../../../context/ThemeContext';

import commonStyles from './ProjectForm.module.css';
import lightStyles from './ProjectForm.light.module.css';
import darkStyles from './ProjectForm.dark.module.css';

const ProjectForm = ({ onSave, onPreview, project = {}, serverErrors = {}, isSubmitting, onDataChange }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const { register, handleSubmit, control, formState: { errors }, setValue, watch, setError } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title || '',
      description: project.description || '',
      tags: (project.tags || []).join(', '),
      status: project.status || 'In Progress',
      'links.live': project.links?.live || '',
      'links.github': project.links?.github || '',
      image: project.image || '',
      showImage: project.showImage !== undefined ? project.showImage : true,
      published: project.published || false,
      featuredOnHome: project.featuredOnHome || false,
      metaTitle: project.metaTitle || '',
      metaDescription: project.metaDescription || '',
      ogImage: project.ogImage || '',
      scheduledAt: project.scheduledAt ? new Date(project.scheduledAt).toISOString().slice(0,16) : '',
    },
  });

  // Autosave Draft to localStorage (Project)
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // '', 'saving', 'saved'
  const autoSaveTimer = useRef(null);
  const watchedData = watch();
  const [dupWarning, setDupWarning] = useState('');
  const dupTimer = useRef(null);

  useEffect(() => {
    if (!watchedData) return;
    setAutoSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try {
        const key = project?._id ? `project-draft-${project._id}` : 'project-draft-new';
        localStorage.setItem(key, JSON.stringify(watchedData));
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(''), 1500);
      } catch (e) {
        setAutoSaveStatus('');
      }
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [watchedData, project?._id]);

  // Restore draft if available
  useEffect(() => {
    try {
      const key = project?._id ? `project-draft-${project._id}` : 'project-draft-new';
      const raw = localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw);
        Object.entries(draft).forEach(([k, v]) => setValue(k, v, { shouldValidate: false }));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slugify = (str) =>
    (str || '')
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');

  const liveSlug = useMemo(() => slugify(watch('title')), [watch('title')]);

  // Duplicate checker (based on generated slug from title)
  useEffect(() => {
    const title = watch('title');
    if (dupTimer.current) clearTimeout(dupTimer.current);
    if (!title) { setDupWarning(''); return; }
    const slug = slugify(title);
    dupTimer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (slug) params.set('slug', slug);
        if (project?._id) params.set('excludeId', project._id);
        const res = await fetch(`/api/projects/check-duplicate?${params.toString()}`);
        const data = await res.json();
        if (res.ok && data.duplicate) {
          setDupWarning('A project with this slug/title already exists. Consider changing the title.');
        } else {
          setDupWarning('');
        }
      } catch {
        // ignore
      }
    }, 450);
    return () => { if (dupTimer.current) clearTimeout(dupTimer.current); };
  }, [watch('title'), project?._id]);

  useEffect(() => {
    for (const key in serverErrors) {
      setError(key, { type: 'server', message: serverErrors[key] });
    }
    }, [serverErrors, setError]);

  useEffect(() => {
    if (onDataChange && watchedData) {
      const formattedData = {
        ...watchedData,
        tags: (watchedData.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
      };
      onDataChange(formattedData);
    }
  }, [watchedData, onDataChange]);

  const onSubmit = (data) => {
    const submittedData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        scheduledAt: data.scheduledAt || '',
    };
    onSave(submittedData);
  };

  const handleImageUpdate = (imageUrl) => {
    setValue('image', imageUrl, { shouldValidate: true });
  };

  const handleImageUsageChange = (useImage) => {
    setValue('showImage', useImage, { shouldValidate: true });
  };

  const handleOgImageUpdate = (imageUrl) => {
    setValue('ogImage', imageUrl, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`${commonStyles.form} ${themeStyles.form}`} noValidate>
      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label htmlFor="title" className={`${commonStyles.label} ${themeStyles.label}`}>Project Title</label>
        <input id="title" {...register('title')} className={`${commonStyles.input} ${themeStyles.input}`} />
        {errors.title && <p className={commonStyles.error}>{errors.title.message}</p>}
        <div className={commonStyles.helpText}>Slug: <code>/{liveSlug || 'your-slug'}</code> {autoSaveStatus && <span style={{marginLeft:8, opacity:0.7}}>— {autoSaveStatus}</span>} {dupWarning && <span style={{marginLeft:8, color:'#ef4444'}}>{dupWarning}</span>}</div>
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label htmlFor="description" className={`${commonStyles.label} ${themeStyles.label}`}>Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <RichTextEditor {...field} />}
        />
        {errors.description && <p className={commonStyles.error}>{errors.description.message}</p>}
      </div>

      <div className={commonStyles.formGroup}>
        <label htmlFor="tags" className={`${commonStyles.label} ${themeStyles.label}`}>Tags (comma-separated)</label>
        <input id="tags" {...register('tags')} className={`${commonStyles.input} ${themeStyles.input}`} />
        {errors.tags && <p className={commonStyles.error}>{errors.tags.message}</p>}
      </div>

      <div className={commonStyles.formGroup}>
        <label htmlFor="status" className={`${commonStyles.label} ${themeStyles.label}`}>Status</label>
        <select id="status" {...register('status')} className={`${commonStyles.input} ${themeStyles.input}`}>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
        {errors.status && <p className={commonStyles.error}>{errors.status.message}</p>}
      </div>

      <div className={commonStyles.formGroup}>
        <label htmlFor="links.live" className={`${commonStyles.label} ${themeStyles.label}`}>Live URL</label>
        <input id="links.live" type="url" {...register('links.live')} className={`${commonStyles.input} ${themeStyles.input}`} />
        {errors.links?.live && <p className={commonStyles.error}>{errors.links.live.message}</p>}
      </div>

      <div className={commonStyles.formGroup}>
        <label htmlFor="links.github" className={`${commonStyles.label} ${themeStyles.label}`}>GitHub URL</label>
        <input id="links.github" type="url" {...register('links.github')} className={`${commonStyles.input} ${themeStyles.input}`} />
        {errors.links?.github && <p className={commonStyles.error}>{errors.links.github.message}</p>}
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>Project Image</label>
        <ImageUploader 
          onUpload={handleImageUpdate} 
          initialImageUrl={watch('image')} 
          onImageUsageChange={handleImageUsageChange}
          useImage={watch('showImage')}
        />
        {errors.image && <p className={commonStyles.error}>{errors.image.message}</p>}
      </div>

      <details className={`${commonStyles.details} ${themeStyles.details}`}>
        <summary className={`${commonStyles.summary} ${themeStyles.summary}`}>SEO Settings</summary>
        <div className={commonStyles.detailsContent}>
          <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
            <label htmlFor="metaTitle" className={`${commonStyles.label} ${themeStyles.label}`}>Meta Title</label>
            <input
              id="metaTitle"
              {...register('metaTitle')}
              className={`${commonStyles.input} ${themeStyles.input}`}
              placeholder="Optimal length: 50-60 characters"
              style={{ borderColor: (watch('metaTitle')||'').length > 60 ? '#ef4444' : undefined }}
            />
            <div className={commonStyles.helpText}>
              <span>Recommended 50–60 characters.</span>
              <span style={{float:'right', opacity:0.8}} aria-live="polite">{(watch('metaTitle')||'').length}/60</span>
            </div>
            {errors.metaTitle && <p className={commonStyles.error}>{errors.metaTitle.message}</p>}
          </div>

          <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
            <label htmlFor="metaDescription" className={`${commonStyles.label} ${themeStyles.label}`}>Meta Description</label>
            <textarea
              id="metaDescription"
              {...register('metaDescription')}
              className={`${commonStyles.textarea} ${themeStyles.textarea}`}
              placeholder="Optimal length: 150-160 characters"
              rows="3"
              style={{ borderColor: (watch('metaDescription')||'').length > 160 ? '#ef4444' : undefined }}
            ></textarea>
            <div className={commonStyles.helpText}>
              <span>Recommended 150–160 characters.</span>
              <span style={{float:'right', opacity:0.8}} aria-live="polite">{(watch('metaDescription')||'').length}/160</span>
            </div>
            {errors.metaDescription && <p className={commonStyles.error}>{errors.metaDescription.message}</p>}
          </div>

          <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
            <label className={`${commonStyles.label} ${themeStyles.label}`}>Open Graph Image (for social sharing)</label>
            <ImageUploader onUpload={handleOgImageUpdate} initialImageUrl={watch('ogImage')} />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <p className={commonStyles.helpText}>Recommended size: 1200x630px.</p>
              <button
                type="button"
                className={commonStyles.button}
                onClick={() => setValue('ogImage', watch('image') || '', { shouldDirty: true })}
                disabled={!watch('image')}
                title="Copy project image to social image"
              >Use Project Image</button>
            </div>
            {errors.ogImage && <p className={commonStyles.error}>{errors.ogImage.message}</p>}
          </div>
        </div>
      </details>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
          <input type="checkbox" {...register('published')} className={commonStyles.checkbox} />
          Publish this project?
        </label>
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label htmlFor="scheduledAt" className={`${commonStyles.label} ${themeStyles.label}`}>Schedule Publish (optional)</label>
        <input id="scheduledAt" type="datetime-local" {...register('scheduledAt')} className={`${commonStyles.input} ${themeStyles.input}`} />
        <div className={commonStyles.helpText}>Set a future date/time to schedule. Project will remain draft until then unless your backend job auto-publishes.</div>
        {errors.scheduledAt && <p className={commonStyles.error}>{errors.scheduledAt.message}</p>}
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
          <input type="checkbox" {...register('featuredOnHome')} className={commonStyles.checkbox} />
          Show on homepage (featured)
        </label>
      </div>

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <button type="button" className={`${commonStyles.button} ${commonStyles.previewButton}`} onClick={onPreview} disabled={isSubmitting}>
          Preview
        </button>
        <button type="submit" className={`${commonStyles.button} ${themeStyles.button}`} disabled={isSubmitting}>{project?._id ? 'Update' : 'Create'} Project</button>
      </div>
    </form>
  );
};

export default ProjectForm;
