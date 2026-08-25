import styles from "./Button.module.css";

type ButtonVariant = "primary" | "outline";

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  grow?: number;
};

function Button({ label, variant = "primary", grow }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      style={grow !== undefined ? { flex: grow } : undefined}
    >
      {label}
    </button>
  );
}

export default Button;
