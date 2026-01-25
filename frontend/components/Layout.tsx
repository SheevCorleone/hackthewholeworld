import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">
            SberCollab
          </Link>
          <nav className="nav">
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link href="/tasks" className="nav-link">
              Tasks
            </Link>
            <Link href="/my-tasks" className="nav-link">
              My Tasks
            </Link>
            <Link href="/profile" className="nav-link">
              Profile
            </Link>
            <Link href="/admin" className="nav-link">
              Admin
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Logout
            </Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
