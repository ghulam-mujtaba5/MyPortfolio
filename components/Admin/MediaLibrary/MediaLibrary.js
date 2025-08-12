import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';

import styles from './MediaLibrary.module.css';
import lightStyles from './MediaLibrary.light.module.css';
import darkStyles from './MediaLibrary.dark.module.css';

const MediaLibrary = ({ onSelect, isModal = false }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);

  const fetchAssets = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/media?page=${pageNum}&limit=12`);
      setAssets(data.assets);
      setTotalPages(Math.ceil(data.total / data.limit));
      setPage(data.page);
    } catch (err) {
      setError('Failed to load media assets.');
      toast.error('Failed to load media assets.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets(page);
  }, [page, fetchAssets]);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);
      return axios.post('/api/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    });

    try {
      await toast.promise(
        Promise.all(uploadPromises),
        {
          loading: 'Uploading files...',
          success: 'Files uploaded successfully!',
          error: 'An error occurred during upload.',
        }
      );
      fetchAssets(1); // Refresh the library
    } catch (err) {
      // Toast already handled error
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedAssets.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedAssets.length} asset(s)? This is irreversible.`)) return;

    const deletePromises = selectedAssets.map(id => axios.delete(`/api/media/${id}`));

    try {
      await toast.promise(
        Promise.all(deletePromises),
        {
          loading: 'Deleting assets...',
          success: 'Assets deleted successfully!',
          error: 'An error occurred while deleting.',
        }
      );
      setSelectedAssets([]);
      fetchAssets(page);
    } catch (err) {
       // Toast already handled error
    }
  };

  const handleSelectAsset = (assetId) => {
    setSelectedAssets(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };
  
  if (isLoading) return <div>Loading Media...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={`${styles.mediaLibrary} ${themeStyles.mediaLibrary}`}>
      <div className={styles.toolbar}>
        <h1 className={themeStyles.title}>Media Library</h1>
        <div className={styles.actions}>
          <label className={`${styles.uploadButton} ${themeStyles.uploadButton}`}>
            {uploading ? 'Uploading...' : 'Upload New Media'}
            <input type="file" multiple onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
          </label>
          {selectedAssets.length > 0 && (
            <button onClick={handleDelete} className={`${styles.deleteButton} ${themeStyles.deleteButton}`}>
              Delete ({selectedAssets.length})
            </button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {assets.map(asset => (
          <div 
            key={asset._id} 
            className={`${styles.assetCard} ${selectedAssets.includes(asset._id) ? styles.selected : ''}`}
            onClick={() => onSelect ? onSelect(asset) : handleSelectAsset(asset._id)}
          >
            <img src={asset.url} alt={asset.altText} className={styles.assetImage} />
            <div className={styles.assetOverlay}>
              <p className={styles.assetName}>{asset.filename}</p>
            </div>
            {!onSelect && (
              <input 
                type="checkbox" 
                checked={selectedAssets.includes(asset._id)}
                readOnly
                className={styles.checkbox}
              />
            )}
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
      </div>
    </div>
  );
};

export default MediaLibrary;
