import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import { apiRequest } from "../../components/api";
import ButtonLink from "../../components/ButtonLink";
import styles from "../../styles/Tasks.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  goal?: string | null;
  status: string;
  is_archived?: boolean;
  tags?: string | null;
  curator_full_name?: string | null;
  mentor_full_name?: string | null;
  mentor_names?: string[] | null;
};

export default function MentorProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiRequest<Project[]>("/projects")
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const mentorLabel = (project: Project) =>
    project.mentor_names?.length ? project.mentor_names.join(", ") : project.mentor_full_name || "—";

  return (
    <RouteGuard roles={["mentor"]}>
      <Layout>
        <div className={styles.header}>
          <h1 className={styles.title}>Назначенные проекты</h1>
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
                  <Link href={`/mentor/projects/${project.id}`} className={styles.cardLink}>
                    <h2 className={styles.cardTitle}>{project.title}</h2>
                  </Link>
                  <span className={styles.status}>{project.status}</span>
                </div>
                <p className={styles.cardBody}>{project.description}</p>
                <div className={styles.cardMetaRow}>
                  {project.goal && <span className={styles.tagPill}>Цель: {project.goal}</span>}
                  {project.tags && <span className={styles.tagPill}>{project.tags}</span>}
                  {project.is_archived && <span className={styles.mutedPill}>Архив</span>}
                </div>
                <div className={styles.cardMetaRow}>
                  <span className={styles.mutedPill}>Куратор: {project.curator_full_name || "—"}</span>
                  <span className={styles.mutedPill}>Ментор: {mentorLabel(project)}</span>
                </div>
                <div className={styles.cardActions}>
                  <ButtonLink href={`/mentor/projects/${project.id}`} size="sm">
                    Открыть
                  </ButtonLink>
                </div>
              </Card>
            ))}
        </div>
        {!loading && projects.length === 0 && (
          <div className={styles.emptyState}>Проектов пока нет.</div>
        )}
      </Layout>
    </RouteGuard>
  );
}
