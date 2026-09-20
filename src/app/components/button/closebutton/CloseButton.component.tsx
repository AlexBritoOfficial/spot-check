import styles from "./CloseButton.module.css";

interface CloseButtonProps {
  onClick?: () => void;
  type?: "button" | "submit";
}

function CloseButton({ onClick, type = "button" }: CloseButtonProps) {
  return (
    <button type={type} className={styles.button} onClick={onClick}>
      ✕
    </button>
  );
}

export default CloseButton;
