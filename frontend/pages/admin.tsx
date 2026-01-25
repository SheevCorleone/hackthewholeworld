import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiRequest } from "../components/api";

interface UserRow {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

const roles = ["student", "teacher", "mentor", "curator", "tech_admin", "admin"];

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = () => {
    apiRequest<UserRow[]>("/users")
      .then(setUsers)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (userId: number, role: string) => {
    try {
      await apiRequest(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role })
      });
      loadUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <h1 className="section-title" style={{ fontSize: "26px" }}>Техническая администрация</h1>
      <p className="subtitle">Управление ролями и доступом пользователей.</p>
      {error && <p className="error" style={{ marginTop: "12px" }}>{error}</p>}
      <div className="card" style={{ marginTop: "20px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Email</th>
              <th>Роль</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    className="select"
                    value={user.role}
                    onChange={(event) => updateRole(user.id, event.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
