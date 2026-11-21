import styles from "./SplashScreen.module.css";

function SplashScreen() {
  return (
    <div className={styles.root}>
      <div className={styles.title}>
        <span className={styles.white}>SPOT</span>
        <span className={styles.gold}>CHECK</span>
      </div>
      <p className={styles.tagline}>Find your next spot</p>
      <div className={styles.loader} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}

export default SplashScreen;
