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
};

export default function CuratorProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Project[]>("/projects")
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RouteGuard roles={["curator"]}>
      <Layout>
        <div className={styles.header}>
          <h1 className={styles.title}>Проекты куратора</h1>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.list}>
          {projects.map((project) => (
            <Link key={project.id} href={`/curator/projects/${project.id}`}>
              <Card>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{project.title}</h2>
                  <span className={styles.status}>{project.status}</span>
                </div>
                <p className={styles.cardBody}>{project.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
