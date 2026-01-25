import { SelectHTMLAttributes } from "react";
import styles from "../styles/Input.module.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export default function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <select className={[styles.select, className].filter(Boolean).join(" ")} {...props}>
        {children}
      </select>
    </label>
  );
}
