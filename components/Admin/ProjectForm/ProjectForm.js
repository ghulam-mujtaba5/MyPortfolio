// Forcing a file re-read to clear build cache.
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../../../lib/validation/schemas';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import ImageUploader from '../ImageUploader/ImageUploader';
import { useTheme } from '../../../context/ThemeContext';

import commonStyles from './ProjectForm.module.css';
import lightStyles from './ProjectForm.light.module.css';
import darkStyles from './ProjectForm.dark.module.css';

const ProjectForm = ({ onSave, onPreview, project = {}, serverErrors = {}, isSubmitting }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const { register, handleSubmit, control, formState: { errors }, setValue, watch, setError } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title || '',
      description: project.description || '',
      tags: (project.tags || []).join(', '),
      category: project.category || '',
      'links.live': project.links?.live || '',
      'links.github': project.links?.github || '',
      image: project.image || '',
      showImage: project.showImage !== undefined ? project.showImage : true,
      published: project.published || false,
      featuredOnHome: project.featuredOnHome || false,
    },
  });

  useEffect(() => {
    for (const key in serverErrors) {
      setError(key, { type: 'server', message: serverErrors[key] });
    }
  }, [serverErrors, setError]);

  const onSubmit = (data) => {
    const submittedData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    onSave(submittedData);
  };

  const handleImageUpdate = (imageUrl) => {
    setValue('image', imageUrl, { shouldValidate: true });
  };

  const handleImageUsageChange = (useImage) => {
    setValue('showImage', useImage, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`${commonStyles.form} ${themeStyles.form}`} noValidate>
      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label htmlFor="title" className={`${commonStyles.label} ${themeStyles.label}`}>Project Title</label>
        <input id="title" {...register('title')} className={`${commonStyles.input} ${themeStyles.input}`} />
        {errors.title && <p className={commonStyles.error}>{errors.title.message}</p>}
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
        <label htmlFor="category" className={`${commonStyles.label} ${themeStyles.label}`}>Category</label>
        <input id="category" {...register('category')} className={`${commonStyles.input} ${themeStyles.input}`} />
        {errors.category && <p className={commonStyles.error}>{errors.category.message}</p>}
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

      <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
        <label className={`${commonStyles.label} ${themeStyles.label}`}>
          <input type="checkbox" {...register('published')} className={commonStyles.checkbox} />
          Publish this project?
        </label>
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
