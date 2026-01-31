import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Textarea from "../../../components/Textarea";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/TaskDetail.module.css";

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
  tags?: string | null;
  deadline?: string | null;
  status: string;
  is_archived?: boolean;
  curator_full_name?: string | null;
  mentor_full_name?: string | null;
  mentor_names?: string[] | null;
};

export default function CuratorProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
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

  useEffect(() => {
    if (!id) return;
    apiRequest<Project>(`/projects/${id}`)
      .then((data) => {
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
      })
      .catch((err) => setError(err.message));
  }, [id]);

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
      const updated = await apiRequest<Project>(`/projects/${id}`, {
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

  const archiveProject = async () => {
    if (!id) return;
    try {
      const updated = await apiRequest<Project>(`/projects/${id}/archive`, { method: "POST" });
      setProject(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const unarchiveProject = async () => {
    if (!id) return;
    try {
      const updated = await apiRequest<Project>(`/projects/${id}/unarchive`, { method: "POST" });
      setProject(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const mentorLabel = project?.mentor_names?.length
    ? project.mentor_names.join(", ")
    : project?.mentor_full_name || "—";

  return (
    <RouteGuard roles={["curator"]}>
      <Layout>
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.metaPill}>{message}</p>}
        {project && (
          <div className={styles.wrapper}>
            <div className={styles.detailGrid}>
              <Card className={styles.detailCard}>
                <div className={styles.header}>
                  <h1 className={styles.title}>{project.title}</h1>
                  <span className={styles.status}>{project.status}</span>
                </div>
                <div className={styles.meta}>
                  {project.is_archived && (
                    <span className={`${styles.metaPill} ${styles.badgeArchived}`}>Архив</span>
                  )}
                  {project.tags && <span className={styles.tagPill}>{project.tags}</span>}
                  {project.skills_required && <span className={styles.metaPill}>Навыки: {project.skills_required}</span>}
                  {project.course_alignment && (
                    <span className={styles.metaPill}>Программа: {project.course_alignment}</span>
                  )}
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Описание</h3>
                  <p className={styles.sectionBody}>{project.description}</p>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Цели</h3>
                  <p className={styles.sectionBody}>{project.goal || "—"}</p>
                </div>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Задачи</h3>
                  <p className={styles.sectionBody}>{project.key_tasks || "—"}</p>
                </div>
                <div className={styles.meta}>
                  <span className={styles.metaPill}>
                    Дедлайн: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className={styles.meta}>
                  <span className={styles.metaPill}>
                    Диплом: {project.diploma_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>
                    Практика: {project.practice_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>
                    Курсовой: {project.course_project_possible ? "да" : "нет"}
                  </span>
                  <span className={styles.metaPill}>NDA: {project.nda_required ? "да" : "нет"}</span>
                </div>
                <div className={styles.ctaRow}>
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
              <div className={styles.infoCard}>
                <p className={styles.infoTitle}>Куратор</p>
                <p className={styles.infoValue}>{project.curator_full_name || "—"}</p>
                <p className={styles.infoTitle}>Ментор(ы)</p>
                <p className={styles.infoValue}>{mentorLabel}</p>
                <p className={styles.infoTitle}>Теги/цели</p>
                <p className={styles.infoValue}>{project.tags || project.goal || "—"}</p>
              </div>
            </div>
            {editing && (
              <form onSubmit={saveProject} className={styles.formCard}>
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
                <div className={styles.gridTwo}>
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
                <div className={styles.gridTwo}>
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
                <div className={styles.gridTwo}>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={formState.diploma_possible}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, diploma_possible: event.target.checked }))
                      }
                    />
                    Можно как диплом
                  </label>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={formState.practice_possible}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, practice_possible: event.target.checked }))
                      }
                    />
                    Можно как практику
                  </label>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={formState.course_project_possible}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, course_project_possible: event.target.checked }))
                      }
                    />
                    Можно как курсовой
                  </label>
                  <label className={styles.checkboxRow}>
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
                <div className={styles.ctaRow}>
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
              <p className={styles.description}>Рецензия о проделанной работе добавляется в этом разделе.</p>
            </Card>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}
