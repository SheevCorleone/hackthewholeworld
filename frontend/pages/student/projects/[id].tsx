import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/TaskDetail.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  tags?: string | null;
};

export default function StudentProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<Project>(`/projects/${id}`)
      .then(setProject)
      .catch((err) => setError(err.message));
  }, [id]);

  const apply = async () => {
    if (!id) return;
    setMessage(null);
    try {
      await apiRequest(`/projects/${id}/applications`, { method: "POST" });
      setMessage("Заявка отправлена. Ожидайте решения менеджера.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        {error && <p className={styles.error}>{error}</p>}
        {project && (
          <div className={styles.wrapper}>
            <Card>
              <div className={styles.header}>
                <h1 className={styles.title}>{project.title}</h1>
                <span className={styles.status}>{project.status}</span>
              </div>
              <p className={styles.description}>{project.description}</p>
              {project.tags && <p className={styles.metaPill}>Tags: {project.tags}</p>}
              <Button onClick={apply}>Подать заявку</Button>
              {message && <p>{message}</p>}
            </Card>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}
