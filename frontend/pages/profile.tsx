import { FormEvent, useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<UserProfile>("/auth/me")
      .then(setUser)
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setStatus(null);
    const form = new FormData(event.currentTarget);
    try {
      const updated = await apiRequest<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: form.get("full_name"),
          avatar_url: form.get("avatar_url")
        })
      });
      setUser(updated);
      setStatus("Сохранено");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <h1 className="section-title" style={{ fontSize: "26px" }}>Личный кабинет</h1>
      {error && <p className="error" style={{ marginTop: "12px" }}>{error}</p>}
      {user && (
        <div className="grid grid-2" style={{ marginTop: "20px" }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#e7f4ec",
                  border: "1px solid #d9e2dc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "20px"
                }}
              >
                {(user.full_name || "U").slice(0, 1)}
              </div>
              <div>
                <div className="label">Профиль</div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>{user.full_name}</div>
                <div className="subtitle">{user.email}</div>
                <div className="pill" style={{ marginTop: "8px" }}>{user.role}</div>
              </div>
            </div>
          </div>
          <div className="card">
            <h2>Настройки</h2>
            <form onSubmit={handleSubmit} className="grid" style={{ marginTop: "16px", gap: "14px" }}>
              <div>
                <label className="label">ФИО</label>
                <input name="full_name" defaultValue={user.full_name} className="input" />
              </div>
              <div>
                <label className="label">Avatar URL</label>
                <input name="avatar_url" defaultValue={user.avatar_url || ""} className="input" placeholder="https://..." />
              </div>
              <button type="submit" className="btn btn-primary">Сохранить</button>
              {status && <p className="muted">{status}</p>}
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
