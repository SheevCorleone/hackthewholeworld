import Link from "next/link";
import { ReactNode } from "react";
import ButtonLink from "./ButtonLink";
import styles from "../styles/Layout.module.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            SberCollab
          </Link>
          <nav className={styles.nav}>
            <Link href="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <Link href="/tasks" className={styles.navLink}>
              Tasks
            </Link>
            <Link href="/my-tasks" className={styles.navLink}>
              My Tasks
            </Link>
            <Link href="/profile" className={styles.navLink}>
              Profile
            </Link>
            <Link href="/admin" className={styles.navLink}>
              Admin
            </Link>
            <ButtonLink href="/login" variant="ghost" size="sm">Logout</ButtonLink>
          </nav>
        </div>
      </header>
      <main className={styles.container}>{children}</main>
    </div>
  );
}
