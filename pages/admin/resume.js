import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';

import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import Icon from '../../components/Admin/Icon/Icon';
import Spinner from '../../components/Spinner/Spinner';
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';

import commonStyles from './resume.module.css';
import lightStyles from './resume.light.module.css';
import darkStyles from './resume.dark.module.css';
import utilities from '../../styles/utilities.module.css';

const ResumePage = () => {
  const { theme } = useTheme();
  const router = useRouter();
  
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  
  const styles = {
    ...commonStyles,
    ...themeStyles,
  };

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchResume = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resume', { credentials: 'same-origin' });
      if (!res.ok) {
        if (res.status === 401) {
          const cb = encodeURIComponent('/admin/resume');
          router.push(`/admin/login?callbackUrl=${cb}`);
          return;
        }
        throw new Error('Failed to fetch resume');
      }
      const data = await res.json();
      setResume(data.resume);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file.');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }
    
    setSelectedFile(file);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/resume', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        if (response.status === 401) {
          const cb = encodeURIComponent('/admin/resume');
          toast.error('Please login to continue');
          router.push(`/admin/login?callbackUrl=${cb}`);
          throw new Error('Please login to continue');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to upload resumes');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload resume');
      }

      const data = await response.json();
      fetchResume();
      setSelectedFile(null);
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDownload = () => {
    if (!resume) return;
    
    const url = resume.fileId
      ? `/api/download-resume?id=${resume.fileId}&filename=${encodeURIComponent(resume.filename)}`
      : resume.url
      ? `/api/download-resume?url=${encodeURIComponent(resume.url)}&filename=${encodeURIComponent(resume.filename)}`
      : '#';
    
    window.open(url, '_blank');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <AdminLayout title="Resume">
      <div className={styles.pageWrapper}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Manage Resume</h1>
          <p className={styles.pageSubtitle}>Upload and manage your professional resume</p>
        </header>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <Icon name="upload" size={20} />
            Upload New Resume
          </h2>
          
          {/* Modern Drag & Drop Area */}
          <div 
            className={`${styles.uploadArea} ${dragActive ? styles.active : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Icon name="file-text" size={48} className={styles.uploadIcon} />
            <div className={styles.uploadText}>
              <h3>Drag & Drop your resume</h3>
              <p>PDF files only, maximum 5MB</p>
            </div>
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf" 
              className={styles.fileInput}
              disabled={uploading}
            />
            
            <div className={styles.actionButtons}>
              <button 
                className={`${styles.actionButton} ${styles.secondary}`}
                onClick={() => document.querySelector(`.${styles.fileInput}`).click()}
                disabled={uploading}
              >
                <Icon name="folder" size={16} />
                Browse Files
              </button>
            </div>
          </div>
          
          {/* Selected File Info */}
          {selectedFile && (
            <div className={styles.fileInfo}>
              <Icon name="document" size={16} />
              <span className={styles.fileName}>{selectedFile.name}</span>
              <button 
                onClick={handleRemoveFile}
                className={styles.actionButton}
                style={{ padding: '0.25rem', minWidth: 'auto' }}
                disabled={uploading}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          )}
          
          {/* Upload Progress */}
          {uploading && (
            <>
              <div className={styles.uploadProgress}>
                <div 
                  className={styles.uploadProgressFill} 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className={styles.progressText}>
                Uploading... {uploadProgress}%
              </div>
            </>
          )}
          
          {/* Upload Button */}
          <div className={styles.actionButtons}>
            <button 
              onClick={handleUpload} 
              className={`${styles.actionButton} ${styles.primary}`} 
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <Spinner size="sm" />
                  <span>Uploading... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Icon name="upload" size={16} />
                  <span>Upload Resume</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <Icon name="document" size={20} />
            Current Resume
          </h2>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Spinner size="sm" />
              <span>Loading resume...</span>
            </div>
          ) : resume ? (
            <div className={styles.resumeInfo}>
              <div>
                <p>
                  <Icon name="document" size={16} /> {resume.filename}
                </p>
                <p className={styles.resumeMeta}>
                  Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className={styles.actionButtons}>
                <button 
                  onClick={handleDownload}
                  className={`${styles.actionButton} ${styles.secondary}`}
                >
                  <Icon name="download" size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.noResume}>
              <Icon name="document" size={48} />
              <p>No resume has been uploaded yet.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Upload your PDF resume using the form above
              </p>
            </div>
          )}
        </div>
      </div>
      {uploading && <LoadingAnimation visible={true} />}
    </AdminLayout>
  );
};

export default ResumePage;