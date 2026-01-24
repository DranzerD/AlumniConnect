"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./FileUpload.module.css";

export default function FileUpload({
  accept = "*",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  onUpload,
  onError,
  disabled = false,
  className = "",
}) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState({});
  const inputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }

    if (accept !== "*") {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileType = file.type;
      const fileExt = "." + file.name.split(".").pop().toLowerCase();

      const isValid = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExt === type.toLowerCase();
        }
        if (type.endsWith("/*")) {
          return fileType.startsWith(type.replace("/*", "/"));
        }
        return fileType === type;
      });

      if (!isValid) {
        return "File type not allowed";
      }
    }

    return null;
  };

  const handleFiles = (newFiles) => {
    const fileList = Array.from(newFiles);

    if (files.length + fileList.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = [];
    const errors = [];

    fileList.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push({ file: file.name, error });
      } else {
        validFiles.push({
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
        });
      }
    });

    if (errors.length > 0) {
      onError?.(errors);
    }

    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      onUpload?.(updatedFiles.map((f) => f.file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    onUpload?.(updatedFiles.map((f) => f.file));
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${
          disabled ? styles.disabled : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className={styles.input}
        />

        <div className={styles.content}>
          <div className={styles.icon}>📁</div>
          <p className={styles.text}>
            <span className={styles.highlight}>Click to upload</span> or drag
            and drop
          </p>
          <p className={styles.hint}>
            {accept !== "*" && `Accepted: ${accept}`}
            {accept !== "*" && " • "}
            Max size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file) => (
            <li key={file.id} className={styles.fileItem}>
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className={styles.preview}
                />
              ) : (
                <div className={styles.fileIcon}>📄</div>
              )}

              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {formatFileSize(file.size)}
                </span>
              </div>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeFile(file.id)}
                aria-label="Remove file"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
