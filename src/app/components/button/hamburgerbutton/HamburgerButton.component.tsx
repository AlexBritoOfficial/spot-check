import styles from "./HamburgerButton.module.css";

interface HamburgerButtonProps {
  onClick?: () => void;
}

function HamburgerButton({ onClick }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      className={styles.hamburger}
      aria-label="Open menu"
      onClick={onClick}
    >
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </button>
  );
}

export default HamburgerButton;
