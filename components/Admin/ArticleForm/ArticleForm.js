import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { articleSchema } from '../../../lib/validation/schemas';
import ImageUploader from '../ImageUploader/ImageUploader';
import { useTheme } from '../../../context/ThemeContext';

import commonStyles from './ArticleForm.module.css';
import lightStyles from './ArticleForm.light.module.css';
import darkStyles from './ArticleForm.dark.module.css';

const RichTextEditor = dynamic(() => import('../RichTextEditor/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function ArticleForm({ article = {}, onSave, onPreview, serverErrors = {}, isSubmitting }) {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const { register, handleSubmit, control, formState: { errors }, setValue, watch, setError } = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article.title || '',
      content: article.content || '',
      excerpt: article.excerpt || '',
      tags: (article.tags || []).join(', '),
      published: article.published || false,
      coverImage: article.coverImage || '',
      showCoverImage: article.showCoverImage !== undefined ? article.showCoverImage : true,
      slug: article.slug || '',
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      ogImage: article.ogImage || '',
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

  const handleImageUpload = (url) => {
    setValue('coverImage', url, { shouldValidate: true });
  };

  const handleImageUsageChange = (useImage) => {
    setValue('showCoverImage', useImage, { shouldValidate: true });
  };

  const handleOgImageUpdate = (imageUrl) => {
    setValue('ogImage', imageUrl, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={commonStyles.form} noValidate>
        <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
          <label htmlFor="title" className={`${commonStyles.label} ${themeStyles.label}`}>Title</label>
          <input id="title" {...register('title')} className={`${commonStyles.input} ${themeStyles.input}`} />
          {errors.title && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.title.message}</p>}
        </div>

        <div className={commonStyles.formGroup}>
          <label htmlFor="slug" className={`${commonStyles.label} ${themeStyles.label}`}>Slug</label>
          <input id="slug" {...register('slug')} className={`${commonStyles.input} ${themeStyles.input}`} />
          {errors.slug && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.slug.message}</p>}
        </div>

        <div className={commonStyles.formGroup}>
          <label htmlFor="tags" className={`${commonStyles.label} ${themeStyles.label}`}>Tags (comma-separated)</label>
          <input id="tags" {...register('tags')} className={`${commonStyles.input} ${themeStyles.input}`} />
          {errors.tags && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.tags.message}</p>}
        </div>

        <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
          <label htmlFor="excerpt" className={`${commonStyles.label} ${themeStyles.label}`}>Excerpt</label>
          <textarea id="excerpt" {...register('excerpt')} className={`${commonStyles.input} ${themeStyles.input}`} rows="4" />
          {errors.excerpt && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.excerpt.message}</p>}
        </div>

        <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
          <label className={`${commonStyles.label} ${themeStyles.label}`}>Cover Image</label>
          <ImageUploader 
            onUpload={handleImageUpload} 
            initialImageUrl={watch('coverImage')} 
            onImageUsageChange={handleImageUsageChange}
            useImage={watch('showCoverImage')}
          />
          {errors.coverImage && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.coverImage.message}</p>}
        </div>

        <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
          <label className={`${commonStyles.label} ${themeStyles.label}`}>Content</label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
          />
          {errors.content && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.content.message}</p>}
        </div>

        <details className={`${commonStyles.details} ${themeStyles.details}`}>
          <summary className={`${commonStyles.summary} ${themeStyles.summary}`}>SEO Settings</summary>
          <div className={commonStyles.detailsContent}>
            <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
              <label htmlFor="metaTitle" className={`${commonStyles.label} ${themeStyles.label}`}>Meta Title</label>
              <input id="metaTitle" {...register('metaTitle')} className={`${commonStyles.input} ${themeStyles.input}`} placeholder="Optimal length: 50-60 characters" />
              {errors.metaTitle && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.metaTitle.message}</p>}
            </div>

            <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
              <label htmlFor="metaDescription" className={`${commonStyles.label} ${themeStyles.label}`}>Meta Description</label>
              <textarea id="metaDescription" {...register('metaDescription')} className={`${commonStyles.textarea} ${themeStyles.textarea}`} placeholder="Optimal length: 150-160 characters" rows="3"></textarea>
              {errors.metaDescription && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.metaDescription.message}</p>}
            </div>

            <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
              <label className={`${commonStyles.label} ${themeStyles.label}`}>Open Graph Image (for social sharing)</label>
              <ImageUploader onUpload={handleOgImageUpdate} initialImageUrl={watch('ogImage')} />
              <p className={commonStyles.helpText}>Recommended size: 1200x630px.</p>
              {errors.ogImage && <p className={`${commonStyles.error} ${themeStyles.error}`}>{errors.ogImage.message}</p>}
            </div>
          </div>
        </details>

        <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
          <label className={`${commonStyles.checkboxContainer} ${themeStyles.label}`}>
            <input type="checkbox" {...register('published')} />
            Published
          </label>
        </div>

        <div className={`${commonStyles.formGroup} ${commonStyles.fullWidth}`}>
          <button type="button" className={`${commonStyles.button} ${commonStyles.previewButton}`} onClick={onPreview} disabled={isSubmitting || !article?._id}>
            Preview
          </button>
          <button type="submit" className={commonStyles.button} disabled={isSubmitting}>{article?._id ? 'Update' : 'Save'} Article</button>
        </div>
      </form>
  );
}
