import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/Manager.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  mentor_id?: number | null;
  tags?: string | null;
  deadline?: string | null;
};

type Mentor = {
  id: number;
  full_name: string;
  email: string;
};

type Application = {
  id: number;
  student_id: number;
  state: string;
  decision_reason?: string | null;
  student: {
    full_name: string;
    email: string;
    faculty?: string | null;
    skills?: string | null;
    course?: string | null;
    created_at: string;
    last_active_at?: string | null;
  };
  stats?: {
    applications_total: number;
    applications_approved: number;
    applications_rejected: number;
    projects_completed: number;
    reviews_count: number;
    average_rating?: number | null;
  };
};

export default function ManagerProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadProject = async () => {
    if (!id) return;
    try {
      const data = await apiRequest<Project>(`/manager/projects/${id}`);
      setProject(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const loadApplications = async () => {
    if (!id) return;
    try {
      const data = await apiRequest<Application[]>(`/manager/projects/${id}/applications`);
      setApplications(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadProject();
    loadApplications();
    apiRequest<Mentor[]>("/manager/mentors").then(setMentors).catch(() => null);
  }, [id]);

  const handleAssignMentor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    const form = new FormData(event.currentTarget);
    try {
      const updated = await apiRequest<Project>(`/manager/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          mentor_id: form.get("mentor_id") ? Number(form.get("mentor_id")) : null
        })
      });
      setProject(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const decide = async (applicationId: number, action: "approve" | "reject") => {
    try {
      await apiRequest(`/manager/applications/${applicationId}/${action}`, {
        method: "POST"
      });
      loadApplications();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        {error && <p className={styles.error}>{error}</p>}
        {project && (
          <div className={styles.stack}>
            <Card>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <div className={styles.toolbar}>
                <span className={styles.pill}>{project.status}</span>
                <span className={styles.pill}>Mentor: {project.mentor_id ?? "не назначен"}</span>
              </div>
            </Card>

            <Card>
              <h3>Назначить ментора</h3>
              <form onSubmit={handleAssignMentor} className={styles.toolbar}>
                <Select name="mentor_id" defaultValue={project.mentor_id ?? ""}>
                  <option value="">Без ментора</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.full_name} · {mentor.email}
                    </option>
                  ))}
                </Select>
                <Button type="submit">Сохранить</Button>
              </form>
            </Card>

            <Card>
              <h3>Заявки студентов</h3>
              {applications.length === 0 && <p>Заявок пока нет.</p>}
              {applications.length > 0 && (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Студент</th>
                      <th>Профиль</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td>
                          <strong>{application.student.full_name}</strong>
                          <div>{application.student.email}</div>
                        </td>
                        <td>
                          <div>Факультет: {application.student.faculty || "—"}</div>
                          <div>Навыки: {application.student.skills || "—"}</div>
                          <div>Курс: {application.student.course || "—"}</div>
                          {application.stats && (
                            <div>
                              Заявок: {application.stats.applications_total} · Принято:{" "}
                              {application.stats.applications_approved} · Отклонено:{" "}
                              {application.stats.applications_rejected}
                            </div>
                          )}
                        </td>
                        <td>{application.state}</td>
                        <td>
                          <div className={styles.toolbar}>
                            <Button size="sm" onClick={() => decide(application.id, "approve")}>
                              Approve
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => decide(application.id, "reject")}>
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}
