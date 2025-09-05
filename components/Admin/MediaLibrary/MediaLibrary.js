import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../../../context/ThemeContext";
import ChipInput from "../ArticleForm/ChipInput"; // Re-using ChipInput for tags
import Modal from "../Modal/Modal";

import styles from "./MediaLibrary.module.css";
import lightStyles from "./MediaLibrary.light.module.css";
import darkStyles from "./MediaLibrary.dark.module.css";
import utilities from "../../../styles/utilities.module.css";

const MediaLibrary = ({ onSelect, isModal = false }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

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

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={`${styles.mediaLibrary} ${themeStyles.mediaLibrary}`}>
      <div className={styles.toolbar}>
        {!isModal && <h1 className={themeStyles.title}>Media Library</h1>}
        <div className={styles.actions}>
          <label htmlFor="media_search" className={styles.srOnly}>Search</label>
          <input
            type="search"
            placeholder="Search by filename or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${styles.searchInput} ${themeStyles.searchInput}`}
            id="media_search"
          />
          <label
            className={`${styles.uploadButton} ${themeStyles.uploadButton}`}
          >
            {uploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className={styles.hiddenInput}
            />
          </label>
          {selectedAssets.length > 0 && (
            <button
              onClick={handleDelete}
              className={`${styles.deleteButton} ${themeStyles.deleteButton}`}
            >
              Delete ({selectedAssets.length})
            </button>
          )}
          <button
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            className={styles.viewToggle}
          >
            {view === "grid" ? "List View" : "Grid View"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading Media...</div>
      ) : (
        <div className={view === "grid" ? styles.grid : styles.list}>
          {assets.map((asset) => (
            <div
              key={asset._id}
              className={`${styles.assetCard} ${themeStyles.assetCard} ${selectedAssets.includes(asset._id) ? styles.selected : ""}`}
              onClick={() =>
                onSelect
                  ? setPreviewingAsset(asset)
                  : handleSelectAsset(asset._id)
              }
            >
              <img
                src={asset.url}
                alt={asset.altText}
                className={styles.assetImage}
              />
              <div className={styles.assetOverlay}>
                <p className={styles.assetName}>{asset.filename}</p>
                <div className={styles.tagContainer}>
                  {(asset.tags || []).map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAsset(asset);
                    }}
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
        <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
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

      {isDeleteModalOpen && (
        <DeleteConfirmModal
          count={selectedAssets.length}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
};

const PreviewModal = ({ asset, onClose, onInsert, themeStyles }) => {
  const cancelRef = useRef(null);
  return (
    <Modal isOpen={true} onClose={onClose} title="Preview & Insert" initialFocusRef={cancelRef}>
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
      <div className={styles.modalActions}>
        <button ref={cancelRef} onClick={onClose} className={`${utilities.btn} ${utilities.btnSecondary}`}>
          Cancel
        </button>
        <button onClick={onInsert} className={`${utilities.btn} ${utilities.btnPrimary}`}>
          Insert Media
        </button>
      </div>
    </Modal>
  );
};

const EditModal = ({ asset, onClose, onSave, themeStyles }) => {
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
    <Modal isOpen={true} onClose={onClose} title="Edit Media" initialFocusRef={altRef}>
      <img src={asset.url} alt={altText} className={styles.editImage} />
      <div className={styles.formGroup}>
        <label htmlFor="alt_text">Alt Text</label>
        <input
          id="alt_text"
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          className={themeStyles.input}
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
        <button onClick={onClose} className={`${utilities.btn} ${utilities.btnSecondary}`}>
          Cancel
        </button>
        <button onClick={handleSave} className={`${utilities.btn} ${utilities.btnPrimary}`}>
          Save
        </button>
      </div>
    </Modal>
  );
};

const DeleteConfirmModal = ({ count, onCancel, onConfirm, themeStyles }) => {
  const cancelRef = useRef(null);
  return (
    <Modal isOpen={true} onClose={onCancel} title="Delete Assets" initialFocusRef={cancelRef}>
      <p>Are you sure you want to delete <strong>{count}</strong> asset(s)? This action cannot be undone.</p>
      <div className={styles.modalActions}>
        <button ref={cancelRef} type="button" onClick={onCancel} className={`${utilities.btn} ${utilities.btnSecondary}`}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={`${styles.deleteButton} ${themeStyles.deleteButton}`}>
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default MediaLibrary;
