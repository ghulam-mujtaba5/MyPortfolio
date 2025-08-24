import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import Icon from '../../components/Admin/Icon/Icon';
import Spinner from '../../components/Spinner/Spinner';
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';

import commonStyles from './resume.module.css';
import utilities from '../../styles/utilities.module.css';

const ResumePage = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
  };

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchResume = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resume');
      if (!res.ok) throw new Error('Failed to fetch resume');
      const data = await res.json();
      setResume(data.resume);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      await toast.promise(
        fetch('/api/admin/resume', {
          method: 'POST',
          body: formData,
        }).then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to upload resume');
          }
          return res.json();
        }),
        {
          loading: 'Uploading resume...',
          success: () => {
            fetchResume();
            setSelectedFile(null);
            return 'Resume uploaded successfully!';
          },
          error: (err) => err.message,
        }
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Manage Resume</h1>
        </header>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Upload New Resume</h2>
          <div className={styles.uploadSection}>
            <input type="file" onChange={handleFileChange} accept=".pdf" className={styles.fileInput} />
            <button onClick={handleUpload} className={`${utilities.btn} ${utilities.btnPrimary}`} disabled={uploading || !selectedFile}>
              {uploading ? <Spinner size="sm" /> : <Icon name="upload" size={16} />}
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </button>
          </div>
          {selectedFile && <p className={styles.fileName}>Selected file: {selectedFile.name}</p>}
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Current Resume</h2>
          {loading ? (
            <Spinner label="Loading resume..." />
          ) : resume ? (
            <div className={styles.resumeInfo}>
              <p className={styles.fileName}>{resume.filename}</p>
              <a href={`/api/download-resume?filename=${resume.filename}`} download className={`${utilities.btn} ${utilities.btnSecondary}`}>
                <Icon name="download" size={16} />
                <span>Download</span>
              </a>
            </div>
          ) : (
            <p>No resume has been uploaded yet.</p>
          )}
        </div>
      </div>
      {uploading && <LoadingAnimation visible={true} />}
    </AdminLayout>
  );
};

export default ResumePage;
