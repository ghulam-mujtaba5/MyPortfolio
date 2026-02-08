import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import Icon from '../../components/Admin/Icon/Icon';
import Spinner from '../../components/Spinner/Spinner';
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';

import styles from './resume.premium.module.css';
import utilities from '../../styles/utilities.module.css';

const ResumePage = () => {
  const { theme } = useTheme();
  const router = useRouter();
  
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
      <motion.div 
        className={styles.pageWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.header 
          className={styles.pageHeader}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.h1 
            className={styles.pageTitle}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Icon name="file-text" size={28} />
            Manage Resume
          </motion.h1>
          <motion.p 
            className={styles.pageSubtitle}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Upload and manage your professional resume
          </motion.p>
        </motion.header>

        <motion.div 
          className={styles.sectionCard}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Icon name="upload" size={20} />
            Upload New Resume
          </motion.h2>
          
          {/* Modern Drag & Drop Area */}
          <motion.div 
            className={`${styles.uploadArea} ${dragActive ? styles.active : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
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
              <motion.button 
                className={`${styles.actionButton} ${styles.secondary}`}
                onClick={() => document.querySelector(`.${styles.fileInput}`).click()}
                disabled={uploading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name="folder" size={16} />
                Browse Files
              </motion.button>
            </div>
          </motion.div>
          
          {/* Selected File Info */}
          {selectedFile && (
            <motion.div 
              className={styles.fileInfo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Icon name="document" size={16} />
              <span className={styles.fileName}>{selectedFile.name}</span>
              <motion.button 
                onClick={handleRemoveFile}
                className={styles.actionButton}
                style={{ padding: '0.25rem', minWidth: 'auto' }}
                disabled={uploading}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon name="x" size={16} />
              </motion.button>
            </motion.div>
          )}
          
          {/* Upload Progress */}
          {uploading && (
            <>
              <div className={styles.uploadProgress}>
                <motion.div 
                  className={styles.uploadProgressFill} 
                  style={{ width: `${uploadProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className={styles.progressText}>
                Uploading... {uploadProgress}%
              </div>
            </>
          )}
          
          {/* Upload Button */}
          <div className={styles.actionButtons}>
            <motion.button 
              onClick={handleUpload} 
              className={`${styles.actionButton} ${styles.primary}`} 
              disabled={uploading || !selectedFile}
              whileHover={{ scale: uploading || !selectedFile ? 1 : 1.05 }}
              whileTap={{ scale: uploading || !selectedFile ? 1 : 0.95 }}
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
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className={styles.sectionCard}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Icon name="document" size={20} />
            Current Resume
          </motion.h2>
          {loading ? (
            <motion.div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Spinner size="sm" />
              <span>Loading resume...</span>
            </motion.div>
          ) : resume ? (
            <motion.div 
              className={styles.resumeInfo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <p>
                  <Icon name="document" size={16} /> {resume.filename}
                </p>
                <p className={styles.resumeMeta}>
                  Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className={styles.actionButtons}>
                <motion.button 
                  onClick={handleDownload}
                  className={`${styles.actionButton} ${styles.secondary}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon name="download" size={16} />
                  <span>Download</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className={styles.noResume}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon name="document" size={48} />
              <p>No resume has been uploaded yet.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Upload your PDF resume using the form above
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      {uploading && <LoadingAnimation visible={true} />}
    </AdminLayout>
  );
};

export default ResumePage;