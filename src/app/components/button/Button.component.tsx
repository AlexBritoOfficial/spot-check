"use client";

import styles from "./Button.module.css";

type ButtonVariant = "primary" | "outline" | "danger";

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  grow?: number;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
};

function Button({
  label,
  variant = "primary",
  grow,
  type,
  onClick,
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]} ${className ?? ""}`}
      style={grow !== undefined ? { flex: grow } : undefined}
    >
      {label}
    </button>
  );
}

export default Button;
