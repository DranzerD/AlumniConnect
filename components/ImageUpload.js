"use client";

import { useState, useRef } from "react";
import styles from "./ImageUpload.module.css";

export default function ImageUpload({
  value,
  onChange,
  maxSize = 5, // MB
  accept = "image/*",
  aspectRatio,
  placeholder = "Click or drag to upload",
  className = "",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(value);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onChange?.(file, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null, null);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${
          preview ? styles.hasPreview : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={aspectRatio ? { aspectRatio } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={styles.input}
        />

        {preview ? (
          <div className={styles.previewWrapper}>
            <img src={preview} alt="Preview" className={styles.preview} />
            <div className={styles.previewOverlay}>
              <button
                type="button"
                className={styles.changeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Change
              </button>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className={styles.placeholderText}>{placeholder}</span>
            <span className={styles.placeholderHint}>
              Max size: {maxSize}MB
            </span>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

// Avatar variant
export function AvatarUpload({ value, onChange, size = 120, name = "" }) {
  const [preview, setPreview] = useState(value);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        onChange?.(file, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={styles.avatarContainer}
      style={{ width: size, height: size }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.input}
      />

      <div className={styles.avatar} onClick={() => inputRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="Avatar" />
        ) : (
          <span className={styles.avatarInitials}>{initials || "?"}</span>
        )}

        <div className={styles.avatarOverlay}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
