import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            SberCollab
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/dashboard" className="transition hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/tasks" className="transition hover:text-slate-900">
              Tasks
            </Link>
            <Link href="/my-tasks" className="transition hover:text-slate-900">
              My Tasks
            </Link>
            <Link href="/login" className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300">
              Logout
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
