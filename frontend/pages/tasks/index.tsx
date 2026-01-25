import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { apiRequest } from "../../components/api";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  tags?: string;
  mentor_id?: number | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Task[]>(`/tasks?status_filter=${statusFilter}&query=${query}`)
      .then(setTasks)
      .catch((err) => setError(err.message));
  }, [statusFilter, query]);

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="section-title" style={{ fontSize: "26px" }}>Tasks</h1>
        <Link href="/tasks/new" className="btn btn-primary">
          Создать задачу
        </Link>
      </div>
      <div className="card" style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <input
          placeholder="Поиск по названию"
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {error && <p className="error" style={{ marginTop: "12px" }}>{error}</p>}
      <div className="grid" style={{ marginTop: "20px" }}>
        {tasks.map((task) => (
          <Link key={task.id} href={`/tasks/${task.id}`} className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600 }}>{task.title}</h2>
              <span className="badge">{task.status}</span>
            </div>
            <p className="subtitle" style={{ marginTop: "12px" }}>{task.description}</p>
            {task.tags && <p className="muted" style={{ marginTop: "8px", fontSize: "12px" }}>Tags: {task.tags}</p>}
          </Link>
        ))}
      </div>
    </Layout>
  );
}
