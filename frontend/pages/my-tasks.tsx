import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";
import Card from "../components/Card";
import styles from "../styles/MyTasks.module.css";

interface Assignment {
  id: number;
  task_id: number;
  state: string;
}

export default function MyTasksPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Assignment[]>("/assignments/me")
      .then(setAssignments)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Layout>
      <h1 className={styles.title}>Мои задачи</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.list}>
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <div className={styles.row}>
              <p>Task #{assignment.task_id}</p>
              <span className={styles.state}>{assignment.state}</span>
            </div>
            <p className={styles.meta}>Дедлайн и метрики доступны на странице задачи.</p>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
