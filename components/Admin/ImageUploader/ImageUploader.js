import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useTheme } from "../../../context/ThemeContext";
import axios from "axios";
import toast from "react-hot-toast";

import commonStyles from "./ImageUploader.module.css";
import lightStyles from "./ImageUploader.light.module.css";
import darkStyles from "./ImageUploader.dark.module.css";
import Modal from "../Modal/Modal";
import MediaLibrary from "../MediaLibrary/MediaLibrary";

export default function ImageUploader({
  onUpload,
  initialImageUrl = "",
  onImageUsageChange,
  useImage: initialUseImage = true,
  onAltTextChange,
}) {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(initialImageUrl);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("file"); // 'file' or 'url'
  const [imageUrl, setImageUrl] = useState("");
  const [useImage, setUseImage] = useState(initialUseImage);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    setPreview(initialImageUrl);
    setUseImage(initialUseImage);
  }, [initialImageUrl, initialUseImage]);

  const handleUpload = useCallback(
    async (file) => {
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name);

      setUploading(true);
      setError(null);

      try {
        const { data } = await toast.promise(
          axios.post("/api/media", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          }),
          {
            loading: "Uploading...",
            success: "Image uploaded successfully!",
            error: "Upload failed.",
          },
        );
        setPreview(data.asset.url);
        onUpload(data.asset.url);
        setAltText(data.asset.altText || ""); // Set alt text from media library
        if (onAltTextChange) onAltTextChange(data.asset.altText || "");
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred.");
      } finally {
        setUploading(false);
      }
    },
    [onUpload, onAltTextChange],
  );

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
    setAltText(""); // Reset alt text when URL changes
    if (onAltTextChange) onAltTextChange("");
  };

  const handleToggleImageUsage = (e) => {
    const checked = e.target.checked;
    setUseImage(checked);
    if (onImageUsageChange) {
      onImageUsageChange(checked);
    }
  };

  const handleRemoveImage = () => {
    setPreview("");
    onUpload("");
    setImageUrl("");
    setAltText("");
    if (onAltTextChange) onAltTextChange("");
  };

  const handleSelectFromLibrary = (asset) => {
    setPreview(asset.url);
    onUpload(asset.url);
    setAltText(asset.altText || "");
    if (onAltTextChange) onAltTextChange(asset.altText || "");
    setIsLibraryOpen(false);
  };

  // Removed AI alt text generation handler

  const uploaderBoxClasses = `
    ${commonStyles.uploaderBox} 
    ${themeStyles.uploaderBox} 
    ${isDragOver ? themeStyles.dragOver : ""}
  `;

  return (
    <div className={`${commonStyles.container} ${themeStyles.container}`}>
      <div className={commonStyles.toggleContainer}>
        <label className={commonStyles.toggleLabel}>
          <input
            type="checkbox"
            checked={useImage}
            onChange={handleToggleImageUsage}
            className={commonStyles.toggleCheckbox}
          />
          Use Image
        </label>
      </div>

      {useImage && (
        <>
          <Modal
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            title="Select from Media Library"
          >
            <MediaLibrary onSelect={handleSelectFromLibrary} isModal={true} />
          </Modal>

          <div className={commonStyles.methodSelector}>
            <button
              onClick={() => setUploadMethod("file")}
              className={`${commonStyles.methodButton} ${uploadMethod === "file" ? commonStyles.activeMethod : ""}`}
            >
              Upload File
            </button>
            <button
              onClick={() => setUploadMethod("url")}
              className={`${commonStyles.methodButton} ${uploadMethod === "url" ? commonStyles.activeMethod : ""}`}
            >
              From URL
            </button>
            <button
              onClick={() => setIsLibraryOpen(true)}
              className={`${commonStyles.methodButton}`}
            >
              From Media Library
            </button>
          </div>

          {uploadMethod === "file" ? (
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
              <button
                onClick={handleUrlSubmit}
                className={`${commonStyles.urlSubmitButton} ${themeStyles.urlSubmitButton}`}
              >
                Set Image
              </button>
            </div>
          )}

          {/* Inline error text removed in favor of toast notifications for a consistent premium UI */}

          {preview && (
            <div className={commonStyles.previewContainer}>
              <div className={commonStyles.previewBox}>
                <Image
                  src={preview}
                  alt="Preview"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className={commonStyles.altTextContainer}>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => {
                    setAltText(e.target.value);
                    if (onAltTextChange) onAltTextChange(e.target.value);
                  }}
                  placeholder="Enter alt text..."
                  className={`${commonStyles.altTextInput} ${themeStyles.urlInput}`}
                />
              </div>
              <button
                onClick={handleRemoveImage}
                className={`${commonStyles.removeButton} ${themeStyles.removeButton}`}
              >
                Remove
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
