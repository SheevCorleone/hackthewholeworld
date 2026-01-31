import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import { apiRequest } from "../../../components/api";
import ButtonLink from "../../../components/ButtonLink";
import styles from "../../../styles/Manager.module.css";

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

export default function ManagerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiRequest<Project[]>("/manager/projects")
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const mentorLabel = (project: Project) =>
    project.mentor_names?.length ? project.mentor_names.join(", ") : project.mentor_full_name || "—";

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        <div className={styles.toolbar}>
          <div>
            <h1 className={styles.sectionTitle}>Проекты</h1>
            <p>Создание и управление проектами.</p>
          </div>
          <Link href="/manager/projects/new">
            <Button>Создать проект</Button>
          </Link>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.grid}>
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={`skeleton-${index}`}>
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
              <Card key={project.id}>
                <div className={styles.projectCard}>
                  <div className={styles.pillRow}>
                    <span className={styles.pill}>{project.status}</span>
                    {project.is_archived && <span className={styles.pill}>архив</span>}
                  </div>
                  <Link href={`/manager/projects/${project.id}`}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                  </Link>
                  <p className={styles.projectDescription}>{project.description}</p>
                  <div className={styles.pillRow}>
                    {project.goal && <span className={styles.pill}>Цель: {project.goal}</span>}
                    {project.tags && <span className={styles.pill}>{project.tags}</span>}
                  </div>
                  <div className={styles.pillRow}>
                    <span className={styles.pill}>Куратор: {project.curator_full_name || "—"}</span>
                    <span className={styles.pill}>Ментор: {mentorLabel(project)}</span>
                  </div>
                  <div className={styles.actionRow}>
                    <ButtonLink href={`/manager/projects/${project.id}`} size="sm">
                      Открыть
                    </ButtonLink>
                  </div>
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
