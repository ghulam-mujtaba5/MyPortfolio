import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useTheme } from '../../../context/ThemeContext';

import commonStyles from './ImageUploader.module.css';
import lightStyles from './ImageUploader.light.module.css';
import darkStyles from './ImageUploader.dark.module.css';

export default function ImageUploader({ onUpload, initialImageUrl = '', onImageUsageChange, useImage: initialUseImage = true }) {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(initialImageUrl);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [useImage, setUseImage] = useState(initialUseImage);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(initialImageUrl);
    setUseImage(initialUseImage);
  }, [initialImageUrl, initialUseImage]);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: reader.result }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const data = await response.json();
        setPreview(data.url);
        onUpload(data.url);
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    };
  }, [onUpload]);

  const handleFileChange = (e) => {
    handleUpload(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleUpload(e.dataTransfer.files[0]);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleUrlSubmit = () => {
    if (!imageUrl) return;
    setPreview(imageUrl);
    onUpload(imageUrl);
  };

  const handleToggleImageUsage = (e) => {
    const checked = e.target.checked;
    setUseImage(checked);
    if (onImageUsageChange) {
        onImageUsageChange(checked);
    }
  };
  
  const handleRemoveImage = () => {
    setPreview('');
    onUpload('');
    setImageUrl('');
  };

  const uploaderBoxClasses = `
    ${commonStyles.uploaderBox} 
    ${themeStyles.uploaderBox} 
    ${isDragOver ? themeStyles.dragOver : ''}
  `;

  return (
    <div className={`${commonStyles.container} ${themeStyles.container}`}>
      <div className={commonStyles.toggleContainer}>
        <label className={commonStyles.toggleLabel}>
          <input type="checkbox" checked={useImage} onChange={handleToggleImageUsage} className={commonStyles.toggleCheckbox} />
          Use Image
        </label>
      </div>

      {useImage && (
        <>
          <div className={commonStyles.methodSelector}>
            <button onClick={() => setUploadMethod('file')} className={`${commonStyles.methodButton} ${uploadMethod === 'file' ? commonStyles.activeMethod : ''}`}>
              Upload File
            </button>
            <button onClick={() => setUploadMethod('url')} className={`${commonStyles.methodButton} ${uploadMethod === 'url' ? commonStyles.activeMethod : ''}`}>
              From URL
            </button>
          </div>

          {uploadMethod === 'file' ? (
            <div
              className={uploaderBoxClasses}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              role="button"
              tabIndex="0"
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                ref={fileInputRef}
                className={commonStyles.input}
              />
              {uploading ? (
                <p>Uploading...</p>
              ) : (
                <p>Drag & drop or click to upload</p>
              )}
            </div>
          ) : (
            <div className={commonStyles.urlInputContainer}>
              <input
                type="text"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={`${commonStyles.urlInput} ${themeStyles.urlInput}`}
              />
              <button onClick={handleUrlSubmit} className={`${commonStyles.urlSubmitButton} ${themeStyles.urlSubmitButton}`}>
                Set Image
              </button>
            </div>
          )}

          {error && <p className={`${commonStyles.error} ${themeStyles.error}`}>{error}</p>}

          {preview && (
            <div className={commonStyles.previewContainer}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '200px', margin: '0 auto', borderRadius: '8px', overflow: 'hidden' }}>
                <Image 
                  src={preview} 
                  alt="Preview" 
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <button onClick={handleRemoveImage} className={`${commonStyles.removeButton} ${themeStyles.removeButton}`}>
                Remove
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
