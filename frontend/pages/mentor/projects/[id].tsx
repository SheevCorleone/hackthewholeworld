import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/TaskDetail.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  goal?: string | null;
  key_tasks?: string | null;
  novelty?: string | null;
  skills_required?: string | null;
  course_alignment?: string | null;
  diploma_possible?: boolean | null;
  practice_possible?: boolean | null;
  course_project_possible?: boolean | null;
  nda_required?: boolean | null;
  status: string;
  tags?: string | null;
  is_archived?: boolean;
  curator_full_name?: string | null;
  mentor_full_name?: string | null;
  mentor_names?: string[] | null;
  deadline?: string | null;
};

export default function MentorProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<Project>(`/projects/${id}`)
      .then(setProject)
      .catch((err) => setError(err.message));
  }, [id]);

  const mentorLabel = project?.mentor_names?.length
    ? project.mentor_names.join(", ")
    : project?.mentor_full_name || "—";

  return (
    <RouteGuard roles={["mentor"]}>
      <Layout>
        {error && <p className={styles.error}>{error}</p>}
        {project && (
          <div className={styles.wrapper}>
            <div className={styles.detailGrid}>
              <Card className={styles.detailCard}>
                <div className={styles.header}>
                  <h1 className={styles.title}>{project.title}</h1>
                  <span className={styles.status}>{project.status}</span>
                </div>
                <div className={styles.meta}>
                  {project.is_archived && (
                    <span className={`${styles.metaPill} ${styles.badgeArchived}`}>Архив</span>
                  )}
                  {project.tags && <span className={styles.tagPill}>{project.tags}</span>}
                  {project.skills_required && <span className={styles.metaPill}>Навыки: {project.skills_required}</span>}
                  {project.course_alignment && (
                    <span className={styles.metaPill}>Программа: {project.course_alignment}</span>
                  )}
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Описание</h3>
                  <p className={styles.sectionBody}>{project.description}</p>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Цели</h3>
                  <p className={styles.sectionBody}>{project.goal || "—"}</p>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Задачи</h3>
                  <p className={styles.sectionBody}>{project.key_tasks || "—"}</p>
                </div>
                <div className={styles.meta}>
                  <span className={styles.metaPill}>
                    Диплом: {project.diploma_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>
                    Практика: {project.practice_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>
                    Курсовой: {project.course_project_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>
                    NDA: {project.nda_required ? "требуется" : "нет"}
                  </span>
                </div>
              </Card>
              <div className={styles.infoCard}>
                <p className={styles.infoTitle}>Куратор</p>
                <p className={styles.infoValue}>{project.curator_full_name || "—"}</p>
                <p className={styles.infoTitle}>Ментор(ы)</p>
                <p className={styles.infoValue}>{mentorLabel}</p>
                <p className={styles.infoTitle}>Дедлайн</p>
                <p className={styles.infoValue}>
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}
