import React, { useState, useRef } from "react";
import Image from "next/image";
import styles from "./GalleryManager.premium.module.css";

const GalleryManager = ({ gallery = [], onChange, maxImages = 20, contextTitle = "" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remainingSlots = maxImages - gallery.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      alert(`Maximum ${maxImages} images allowed.`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("altText", file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        
        // SEO: Pass context for auto-renaming
        if (contextTitle) {
          formData.append("contextTitle", contextTitle);
          formData.append("imageType", `gallery-${index + 1}`);
        }

        const response = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg =
            data.error || data.message || `Failed to upload ${file.name}`;
          throw new Error(errorMsg);
        }

        return {
          url: data.asset.url,
          caption: "",
          alt: data.asset.altText || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          order: gallery.length + filesToUpload.indexOf(file),
        };
      });

      const newImages = await Promise.all(uploadPromises);
      const updatedGallery = [...gallery, ...newImages].map((img, idx) => ({
        ...img,
        order: idx,
      }));

      onChange(updatedGallery);
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Failed to upload one or more images: ${error.message || "Please try again."}`,
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle URL input for adding images
  const [urlInput, setUrlInput] = useState("");

  const handleAddByUrl = () => {
    if (!urlInput.trim()) return;

    if (gallery.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const newImage = {
      url: urlInput.trim(),
      caption: "",
      alt: "",
      order: gallery.length,
    };

    onChange([...gallery, newImage]);
    setUrlInput("");
  };

  // Remove image
  const handleRemove = (index) => {
    const updatedGallery = gallery
      .filter((_, i) => i !== index)
      .map((img, idx) => ({ ...img, order: idx }));
    onChange(updatedGallery);
  };

  // Update image details
  const handleUpdateImage = (index, field, value) => {
    const updatedGallery = gallery.map((img, i) =>
      i === index ? { ...img, [field]: value } : img,
    );
    onChange(updatedGallery);
  };

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      const newGallery = [...gallery];
      const [draggedItem] = newGallery.splice(draggedIndex, 1);
      newGallery.splice(dragOverIndex, 0, draggedItem);

      // Update order numbers
      const reorderedGallery = newGallery.map((img, idx) => ({
        ...img,
        order: idx,
      }));

      onChange(reorderedGallery);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move image up/down
  const moveImage = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= gallery.length) return;

    const newGallery = [...gallery];
    [newGallery[index], newGallery[newIndex]] = [
      newGallery[newIndex],
      newGallery[index],
    ];

    const reorderedGallery = newGallery.map((img, idx) => ({
      ...img,
      order: idx,
    }));

    onChange(reorderedGallery);
  };

  return (
    <div className={styles.galleryManager}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h4 className={styles.title}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Project Images
          </h4>
          <span className={styles.count}>
            {gallery.length} / {maxImages} images
          </span>
        </div>
        <p className={styles.hint}>
          First image is your cover • Drag to reorder all • Click to edit
        </p>
      </div>

      {/* Upload Section */}
      <div className={styles.uploadSection}>
        <div className={styles.uploadMethods}>
          {/* File Upload */}
          <div className={styles.uploadBox}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className={styles.fileInput}
              id="gallery-upload"
              disabled={isUploading || gallery.length >= maxImages}
            />
            <label
              htmlFor="gallery-upload"
              className={`${styles.uploadLabel} ${isUploading ? styles.uploading : ""}`}
            >
              {isUploading ? (
                <>
                  <div className={styles.spinner} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Upload Images</span>
                  <small>Click or drag files here</small>
                </>
              )}
            </label>
          </div>

          {/* URL Input */}
          <div className={styles.urlBox}>
            <div className={styles.urlInputGroup}>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste image URL..."
                className={styles.urlInput}
                disabled={gallery.length >= maxImages}
              />
              <button
                type="button"
                onClick={handleAddByUrl}
                disabled={!urlInput.trim() || gallery.length >= maxImages}
                className={styles.addUrlBtn}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {gallery.length > 0 ? (
        <div className={styles.galleryGrid}>
          {gallery.map((image, index) => (
            <div
              key={index}
              className={`${styles.imageCard} ${draggedIndex === index ? styles.dragging : ""} ${dragOverIndex === index ? styles.dragOver : ""}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Order Badge / Cover Badge */}
              <div className={styles.orderBadge}>
                {index === 0 ? (
                  <span title="This is your cover image">📌 COVER</span>
                ) : (
                  index + 1
                )}
              </div>

              {/* Image Preview */}
              <div
                className={styles.imagePreview}
                onClick={() =>
                  setEditingIndex(editingIndex === index ? null : index)
                }
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  width={200}
                  height={150}
                  className={styles.previewImg}
                  style={{ objectFit: "cover" }}
                  unoptimized={/^https?:\/\//i.test(image.url)}
                />
                <div className={styles.imageOverlay}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={styles.quickActions}>
                <button
                  type="button"
                  onClick={() => moveImage(index, "up")}
                  disabled={index === 0}
                  className={styles.actionBtn}
                  title="Move up"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, "down")}
                  disabled={index === gallery.length - 1}
                  className={styles.actionBtn}
                  title="Move down"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  title="Remove image"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>

              {/* Edit Panel */}
              {editingIndex === index && (
                <div className={styles.editPanel}>
                  <div className={styles.editField}>
                    <label>Caption</label>
                    <input
                      type="text"
                      value={image.caption || ""}
                      onChange={(e) =>
                        handleUpdateImage(index, "caption", e.target.value)
                      }
                      placeholder="Add a caption..."
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.editField}>
                    <label>Alt Text</label>
                    <input
                      type="text"
                      value={image.alt || ""}
                      onChange={(e) =>
                        handleUpdateImage(index, "alt", e.target.value)
                      }
                      placeholder="Describe the image..."
                      className={styles.editInput}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className={styles.doneBtn}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p>No images yet</p>
          <span>Upload your first image to get started. First image will be your cover.</span>
        </div>
      )}

      {/* Tips Section */}
      <div className={styles.tips}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <strong>Pro Tips:</strong>
          <ul>
            <li>First image becomes the main showcase image</li>
            <li>Recommended: 1200x800px or 16:9 aspect ratio</li>
            <li>Add captions to describe key features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;
