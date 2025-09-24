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

  return (
    <AdminLayout title="Resume">
      <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Manage Resume</h1>
            <p className={styles.subtitle}>Upload and manage your professional resume</p>
          </div>
        </header>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Icon name="upload" size={20} />
            Upload New Resume
          </h2>
          <div className={styles.uploadSection}>
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf" 
              className={styles.fileInput} 
              disabled={uploading}
            />
            {selectedFile && (
              <p className={styles.fileName}>
                <Icon name="document" size={16} /> 
                Selected file: {selectedFile.name}
              </p>
            )}
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
            {uploading && (
              <div className={styles.uploadProgress}>
                <div 
                  className={styles.uploadProgressFill} 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
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
                <p><Icon name="document" size={16} /> {resume.filename}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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