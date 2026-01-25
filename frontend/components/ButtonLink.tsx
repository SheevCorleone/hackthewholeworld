import Link from "next/link";
import { ReactNode } from "react";
import styles from "../styles/Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={[styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ")}
    >
      <span className={styles.label}>{children}</span>
    </Link>
  );
}
