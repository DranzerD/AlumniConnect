"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./RichTextEditor.module.css";

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing...",
  minHeight = 200,
  maxLength,
  showToolbar = true,
  className = "",
}) {
  const [content, setContent] = useState(value);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setContent(value);
  }, [value]);

  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, "");
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, [content]);

  const handleCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
  }, []);

  const handleInput = (e) => {
    const newContent = e.target.innerHTML;
    setContent(newContent);
    onChange?.(newContent);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      handleCommand("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      handleCommand("insertImage", url);
    }
  };

  const toolbarButtons = [
    { icon: "B", command: "bold", title: "Bold (Ctrl+B)" },
    { icon: "I", command: "italic", title: "Italic (Ctrl+I)" },
    { icon: "U", command: "underline", title: "Underline (Ctrl+U)" },
    { icon: "S", command: "strikeThrough", title: "Strikethrough" },
    { type: "divider" },
    { icon: "H1", command: "formatBlock", value: "h1", title: "Heading 1" },
    { icon: "H2", command: "formatBlock", value: "h2", title: "Heading 2" },
    { icon: "H3", command: "formatBlock", value: "h3", title: "Heading 3" },
    { type: "divider" },
    { icon: "•", command: "insertUnorderedList", title: "Bullet List" },
    { icon: "1.", command: "insertOrderedList", title: "Numbered List" },
    { type: "divider" },
    { icon: "❝", command: "formatBlock", value: "blockquote", title: "Quote" },
    { icon: "</>", command: "formatBlock", value: "pre", title: "Code Block" },
    { type: "divider" },
    { icon: "🔗", action: insertLink, title: "Insert Link" },
    { icon: "🖼", action: insertImage, title: "Insert Image" },
    { type: "divider" },
    { icon: "←", command: "justifyLeft", title: "Align Left" },
    { icon: "↔", command: "justifyCenter", title: "Align Center" },
    { icon: "→", command: "justifyRight", title: "Align Right" },
  ];

  return (
    <div
      className={`${styles.editor} ${isFullscreen ? styles.fullscreen : ""} ${className}`}
    >
      {showToolbar && (
        <div className={styles.toolbar}>
          {toolbarButtons.map((btn, index) =>
            btn.type === "divider" ? (
              <div key={index} className={styles.divider} />
            ) : (
              <button
                key={index}
                type="button"
                className={styles.toolbarBtn}
                title={btn.title}
                onClick={() =>
                  btn.action
                    ? btn.action()
                    : handleCommand(btn.command, btn.value)
                }
              >
                {btn.icon}
              </button>
            ),
          )}
          <div className={styles.spacer} />
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? "⤓" : "⤢"}
          </button>
        </div>
      )}

      <div
        className={styles.content}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className={styles.footer}>
        <span>
          {wordCount} words • {charCount} characters
        </span>
        {maxLength && (
          <span className={charCount > maxLength ? styles.exceeded : ""}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
