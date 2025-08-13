import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';
import ChipInput from '../ArticleForm/ChipInput'; // Re-using ChipInput for tags

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
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState(null);
  const [previewingAsset, setPreviewingAsset] = useState(null);

  const fetchAssets = useCallback(async (pageNum = 1, search = '') => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/media?page=${pageNum}&limit=12&search=${search}`);
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
    const handler = setTimeout(() => {
      fetchAssets(1, searchTerm);
    }, 300); // Debounce search
    return () => clearTimeout(handler);
  }, [searchTerm, fetchAssets]);

  useEffect(() => {
    fetchAssets(page, searchTerm);
  }, [page]);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} file(s)...`);
    
    // Using a for...of loop to upload sequentially to avoid overwhelming the server
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);
      try {
        await axios.post('/api/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (err) {
        toast.error(`Failed to upload ${file.name}.`, { id: toastId });
        setUploading(false);
        return; // Stop on first error
      }
    }

    toast.success('All files uploaded successfully!', { id: toastId });
    setUploading(false);
    fetchAssets(1, searchTerm); // Refresh
  };

  const handleDelete = async () => {
    if (selectedAssets.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedAssets.length} asset(s)? This is irreversible.`)) return;

    const toastId = toast.loading(`Deleting ${selectedAssets.length} asset(s)...`);
    try {
      await axios.delete('/api/media', { data: { ids: selectedAssets } });
      toast.success('Assets deleted successfully!', { id: toastId });
      setSelectedAssets([]);
      fetchAssets(1, searchTerm); // Refresh
    } catch (err) {
      toast.error('An error occurred while deleting.', { id: toastId });
    }
  };

  const handleSelectAsset = (assetId) => {
    setSelectedAssets(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSaveMetadata = async (assetId, data) => {
    const toastId = toast.loading('Saving changes...');
    try {
      const res = await axios.put(`/api/media/${assetId}`, data);
      toast.success('Changes saved!', { id: toastId });
      setAssets(currentAssets => currentAssets.map(a => a._id === assetId ? res.data.asset : a));
      setEditingAsset(null);
    } catch (err) {
      toast.error('Failed to save changes.', { id: toastId });
    }
  };
  
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={`${styles.mediaLibrary} ${themeStyles.mediaLibrary}`}>
      <div className={styles.toolbar}>
        {!isModal && <h1 className={themeStyles.title}>Media Library</h1>}
        <div className={styles.actions}>
          <input 
            type="search"
            placeholder="Search by filename or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${styles.searchInput} ${themeStyles.searchInput}`}
          />
          <label className={`${styles.uploadButton} ${themeStyles.uploadButton}`}>
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" multiple onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
          </label>
          {selectedAssets.length > 0 && (
            <button onClick={handleDelete} className={`${styles.deleteButton} ${themeStyles.deleteButton}`}>
              Delete ({selectedAssets.length})
            </button>
          )}
          <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className={styles.viewToggle}>
            {view === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading Media...</div>
      ) : (
        <div className={view === 'grid' ? styles.grid : styles.list}>
          {assets.map(asset => (
            <div 
              key={asset._id} 
              className={`${styles.assetCard} ${themeStyles.assetCard} ${selectedAssets.includes(asset._id) ? styles.selected : ''}`}
              onClick={() => onSelect ? setPreviewingAsset(asset) : handleSelectAsset(asset._id)}
            >
              <img src={asset.url} alt={asset.altText} className={styles.assetImage} />
              <div className={styles.assetOverlay}>
                <p className={styles.assetName}>{asset.filename}</p>
                <div className={styles.tagContainer}>
                  {(asset.tags || []).map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
              </div>
              {!onSelect && (
                <>
                  <input 
                    type="checkbox" 
                    checked={selectedAssets.includes(asset._id)}
                    readOnly
                    className={styles.checkbox}
                  />
                  <button 
                    className={styles.editButton} 
                    onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.pagination}>
        <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
      </div>

      {editingAsset && (
        <EditModal 
          asset={editingAsset} 
          onClose={() => setEditingAsset(null)}
          onSave={handleSaveMetadata}
          themeStyles={themeStyles}
        />
      )}

      {previewingAsset && onSelect && (
        <PreviewModal
          asset={previewingAsset}
          onClose={() => setPreviewingAsset(null)}
          onInsert={() => {
            onSelect(previewingAsset);
            setPreviewingAsset(null);
          }}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
};

const PreviewModal = ({ asset, onClose, onInsert, themeStyles }) => {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={`${styles.modalContent} ${themeStyles.modalContent}`} onClick={e => e.stopPropagation()}>
        <h2>Preview & Insert</h2>
        <img src={asset.url} alt={asset.altText} style={{ width: '100%', maxHeight: '30vh', objectFit: 'contain', margin: '1rem 0', borderRadius: '4px' }} />
        <div className={styles.formGroup}>
          <strong>Filename:</strong> {asset.filename}
        </div>
        <div className={styles.formGroup}>
          <strong>Alt Text:</strong> {asset.altText || 'N/A'}
        </div>
        <div className={styles.formGroup}>
          <strong>Tags:</strong> {(asset.tags || []).join(', ') || 'N/A'}
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.button}>Cancel</button>
          <button onClick={onInsert} className={`${styles.button} ${styles.buttonPrimary}`}>Insert Media</button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ asset, onClose, onSave, themeStyles }) => {
  const [altText, setAltText] = useState(asset.altText || '');
  const [tags, setTags] = useState((asset.tags || []).join(', '));

  const handleSave = () => {
    onSave(asset._id, { 
      altText, 
      tags: tags.split(',').map(t => t.trim()).filter(Boolean) 
    });
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={`${styles.modalContent} ${themeStyles.modalContent}`} onClick={e => e.stopPropagation()}>
        <h2>Edit Media</h2>
        <img src={asset.url} alt={altText} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
        <div className={styles.formGroup}>
          <label>Alt Text</label>
          <input 
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className={themeStyles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Tags (comma-separated)</label>
          <ChipInput
            value={tags}
            onChange={setTags}
            placeholder="Add a tag and press Enter"
          />
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.button}>Cancel</button>
          <button onClick={handleSave} className={styles.buttonPrimary}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
