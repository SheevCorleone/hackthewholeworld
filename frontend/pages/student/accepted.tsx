import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import { apiRequest } from "../../components/api";
import styles from "../../styles/MyTasks.module.css";

type Assignment = {
  id: number;
  task_id: number;
  task_title?: string | null;
  state: string;
};

export default function StudentAcceptedPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Assignment[]>("/assignments/me")
      .then(setAssignments)
      .catch((err) => setError(err.message));
  }, []);

  const statusLabel = (state?: string | null) => {
    if (!state) return null;
    if (state === "requested") return "pending";
    if (state === "active" || state === "done") return "approved";
    if (state === "canceled") return "rejected";
    return state;
  };

  const accepted = assignments.filter((item) => item.state === "active" || item.state === "done");

  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        <h1 className={styles.title}>Мои заявки</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.list}>
          {assignments.length === 0 && <p>Заявок пока нет.</p>}
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <div className={styles.row}>
                <strong>
                  <Link href={`/student/projects/${assignment.task_id}`} className={styles.projectLink}>
                    {assignment.task_title || `Проект #${assignment.task_id}`}
                  </Link>
                </strong>
                <span className={styles.state}>{statusLabel(assignment.state)}</span>
              </div>
            </Card>
          ))}
        </div>
        <h2 className={styles.title} style={{ marginTop: "24px" }}>
          Принятые проекты
        </h2>
        <div className={styles.list}>
          {accepted.length === 0 && <p>Принятых проектов пока нет.</p>}
          {accepted.map((assignment) => (
            <Card key={assignment.id}>
              <div className={styles.row}>
                <strong>
                  <Link href={`/student/projects/${assignment.task_id}`} className={styles.projectLink}>
                    {assignment.task_title || `Проект #${assignment.task_id}`}
                  </Link>
                </strong>
                <span className={styles.state}>{statusLabel(assignment.state)}</span>
              </div>
            </Card>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
