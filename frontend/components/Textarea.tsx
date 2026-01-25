import { TextareaHTMLAttributes } from "react";
import styles from "../styles/Input.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export default function Textarea({ label, helperText, className, ...props }: TextareaProps) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea className={[styles.textarea, className].filter(Boolean).join(" ")} {...props} />
      {helperText && <span className={styles.helper}>{helperText}</span>}
    </label>
  );
}
