import Link from "next/link";
import { ReactNode } from "react";
import Button from "./Button";
import styles from "../styles/Layout.module.css";
import { useAuth } from "./auth";

const navByRole: Record<string, { label: string; href: string }[]> = {
  manager: [
    { label: "Дашборд", href: "/manager" },
    { label: "Проекты", href: "/manager/projects" },
    { label: "Студенты", href: "/manager/students" },
    { label: "Менторы", href: "/manager/mentors" },
    { label: "Кураторы", href: "/manager/curators/new" },
    { label: "Рецензии", href: "/manager/reviews" },
    { label: "HR дашборд", href: "/hr/dashboard" }
  ],
  curator: [
    { label: "Проекты", href: "/curator/projects" }
  ],
  student: [
    { label: "Проекты", href: "/student/projects" },
    { label: "Принятые", href: "/student/accepted" },
    { label: "Рецензии", href: "/student/reviews" },
    { label: "Портфолио", href: "/student/portfolio" }
  ],
  mentor: [
    { label: "Проекты", href: "/mentor/projects" },
    { label: "Рецензии", href: "/mentor/reviews" }
  ],
  univ_teacher: [{ label: "Согласования", href: "/univ/approvals" }],
  univ_supervisor: [{ label: "Согласования", href: "/univ/approvals" }],
  univ_admin: [{ label: "Согласования", href: "/univ/approvals" }],
  hr: [{ label: "HR дашборд", href: "/hr/dashboard" }],
  academic_partnership_admin: [{ label: "Проекты", href: "/manager/projects" }],
  admin: [
    { label: "Дашборд", href: "/manager" },
    { label: "Проекты", href: "/manager/projects" },
    { label: "Студенты", href: "/manager/students" }
  ]
};

export default function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navLinks = user ? navByRole[user.role] || [] : [];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            SberCollab
          </Link>
          <nav className={styles.nav}>
            {isAuthenticated &&
              navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              ))}
            {!isAuthenticated && (
              <>
                <Link href="/login" className={styles.navLink}>
                  LOGIN
                </Link>
                <Link href="/register" className={styles.navLink}>
                  REGISTER
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Button variant="secondary" size="sm" onClick={logout}>
                LOGOUT
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className={`${styles.container} page-enter`}>{children}</main>
    </div>
  );
}
