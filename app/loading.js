import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        {/* Main spinner */}
        <div className={styles.spinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerCore}></div>
        </div>

        {/* Loading text with animated dots */}
        <div className={styles.loadingText}>
          <span>Loading</span>
          <span className={styles.dots}>
            <span className={styles.dot}>.</span>
            <span className={styles.dot}>.</span>
            <span className={styles.dot}>.</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>

        {/* Fun loading messages */}
        <div className={styles.loadingMessage}>
          Connecting you with your alumni network
        </div>
      </div>

      {/* Background decorations */}
      <div className={styles.bgDecoration}>
        <div
          className={styles.floatingCircle}
          style={{ "--delay": "0s" }}
        ></div>
        <div
          className={styles.floatingCircle}
          style={{ "--delay": "0.5s" }}
        ></div>
        <div
          className={styles.floatingCircle}
          style={{ "--delay": "1s" }}
        ></div>
        <div
          className={styles.floatingCircle}
          style={{ "--delay": "1.5s" }}
        ></div>
      </div>
    </div>
  );
}
