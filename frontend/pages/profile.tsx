import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import RouteGuard from "../components/RouteGuard";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Badge from "../components/Badge";
import ErrorText from "../components/ErrorText";
import { apiRequest } from "../components/api";
import styles from "../styles/Profile.module.css";

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  faculty?: string | null;
  course?: string | null;
  skills?: string | null;
  about?: string | null;
  created_at: string;
  last_active_at?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    apiRequest<UserProfile>("/users/me")
      .then(setUser)
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setStatus(null);
    setError(null);
    const form = new FormData(event.currentTarget);
    const normalize = (value: FormDataEntryValue | null) => {
      const text = String(value ?? "").trim();
      return text.length ? text : null;
    };
    try {
      const updated = await apiRequest<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: normalize(form.get("full_name")) ?? "",
          avatar_url: normalize(form.get("avatar_url")),
          faculty: normalize(form.get("faculty")),
          course: normalize(form.get("course")),
          skills: normalize(form.get("skills")),
          about: normalize(form.get("about"))
        })
      });
      setUser(updated);
      setStatus("Сохранено");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordStatus(null);
    const form = new FormData(event.currentTarget);
    const oldPassword = String(form.get("old_password") || "");
    const newPassword = String(form.get("new_password") || "");
    const confirmPassword = String(form.get("confirm_password") || "");
    if (newPassword.length < 8) {
      setPasswordError("Пароль должен быть не короче 8 символов.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Новый пароль и подтверждение не совпадают.");
      return;
    }
    setPasswordLoading(true);
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      setPasswordStatus("Пароль обновлён. Сейчас выйдем из системы.");
      setTimeout(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
      }, 1400);
    } catch (err) {
      setPasswordError((err as Error).message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <RouteGuard>
      <Layout>
        <h1 className={styles.title}>Личный профиль</h1>
        {error && <ErrorText style={{ marginTop: "12px" }}>{error}</ErrorText>}
        {user && (
          <div className={styles.grid}>
            <Card>
              <div className={styles.row}>
                <div className={styles.avatar}>{(user.full_name || "U").slice(0, 1)}</div>
                <div className={styles.identity}>
                  <div className={styles.kicker}>Профиль</div>
                  <div className={styles.name}>{user.full_name}</div>
                  <div className={styles.muted}>{user.email}</div>
                  <Badge tone="sber" style={{ marginTop: "8px" }}>{user.role}</Badge>
                </div>
              </div>
              <div className={styles.metaGrid}>
                <div>
                  <div className={styles.metaLabel}>Дата регистрации</div>
                  <div className={styles.metaValue}>{formatDate(user.created_at)}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Последняя активность</div>
                  <div className={styles.metaValue}>{formatDate(user.last_active_at)}</div>
                </div>
              </div>
            </Card>
            <Card className={styles.section}>
              <h2>Данные профиля</h2>
              <p className={styles.caption}>
                Email и роль доступны только для просмотра. Обновляйте информацию, которую видит менеджер.
              </p>
              <form onSubmit={handleSubmit} className={styles.form}>
                <Input name="full_name" label="ФИО" defaultValue={user.full_name} required />
                <Input name="faculty" label="Факультет" defaultValue={user.faculty || ""} placeholder="Например, ИТ" />
                <Input name="course" label="Курс" defaultValue={user.course || ""} placeholder="Например, 3 курс" />
                <Input name="skills" label="Навыки" defaultValue={user.skills || ""} placeholder="Python, SQL, ML" />
                <Textarea
                  name="about"
                  label="О себе"
                  defaultValue={user.about || ""}
                  rows={4}
                  placeholder="Кратко о себе, интересах и опыте"
                />
                <Input name="avatar_url" label="Avatar URL" defaultValue={user.avatar_url || ""} placeholder="https://..." />
                <div className={styles.actions}>
                  <Button type="submit">Сохранить</Button>
                  {status && <p className={styles.status}>{status}</p>}
                </div>
              </form>
            </Card>
            <Card className={styles.section}>
              <h2>Смена пароля</h2>
              <p className={styles.caption}>
                После смены пароля вы автоматически выйдете из системы.
              </p>
              <form onSubmit={handlePasswordSubmit} className={styles.form}>
                <Input name="old_password" label="Текущий пароль" type="password" required />
                <Input name="new_password" label="Новый пароль" type="password" required helperText="Минимум 8 символов." />
                <Input
                  name="confirm_password"
                  label="Подтверждение нового пароля"
                  type="password"
                  required
                />
                {passwordError && <ErrorText>{passwordError}</ErrorText>}
                {passwordStatus && <p className={styles.success}>{passwordStatus}</p>}
                <Button type="submit" loading={passwordLoading}>
                  {passwordLoading ? "Сохраняем..." : "Обновить пароль"}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </Layout>
    </RouteGuard>
  );
}
