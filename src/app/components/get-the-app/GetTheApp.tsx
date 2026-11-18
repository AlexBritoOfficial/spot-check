import { Apple, PlayCircle } from "lucide-react";
import styles from "./GetTheApp.module.css";

// The web app is desktop/tablet-only — phone visitors get this instead
// (see useIsPhone). Directions/search/add-spot etc. are mobile-app features.
function GetTheApp() {
  return (
    <div className={styles.root}>
      <div className={styles.title}>
        <span className={styles.white}>SPOT</span>
        <span className={styles.gold}>CHECK</span>
      </div>
      <p className={styles.message}>
        Spot Check is built for the mobile app. Download it to find and add
        skate spots on the go.
      </p>
      <div className={styles.badgeRow}>
        <a href="#" className={styles.badge} aria-label="Download on the App Store">
          <Apple className={styles.badgeIcon} />
          <span className={styles.badgeText}>
            <span className={styles.badgeSmall}>Download on the</span>
            <span className={styles.badgeBig}>App Store</span>
          </span>
        </a>
        <a href="#" className={styles.badge} aria-label="Get it on Google Play">
          <PlayCircle className={styles.badgeIcon} />
          <span className={styles.badgeText}>
            <span className={styles.badgeSmall}>Get it on</span>
            <span className={styles.badgeBig}>Google Play</span>
          </span>
        </a>
      </div>
    </div>
  );
}

export default GetTheApp;
