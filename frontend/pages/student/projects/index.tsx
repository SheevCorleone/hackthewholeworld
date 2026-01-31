import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import { apiRequest } from "../../../components/api";
import Button from "../../../components/Button";
import ButtonLink from "../../../components/ButtonLink";
import styles from "../../../styles/Tasks.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  goal?: string | null;
  status: string;
  tags?: string | null;
  is_archived?: boolean;
  curator_full_name?: string | null;
  mentor_full_name?: string | null;
  mentor_names?: string[] | null;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    apiRequest<Project[]>(`/projects?skip=${page * 12}&limit=12&search=${encodeURIComponent(debouncedQuery)}`)
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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

  const mentorLabel = (project: Project) =>
    project.mentor_names?.length ? project.mentor_names.join(", ") : project.mentor_full_name || "—";

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
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className={styles.card}>
                <div className={styles.skeletonCard}>
                  <div className={`skeleton ${styles.skeletonTitle}`} />
                  <div className={`skeleton ${styles.skeletonLine}`} />
                  <div className={`skeleton ${styles.skeletonLineShort}`} />
                  <div className={`skeleton ${styles.skeletonLineShort}`} />
                </div>
              </Card>
            ))}
          {!loading &&
            projects.map((project) => (
              <Card key={project.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <Link href={`/student/projects/${project.id}`} className={styles.cardLink}>
                    <h2 className={styles.cardTitle}>{project.title}</h2>
                  </Link>
                  <span className={styles.status}>{project.status}</span>
                </div>
                <p className={styles.cardBody}>{project.description}</p>
                <div className={styles.cardMetaRow}>
                  <span className={styles.mutedPill}>
                    Статус заявки: {statusLabel(assignments[project.id]?.state) || "нет"}
                  </span>
                  {project.goal && <span className={styles.tagPill}>Цель: {project.goal}</span>}
                  {project.tags && <span className={styles.tagPill}>{project.tags}</span>}
                  {project.is_archived && <span className={styles.mutedPill}>Архив</span>}
                </div>
                <div className={styles.cardMetaRow}>
                  <span className={styles.mutedPill}>Куратор: {project.curator_full_name || "—"}</span>
                  <span className={styles.mutedPill}>Ментор: {mentorLabel(project)}</span>
                </div>
                <div className={styles.cardActions}>
                  <ButtonLink href={`/student/projects/${project.id}`} size="sm">
                    Подробнее
                  </ButtonLink>
                </div>
              </Card>
            ))}
        </div>
        {!loading && projects.length === 0 && (
          <div className={styles.emptyState}>
            {debouncedQuery ? "Нет результатов поиска." : "Нет доступных проектов."}
          </div>
        )}
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
