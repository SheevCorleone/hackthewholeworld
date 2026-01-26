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
  status: string;
  tags?: string | null;
};

export default function CuratorProjectDetailPage() {
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

  return (
    <RouteGuard roles={["curator"]}>
      <Layout>
        {error && <p className={styles.error}>{error}</p>}
        {project && (
          <Card>
            <div className={styles.header}>
              <h1 className={styles.title}>{project.title}</h1>
              <span className={styles.status}>{project.status}</span>
            </div>
            <p className={styles.description}>{project.description}</p>
            {project.tags && <p className={styles.metaPill}>Tags: {project.tags}</p>}
            <p className={styles.description}>Рецензия о проделанной работе добавляется в этом разделе.</p>
          </Card>
        )}
      </Layout>
    </RouteGuard>
  );
}
