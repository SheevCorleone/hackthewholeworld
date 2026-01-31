import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Input from "../../../components/Input";
import Textarea from "../../../components/Textarea";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/Manager.module.css";
import detailStyles from "../../../styles/TaskDetail.module.css";

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
  is_archived?: boolean;
  mentor_id?: number | null;
  curator_id?: number | null;
  curator_full_name?: string | null;
  mentor_full_name?: string | null;
  mentor_names?: string[] | null;
  tags?: string | null;
  deadline?: string | null;
};

type Mentor = {
  id: number;
  full_name: string;
  email: string;
};

type Curator = {
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
  const [curators, setCurators] = useState<Curator[]>([]);
  const [taskMentors, setTaskMentors] = useState<TaskMentor[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    goal: "",
    key_tasks: "",
    novelty: "",
    skills_required: "",
    course_alignment: "",
    tags: "",
    status: "",
    deadline: "",
    diploma_possible: false,
    practice_possible: false,
    course_project_possible: false,
    nda_required: false
  });

  const loadProject = async () => {
    if (!id) return;
    try {
      const data = await apiRequest<Project>(`/manager/projects/${id}`);
      setProject(data);
      setFormState({
        title: data.title ?? "",
        description: data.description ?? "",
        goal: data.goal ?? "",
        key_tasks: data.key_tasks ?? "",
        novelty: data.novelty ?? "",
        skills_required: data.skills_required ?? "",
        course_alignment: data.course_alignment ?? "",
        tags: data.tags ?? "",
        status: data.status ?? "",
        deadline: data.deadline ?? "",
        diploma_possible: Boolean(data.diploma_possible),
        practice_possible: Boolean(data.practice_possible),
        course_project_possible: Boolean(data.course_project_possible),
        nda_required: Boolean(data.nda_required)
      });
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
    apiRequest<Curator[]>("/manager/curators").then(setCurators).catch(() => null);
    apiRequest<Question[]>(`/questions?task_id=${id}`).then(setQuestions).catch(() => null);
    apiRequest<TaskMentor[]>(`/manager/projects/${id}/mentors`).then(setTaskMentors).catch(() => null);
  }, [id]);

  const handleAssignCurator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    const form = new FormData(event.currentTarget);
    try {
      const updated = await apiRequest<Project>(`/manager/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          curator_id: form.get("curator_id") ? Number(form.get("curator_id")) : null
        })
      });
      setProject(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

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

  const unarchiveProject = async () => {
    if (!id) return;
    try {
      const updated = await apiRequest<Project>(`/manager/projects/${id}/unarchive`, { method: "POST" });
      setProject(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    const trimmedTitle = formState.title.trim();
    if (!trimmedTitle) {
      setError("Название проекта обязательно.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await apiRequest<Project>(`/manager/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: trimmedTitle,
          description: formState.description.trim(),
          goal: formState.goal.trim() || null,
          key_tasks: formState.key_tasks.trim() || null,
          novelty: formState.novelty.trim() || null,
          skills_required: formState.skills_required.trim() || null,
          course_alignment: formState.course_alignment.trim() || null,
          tags: formState.tags.trim() || null,
          status: formState.status.trim() || null,
          deadline: formState.deadline || null,
          diploma_possible: formState.diploma_possible,
          practice_possible: formState.practice_possible,
          course_project_possible: formState.course_project_possible,
          nda_required: formState.nda_required
        })
      });
      setProject(updated);
      setEditing(false);
      setMessage("Изменения сохранены.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
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

  const mentorLabel = project?.mentor_names?.length
    ? project.mentor_names.join(", ")
    : project?.mentor_full_name || "—";

  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={detailStyles.metaPill}>{message}</p>}
        {project && (
          <div className={styles.stack}>
            <div className={detailStyles.detailGrid}>
              <Card className={detailStyles.detailCard}>
                <div className={detailStyles.header}>
                  <h2 className={detailStyles.title}>{project.title}</h2>
                  <span className={detailStyles.status}>{project.status}</span>
                </div>
                <div className={detailStyles.meta}>
                  {project.is_archived && (
                    <span className={`${detailStyles.metaPill} ${detailStyles.badgeArchived}`}>Архив</span>
                  )}
                  {project.tags && <span className={detailStyles.tagPill}>{project.tags}</span>}
                  {project.skills_required && <span className={detailStyles.metaPill}>Навыки: {project.skills_required}</span>}
                  {project.course_alignment && (
                    <span className={detailStyles.metaPill}>Программа: {project.course_alignment}</span>
                  )}
                </div>
                <div className={detailStyles.section}>
                  <h3 className={detailStyles.sectionTitle}>Описание</h3>
                  <p className={detailStyles.sectionBody}>{project.description}</p>
                </div>
                <div className={detailStyles.section}>
                  <h3 className={detailStyles.sectionTitle}>Цели</h3>
                  <p className={detailStyles.sectionBody}>{project.goal || "—"}</p>
                </div>
                <div className={detailStyles.section}>
                  <h3 className={detailStyles.sectionTitle}>Задачи</h3>
                  <p className={detailStyles.sectionBody}>{project.key_tasks || "—"}</p>
                </div>
                <div className={detailStyles.meta}>
                  <span className={detailStyles.metaPill}>Статус: {project.status}</span>
                  <span className={detailStyles.metaPill}>
                    Дедлайн: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className={detailStyles.meta}>
                  <span className={detailStyles.metaPill}>
                    Диплом: {project.diploma_possible ? "да" : "нет"}
                  </span>
                  <span className={detailStyles.metaPill}>
                    Практика: {project.practice_possible ? "да" : "нет"}
                  </span>
                  <span className={detailStyles.metaPill}>
                    Курсовой: {project.course_project_possible ? "да" : "нет"}
                  </span>
                  <span className={detailStyles.metaPill}>NDA: {project.nda_required ? "да" : "нет"}</span>
                </div>
                <div className={detailStyles.ctaRow}>
                  <Button size="sm" variant="secondary" onClick={() => setEditing((prev) => !prev)}>
                    {editing ? "Скрыть форму" : "Редактировать"}
                  </Button>
                  {project.is_archived ? (
                    <Button size="sm" variant="ghost" onClick={unarchiveProject}>
                      Вернуть из архива
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={archiveProject}>
                      Архивировать проект
                    </Button>
                  )}
                </div>
              </Card>
              <div className={detailStyles.infoCard}>
                <p className={detailStyles.infoTitle}>Куратор</p>
                <p className={detailStyles.infoValue}>{project.curator_full_name || "не назначен"}</p>
                <p className={detailStyles.infoTitle}>Ментор(ы)</p>
                <p className={detailStyles.infoValue}>{mentorLabel}</p>
                <p className={detailStyles.infoTitle}>Теги/цели</p>
                <p className={detailStyles.infoValue}>{project.tags || project.goal || "—"}</p>
              </div>
            </div>
            {editing && (
              <form onSubmit={saveProject} className={detailStyles.formCard}>
                  <Input
                    name="title"
                    label="Название проекта"
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                  <Textarea
                    name="description"
                    label="Описание"
                    rows={6}
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    required
                  />
                  <Textarea
                    name="goal"
                    label="Цели"
                    rows={3}
                    value={formState.goal}
                    onChange={(event) => setFormState((prev) => ({ ...prev, goal: event.target.value }))}
                  />
                  <Textarea
                    name="key_tasks"
                    label="Задачи"
                    rows={3}
                    value={formState.key_tasks}
                    onChange={(event) => setFormState((prev) => ({ ...prev, key_tasks: event.target.value }))}
                  />
                  <Textarea
                    name="novelty"
                    label="Новизна/ценность"
                    rows={3}
                    value={formState.novelty}
                    onChange={(event) => setFormState((prev) => ({ ...prev, novelty: event.target.value }))}
                  />
                  <div className={detailStyles.gridTwo}>
                    <Input
                      name="tags"
                      label="Теги"
                      value={formState.tags}
                      onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
                    />
                    <Input
                      name="deadline"
                      label="Deadline"
                      type="date"
                      value={formState.deadline}
                      onChange={(event) => setFormState((prev) => ({ ...prev, deadline: event.target.value }))}
                    />
                  </div>
                  <div className={detailStyles.gridTwo}>
                    <Input
                      name="skills_required"
                      label="Необходимые навыки"
                      value={formState.skills_required}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, skills_required: event.target.value }))
                      }
                    />
                    <Input
                      name="course_alignment"
                      label="Соответствие программе"
                      value={formState.course_alignment}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, course_alignment: event.target.value }))
                      }
                    />
                  </div>
                  <div className={detailStyles.gridTwo}>
                    <label className={detailStyles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={formState.diploma_possible}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, diploma_possible: event.target.checked }))
                        }
                      />
                      Можно как диплом
                    </label>
                    <label className={detailStyles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={formState.practice_possible}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, practice_possible: event.target.checked }))
                        }
                      />
                      Можно как практику
                    </label>
                    <label className={detailStyles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={formState.course_project_possible}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, course_project_possible: event.target.checked }))
                        }
                      />
                      Можно как курсовой
                    </label>
                    <label className={detailStyles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={formState.nda_required}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, nda_required: event.target.checked }))
                        }
                      />
                      Требуется NDA
                    </label>
                  </div>
                  <Input
                    name="status"
                    label="Статус"
                    value={formState.status}
                    onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
                  />
                  <div className={detailStyles.ctaRow}>
                    <Button type="submit" loading={saving}>
                      Сохранить изменения
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                      Отмена
                    </Button>
                  </div>
              </form>
            )}

            <Card>
              <h3>Назначить куратора</h3>
              <form onSubmit={handleAssignCurator} className={styles.toolbar}>
                <Select name="curator_id" defaultValue={project.curator_id ?? ""}>
                  <option value="">Без куратора</option>
                  {curators.map((curator) => (
                    <option key={curator.id} value={curator.id}>
                      {curator.full_name} · {curator.email}
                    </option>
                  ))}
                </Select>
                <Button type="submit">Сохранить</Button>
              </form>
            </Card>

            <Card>
              <h3>Основной ментор</h3>
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
