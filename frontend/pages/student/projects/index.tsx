import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/Tasks.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  tags?: string | null;
};

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Project[]>("/projects")
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        <div className={styles.header}>
          <h1 className={styles.title}>Доступные проекты</h1>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.list}>
          {projects.map((project) => (
            <Link key={project.id} href={`/student/projects/${project.id}`}>
              <Card>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{project.title}</h2>
                  <span className={styles.status}>{project.status}</span>
                </div>
                <p className={styles.cardBody}>{project.description}</p>
                {project.tags && <p className={styles.cardMeta}>Tags: {project.tags}</p>}
              </Card>
            </Link>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
