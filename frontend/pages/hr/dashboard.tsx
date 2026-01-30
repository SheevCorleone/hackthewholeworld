import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { apiRequest } from "../../components/api";
import styles from "../../styles/Manager.module.css";

type HrStudent = {
  id: number;
  full_name: string;
  email: string;
  skills?: string | null;
  completed_projects: number;
  average_rating?: number | null;
};

export default function HrDashboardPage() {
  const [students, setStudents] = useState<HrStudent[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<HrStudent[]>("/hr/dashboard")
      .then(setStudents)
      .catch((err) => setError(err.message));
  }, []);

  const filtered = students.filter((student) => {
    const haystack = `${student.full_name} ${student.email} ${student.skills || ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <RouteGuard roles={["hr", "manager", "admin"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>HR dashboard</h1>
          <p>Талант-пайплайн по завершённым проектам.</p>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <Card>
          <Input
            label="Поиск"
            name="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Имя, email, навыки"
          />
        </Card>
        <Card>
          {filtered.length === 0 && <p>Студенты не найдены.</p>}
          {filtered.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Студент</th>
                  <th>Навыки</th>
                  <th>Завершено</th>
                  <th>Средний рейтинг</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.full_name}</strong>
                      <div>{student.email}</div>
                    </td>
                    <td>{student.skills || "—"}</td>
                    <td>{student.completed_projects}</td>
                    <td>{student.average_rating ? student.average_rating.toFixed(1) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </Layout>
    </RouteGuard>
  );
}
