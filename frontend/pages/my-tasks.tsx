import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";

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
      <h1 className="section-title" style={{ fontSize: "26px" }}>Мои задачи</h1>
      {error && <p className="error" style={{ marginTop: "12px" }}>{error}</p>}
      <div className="grid" style={{ marginTop: "20px", gap: "12px" }}>
        {assignments.map((assignment) => (
          <div key={assignment.id} className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontWeight: 600 }}>Task #{assignment.task_id}</p>
              <span className="badge">{assignment.state}</span>
            </div>
            <p className="muted" style={{ marginTop: "8px", fontSize: "12px" }}>
              Дедлайн и метрики доступны на странице задачи.
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
