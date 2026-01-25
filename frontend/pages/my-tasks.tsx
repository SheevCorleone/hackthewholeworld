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
      <h1 className="text-2xl font-semibold">Мои задачи</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-6 space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Task #{assignment.task_id}</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase">{assignment.state}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Дедлайн и метрики доступны на странице задачи.</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
