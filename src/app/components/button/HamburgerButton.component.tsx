import { useState } from "react";
import styles from "./HamburgerButton.module.css";

function HamburgerButton() {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      className={styles.hamburger}>
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </button>
  );
}

export default HamburgerButton;
