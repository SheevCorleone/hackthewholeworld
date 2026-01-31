import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import { apiRequest } from "../../../components/api";
import Button from "../../../components/Button";
import styles from "../../../styles/Tasks.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  tags?: string | null;
};

type Assignment = {
  id: number;
  task_id: number;
  state: string;
};

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Record<number, Assignment>>({});
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    apiRequest<Project[]>(`/projects?skip=${page * 12}&limit=12&search=${encodeURIComponent(debouncedQuery)}`)
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, [page, debouncedQuery]);

  useEffect(() => {
    apiRequest<Assignment[]>("/assignments/me")
      .then((data) => {
        const mapped = data.reduce<Record<number, Assignment>>((acc, item) => {
          acc[item.task_id] = item;
          return acc;
        }, {});
        setAssignments(mapped);
      })
      .catch(() => null);
  }, []);

  const statusLabel = (state?: string | null) => {
    if (!state) return null;
    if (state === "requested") return "pending";
    if (state === "active" || state === "done") return "approved";
    if (state === "canceled") return "rejected";
    return state;
  };

  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        <div className={styles.header}>
          <h1 className={styles.title}>Доступные проекты</h1>
        </div>
        <div className={styles.filters}>
          <input
            className={styles.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по названию"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.list}>
          {projects.map((project) => (
            <Link key={project.id} href={`/student/projects/${project.id}`}>
              <Card className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{project.title}</h2>
                  <span className={styles.status}>{project.status}</span>
                </div>
                <p className={styles.cardBody}>{project.description}</p>
                <p className={styles.cardMeta}>
                  Статус заявки: {statusLabel(assignments[project.id]?.state) || "нет"}
                </p>
                {project.tags && <p className={styles.cardMeta}>Tags: {project.tags}</p>}
              </Card>
            </Link>
          ))}
        </div>
        <div className={styles.pagination}>
          <Button size="sm" variant="ghost" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
            Назад
          </Button>
          <span>Страница {page + 1}</span>
          <Button size="sm" variant="ghost" onClick={() => setPage((prev) => prev + 1)} disabled={projects.length < 12}>
            Вперёд
          </Button>
        </div>
      </Layout>
    </RouteGuard>
  );
}
