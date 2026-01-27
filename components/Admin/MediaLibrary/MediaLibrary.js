import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ChipInput from "../ArticleForm/ChipInput"; // Re-using ChipInput for tags
import Modal from "../Modal/Modal";
import Icon from "../Icon/Icon";
import InlineSpinner from "../../LoadingAnimation/InlineSpinner";
import { motion } from "framer-motion";

import styles from "./MediaLibrary.premium.module.css";
import utilities from "../../../styles/utilities.module.css";

const MediaLibrary = ({ onSelect, isModal = false, contextTitle = "", imageType = "image" }) => {
  // Removed legacy theme styles



  // top progress helpers
  const topStart = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:top", { detail: { active: true } }));
    }
  };
  const topDone = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:top", { detail: { done: true } }));
    }
  };

  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [view, setView] = useState("grid"); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAsset, setEditingAsset] = useState(null);
  const [previewingAsset, setPreviewingAsset] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchAssets = useCallback(async (pageNum = 1, search = "") => {
    setIsLoading(true);
    topStart();
    try {
      const { data } = await axios.get(
        `/api/media?page=${pageNum}&limit=12&search=${search}`,
      );
      setAssets(data.assets);
      setTotalPages(Math.ceil(data.total / data.limit));
      setPage(data.page);
    } catch (err) {
      setError("Failed to load media assets.");
      toast.error("Failed to load media assets.");
    } finally {
      setIsLoading(false);
      topDone();
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
    topStart();

    // Using a for...of loop to upload sequentially to avoid overwhelming the server
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name);
      
      // SEO: Pass context for auto-renaming
      if (contextTitle) {
        formData.append("contextTitle", contextTitle);
        formData.append("imageType", imageType);
      }
      
      try {
        await axios.post("/api/media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        toast.error(`Failed to upload ${file.name}.`, { id: toastId });
        setUploading(false);
        topDone();
        return; // Stop on first error
      }
    }

    toast.success("All files uploaded successfully!", { id: toastId });
    setUploading(false);
    fetchAssets(1, searchTerm); // Refresh
    topDone();
  };

  const handleDelete = () => {
    if (selectedAssets.length === 0) return;
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const toastId = toast.loading(
      `Deleting ${selectedAssets.length} asset(s)...`,
    );
    topStart();
    try {
      await axios.delete("/api/media", { data: { ids: selectedAssets } });
      toast.success("Assets deleted successfully!", { id: toastId });
      setSelectedAssets([]);
      setDeleteModalOpen(false);
      fetchAssets(1, searchTerm); // Refresh
    } catch (err) {
      toast.error("An error occurred while deleting.", { id: toastId });
    } finally {
      topDone();
    }
  };

  const handleSelectAsset = (assetId) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId],
    );
  };

  const handleSaveMetadata = async (assetId, data) => {
    const toastId = toast.loading("Saving changes...");
    topStart();
    try {
      const res = await axios.put(`/api/media/${assetId}`, data);
      toast.success("Changes saved!", { id: toastId });
      setAssets((currentAssets) =>
        currentAssets.map((a) => (a._id === assetId ? res.data.asset : a)),
      );
      setEditingAsset(null);
    } catch (err) {
      toast.error("Failed to save changes.", { id: toastId });
    } finally {
      topDone();
    }
  };

  if (error) return <div className={`${styles.error}`}>{error}</div>;

  return (
    <motion.div 
      className={`${styles.mediaLibrary}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className={styles.toolbar}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {!isModal && <h1 className={styles.title}>Media Library</h1>}
        <div className={styles.actions}>
          <label htmlFor="media_search" className={styles.srOnly}>Search</label>
          <input
            type="search"
            placeholder="Search by filename or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${styles.searchInput}`}
            id="media_search"
          />
          <motion.label
            className={`${styles.uploadButton}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="upload" size={16} />
            {uploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className={styles.hiddenInput}
            />
          </motion.label>
          {selectedAssets.length > 0 && (
            <motion.button
              onClick={handleDelete}
              className={`${styles.deleteButton}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon name="trash" size={16} />
              Delete ({selectedAssets.length})
            </motion.button>
          )}
          <motion.button
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            className={`${styles.viewToggle}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name={view === "grid" ? "list" : "grid"} size={16} />
            {view === "grid" ? "List View" : "Grid View"}
          </motion.button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <InlineSpinner sizePx={16} />
          <span>Loading Media...</span>
        </motion.div>
      ) : assets.length === 0 ? (
        <motion.div 
          className={styles.emptyState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Icon name="image" size={48} />
          <h3>No Media Found</h3>
          <p>{searchTerm ? 'No assets match your search.' : 'Upload your first media asset to get started.'}</p>
        </motion.div>
      ) : (
        <motion.div 
          className={view === "grid" ? styles.grid : styles.list}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {assets.map((asset, index) => (
            <motion.div
              key={asset._id}
              className={`${styles.assetCard} ${selectedAssets.includes(asset._id) ? styles.selected : ""} ${view === "list" ? styles.listView : ""}`}
              onClick={() =>
                onSelect
                  ? setPreviewingAsset(asset)
                  : handleSelectAsset(asset._id)
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <img
                src={asset.url}
                alt={asset.altText}
                className={`${styles.assetImage} ${view === "list" ? styles.listView : ""}`}
              />
              <div className={styles.assetOverlay}>
                <p className={styles.assetName}>{asset.filename}</p>
                <div className={styles.assetMeta}>
                  <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                  <span>{(asset.tags || []).length} tags</span>
                </div>
                <div className={styles.tagContainer}>
                  {(asset.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                  {(asset.tags || []).length > 3 && (
                    <span className={styles.tag}>+{(asset.tags || []).length - 3}</span>
                  )}
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
                  <motion.button
                    className={`${styles.editButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAsset(asset);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon name="edit" size={14} />
                  </motion.button>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div 
        className={styles.pagination}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.button 
          onClick={() => setPage((p) => Math.max(1, p - 1))} 
          disabled={page <= 1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon name="chevron-left" size={16} />
          Previous
        </motion.button>
        <span>
          Page {page} of {totalPages}
        </span>
        <motion.button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next
          <Icon name="chevron-right" size={16} />
        </motion.button>
      </motion.div>

      {editingAsset && (
        <EditModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={handleSaveMetadata}
          
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
          
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmModal
          count={selectedAssets.length}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          
        />
      )}
    </motion.div>
  );
};

const PreviewModal = ({ asset, onClose, onInsert }) => {
  const cancelRef = useRef(null);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Modal isOpen={true} onClose={onClose} title="Preview & Insert" initialFocusRef={cancelRef}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <img src={asset.url} alt={asset.altText} className={styles.previewImage} />
          <div className={styles.formGroup}>
            <strong>Filename:</strong> {asset.filename}
          </div>
          <div className={styles.formGroup}>
            <strong>Alt Text:</strong> {asset.altText || "N/A"}
          </div>
          <div className={styles.formGroup}>
            <strong>Tags:</strong> {(asset.tags || []).join(", ") || "N/A"}
          </div>
          <div className={styles.formGroup}>
            <strong>Uploaded:</strong> {new Date(asset.uploadedAt).toLocaleString()}
          </div>
          <div className={styles.modalActions}>
            <motion.button 
              ref={cancelRef} 
              onClick={onClose} 
              className={`${utilities.btn} ${utilities.btnSecondary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon name="x" size={16} />
              Cancel
            </motion.button>
            <motion.button 
              onClick={onInsert} 
              className={`${utilities.btn} ${utilities.btnPrimary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon name="plus" size={16} />
              Insert Media
            </motion.button>
          </div>
        </motion.div>
      </Modal>
    </motion.div>
  );
};

const EditModal = ({ asset, onClose, onSave }) => {
  const [altText, setAltText] = useState(asset.altText || "");
  const [tags, setTags] = useState((asset.tags || []).join(", "));
  const altRef = useRef(null);

  const handleSave = () => {
    onSave(asset._id, {
      altText,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Modal isOpen={true} onClose={onClose} title="Edit Media" initialFocusRef={altRef}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <img src={asset.url} alt={altText} className={styles.editImage} />
          <div className={styles.formGroup}>
            <label htmlFor="alt_text">Alt Text</label>
            <input
              id="alt_text"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className={styles.input}
              ref={altRef}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="tags_input">Tags (comma-separated)</label>
            <ChipInput
              id="tags_input"
              value={tags}
              onChange={setTags}
              placeholder="Add a tag and press Enter"
            />
          </div>
          <div className={styles.modalActions}>
            <motion.button 
              onClick={onClose} 
              className={`${utilities.btn} ${utilities.btnSecondary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon name="x" size={16} />
              Cancel
            </motion.button>
            <motion.button 
              onClick={handleSave} 
              className={`${utilities.btn} ${utilities.btnPrimary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon name="save" size={16} />
              Save Changes
            </motion.button>
          </div>
        </motion.div>
      </Modal>
    </motion.div>
  );
};

const DeleteConfirmModal = ({ count, onCancel, onConfirm }) => {
  const cancelRef = useRef(null);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Modal isOpen={true} onClose={onCancel} title="Delete Assets" initialFocusRef={cancelRef}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p>Are you sure you want to delete <strong>{count}</strong> asset(s)? This action cannot be undone.</p>
          <div className={styles.modalActions}>
            <motion.button 
              ref={cancelRef} 
              type="button" 
              onClick={onCancel} 
              className={`${utilities.btn} ${utilities.btnSecondary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon name="x" size={16} />
              Cancel
            </motion.button>
            <motion.button 
              type="button" 
              onClick={onConfirm} 
              className={`${styles.deleteButton}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon name="trash" size={16} />
              Delete
            </motion.button>
          </div>
        </motion.div>
      </Modal>
    </motion.div>
  );
};

export default MediaLibrary;
