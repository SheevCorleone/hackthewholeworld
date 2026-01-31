import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import { apiRequest } from "../../components/api";
import styles from "../../styles/Tasks.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  is_archived?: boolean;
};

export default function MentorProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Project[]>("/projects")
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RouteGuard roles={["mentor"]}>
      <Layout>
        <div className={styles.header}>
          <h1 className={styles.title}>Назначенные проекты</h1>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.list}>
          {projects.map((project) => (
            <Card key={project.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{project.title}</h2>
                <span className={styles.status}>{project.status}</span>
              </div>
              <p className={styles.cardBody}>{project.description}</p>
              {project.is_archived && <span className={styles.cardMeta}>Архив</span>}
            </Card>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
