import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Input from "../../../components/Input";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/Manager.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  goal?: string | null;
  key_tasks?: string | null;
  novelty?: string | null;
  skills_required?: string | null;
  course_alignment?: string | null;
  diploma_possible?: boolean | null;
  practice_possible?: boolean | null;
  course_project_possible?: boolean | null;
  nda_required?: boolean | null;
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
  team_role?: string | null;
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

type TaskMentor = {
  id: number;
  mentor_id: number;
  full_name: string;
  email: string;
};

type Question = {
  id: number;
  body: string;
  author_id: number;
  is_private: boolean;
  meeting_info?: string | null;
};

export default function ManagerProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [taskMentors, setTaskMentors] = useState<TaskMentor[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
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
    apiRequest<Question[]>(`/questions?task_id=${id}`).then(setQuestions).catch(() => null);
    apiRequest<TaskMentor[]>(`/manager/projects/${id}/mentors`).then(setTaskMentors).catch(() => null);
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

  const archiveProject = async () => {
    if (!id) return;
    try {
      const updated = await apiRequest<Project>(`/manager/projects/${id}/archive`, { method: "POST" });
      setProject(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddMentor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    const form = new FormData(event.currentTarget);
    const mentorId = form.get("additional_mentor_id");
    if (!mentorId) return;
    try {
      await apiRequest(`/manager/projects/${id}/mentors?mentor_id=${mentorId}`, { method: "POST" });
      const updated = await apiRequest<TaskMentor[]>(`/manager/projects/${id}/mentors`);
      setTaskMentors(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const removeMentor = async (mentorId: number) => {
    if (!id) return;
    try {
      await apiRequest(`/manager/projects/${id}/mentors/${mentorId}`, { method: "DELETE" });
      const updated = await apiRequest<TaskMentor[]>(`/manager/projects/${id}/mentors`);
      setTaskMentors(updated);
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

  const updateRole = async (applicationId: number, role: string) => {
    try {
      await apiRequest(`/manager/applications/${applicationId}/role?role=${encodeURIComponent(role)}`, {
        method: "PATCH"
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
              {project.goal && <p>Цель: {project.goal}</p>}
              {project.key_tasks && <p>Ключевые задачи: {project.key_tasks}</p>}
              {project.novelty && <p>Новизна: {project.novelty}</p>}
              <div className={styles.toolbar}>
                <span className={styles.pill}>Навыки: {project.skills_required || "—"}</span>
                <span className={styles.pill}>Программа: {project.course_alignment || "—"}</span>
              </div>
              <div className={styles.toolbar}>
                <span className={styles.pill}>{project.status}</span>
                <span className={styles.pill}>Mentor: {project.mentor_id ?? "не назначен"}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={archiveProject}>
                Архивировать проект
              </Button>
              <div className={styles.toolbar}>
                <span className={styles.pill}>
                  Диплом: {project.diploma_possible ? "да" : "нет"}
                </span>
                <span className={styles.pill}>
                  Практика: {project.practice_possible ? "да" : "нет"}
                </span>
                <span className={styles.pill}>
                  Курсовой: {project.course_project_possible ? "да" : "нет"}
                </span>
                <span className={styles.pill}>NDA: {project.nda_required ? "да" : "нет"}</span>
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
              <h3>Дополнительные менторы</h3>
              <form onSubmit={handleAddMentor} className={styles.toolbar}>
                <Select name="additional_mentor_id" defaultValue="">
                  <option value="">Выберите ментора</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.full_name} · {mentor.email}
                    </option>
                  ))}
                </Select>
                <Button type="submit">Добавить</Button>
              </form>
              {taskMentors.length === 0 && <p>Дополнительных менторов нет.</p>}
              {taskMentors.length > 0 && (
                <ul className={styles.list}>
                  {taskMentors.map((mentor) => (
                    <li key={mentor.id}>
                      {mentor.full_name} · {mentor.email}
                      <Button size="sm" variant="ghost" onClick={() => removeMentor(mentor.mentor_id)}>
                        Удалить
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
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
                          <div className={styles.toolbar}>
                            <Input
                              name={`role-${application.id}`}
                              placeholder="Роль в команде"
                              defaultValue={application.team_role || ""}
                            />
                            <Button size="sm" variant="secondary" onClick={() => {
                              const input = document.querySelector(
                                `input[name='role-${application.id}']`
                              ) as HTMLInputElement | null;
                              if (input) updateRole(application.id, input.value);
                            }}>
                              Сохранить роль
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card>
              <h3>Вопросы по проекту</h3>
              {questions.length === 0 && <p>Вопросов пока нет.</p>}
              {questions.length > 0 && (
                <ul className={styles.list}>
                  {questions.map((question) => (
                    <li key={question.id}>
                      <strong>{question.is_private ? "Private" : "Public"}</strong>: {question.body}
                      {question.meeting_info && <div>Встреча: {question.meeting_info}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}
