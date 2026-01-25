import { HTMLAttributes } from "react";
import styles from "../styles/Card.module.css";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.card, className].filter(Boolean).join(" ")} {...props} />;
}
