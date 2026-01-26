import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import { apiRequest } from "../../components/api";
import styles from "../../styles/MyTasks.module.css";

type Assignment = {
  id: number;
  task_id: number;
  state: string;
};

export default function StudentAcceptedPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Assignment[]>("/assignments/me")
      .then((data) => setAssignments(data.filter((item) => item.state === "active" || item.state === "done")))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RouteGuard roles={["student"]}>
      <Layout>
        <h1 className={styles.title}>Принятые проекты</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.list}>
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <div className={styles.row}>
                <strong>Проект #{assignment.task_id}</strong>
                <span className={styles.state}>{assignment.state}</span>
              </div>
            </Card>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
