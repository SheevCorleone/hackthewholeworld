import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import RouteGuard from "../../../components/RouteGuard";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Textarea from "../../../components/Textarea";
import { apiRequest } from "../../../components/api";
import styles from "../../../styles/TaskDetail.module.css";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  tags?: string | null;
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
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!id) return;
    apiRequest<Project>(`/projects/${id}`)
      .then((data) => {
        setProject(data);
        setDescription(data.description);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const saveDescription = async () => {
    if (!id || !description.trim()) return;
    try {
      const updated = await apiRequest<Project>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ description: description.trim() })
      });
      setProject(updated);
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
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
        {project && (
          <Card>
            <div className={styles.header}>
              <h1 className={styles.title}>{project.title}</h1>
              <span className={styles.status}>{project.status}</span>
            </div>
            {project.is_archived && <span className={styles.metaPill}>Архив</span>}
            <div className={styles.meta}>
              <span className={styles.metaPill}>Куратор: {project.curator_full_name || "—"}</span>
              <span className={styles.metaPill}>Ментор: {mentorLabel}</span>
            </div>
            {editing ? (
              <div className={styles.commentBox}>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                />
                <div className={styles.toolbar}>
                  <Button onClick={saveDescription}>Сохранить</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <p className={styles.description}>{project.description}</p>
            )}
            {project.tags && <p className={styles.metaPill}>Tags: {project.tags}</p>}
            <p className={styles.description}>Рецензия о проделанной работе добавляется в этом разделе.</p>
            <div className={styles.toolbar}>
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                Редактировать описание
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
        )}
      </Layout>
    </RouteGuard>
  );
}
