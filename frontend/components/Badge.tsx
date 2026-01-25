import { HTMLAttributes } from "react";
import styles from "../styles/Badge.module.css";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "sber" | "nsu" | "neutral";
}

export default function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")} {...props} />;
}
