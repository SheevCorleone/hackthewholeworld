import { HTMLAttributes } from "react";
import styles from "../styles/ErrorText.module.css";

export default function ErrorText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={[styles.error, className].filter(Boolean).join(" ")} {...props} />;
}
