import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/Manager.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  tags?: string;
};

export default function ManagerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Project[]>("/manager/projects")
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, []);

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
          {projects.map((project) => (
            <Link key={project.id} href={`/manager/projects/${project.id}`}>
              <Card>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <span className={styles.pill}>{project.status}</span>
              </Card>
            </Link>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
