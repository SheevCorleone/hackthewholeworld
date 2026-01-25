import { InputHTMLAttributes } from "react";
import styles from "../styles/Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export default function Input({ label, helperText, className, ...props }: InputProps) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <input className={[styles.input, className].filter(Boolean).join(" ")} {...props} />
      {helperText && <span className={styles.helper}>{helperText}</span>}
    </label>
  );
}
