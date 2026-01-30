import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { apiRequest } from "../../components/api";
import styles from "../../styles/Manager.module.css";

type Student = {
  id: number;
  full_name: string;
  email: string;
  faculty?: string | null;
  skills?: string | null;
  course?: string | null;
  status?: string | null;
  stats: {
    applications_total: number;
    applications_approved: number;
    applications_rejected: number;
    projects_completed: number;
    reviews_count: number;
    average_rating?: number | null;
  };
};

export default function ManagerStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pending, setPending] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Student[]>("/manager/students")
      .then(setStudents)
      .catch((err) => setError(err.message));
    apiRequest<Student[]>("/manager/students/pending")
      .then(setPending)
      .catch(() => null);
  }, []);

  const decidePending = async (studentId: number, action: "approve" | "reject") => {
    try {
      await apiRequest(`/manager/students/${studentId}/${action}`, { method: "POST" });
      const updated = await apiRequest<Student[]>("/manager/students/pending");
      setPending(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Студенты</h1>
          <p>Профили и минимальная статистика по заявкам.</p>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {pending.length > 0 && (
          <Card>
            <h3 className={styles.sectionTitle}>Ожидают подтверждения</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Студент</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.full_name}</strong>
                      <div>{student.email}</div>
                    </td>
                    <td>
                      <div className={styles.toolbar}>
                        <Button size="sm" onClick={() => decidePending(student.id, "approve")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => decidePending(student.id, "reject")}>
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        <div className={styles.grid}>
          {students.map((student) => (
            <Card key={student.id}>
              <h3>{student.full_name}</h3>
              <p>{student.email}</p>
              <p>Факультет: {student.faculty || "—"}</p>
              <p>Навыки: {student.skills || "—"}</p>
              <p>Курс: {student.course || "—"}</p>
              <p>Статус: {student.status || "—"}</p>
              <div className={styles.stack}>
                <span className={styles.pill}>Заявок: {student.stats.applications_total}</span>
                <span className={styles.pill}>Принято: {student.stats.applications_approved}</span>
                <span className={styles.pill}>Отклонено: {student.stats.applications_rejected}</span>
                <span className={styles.pill}>Завершено: {student.stats.projects_completed}</span>
              </div>
            </Card>
          ))}
        </div>
      </Layout>
    </RouteGuard>
  );
}
