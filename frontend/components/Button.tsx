import { ButtonHTMLAttributes } from "react";
import styles from "../styles/Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      className={[
        styles.button,
        styles[variant],
        styles[size],
        loading ? styles.loading : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
