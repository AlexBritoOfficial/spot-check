import styles from "./Button.module.css";

type ButtonVariant = "primary" | "outline";

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  grow?: number;
  type?: "button" | "submit";
  onClick?: () => void;
};

function Button({ label, variant = "primary", grow, type, onClick }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]}`}
      style={grow !== undefined ? { flex: grow } : undefined}
    >
      {label}
    </button>
  );
}

export default Button;
