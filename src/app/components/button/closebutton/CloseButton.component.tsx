import styles from "./CloseButton.module.css";

interface CloseButtonProps {
  onClick?: () => void;
}

function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button className={styles.button} onClick={onClick}>
      ✕
    </button>
  );
}

export default CloseButton;
