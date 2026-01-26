import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Select from "../components/Select";
import ErrorText from "../components/ErrorText";
import { apiRequest } from "../components/api";
import styles from "../styles/Admin.module.css";

interface UserRow {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

const roles = ["student", "mentor", "curator", "manager", "admin"];

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
      <h1 className={styles.title}>Техническая администрация</h1>
      <p className={styles.subtitle}>Управление ролями и доступом пользователей.</p>
      {error && <ErrorText style={{ marginTop: "12px" }}>{error}</ErrorText>}
      <Card className={styles.tableWrap}>
        <table className={styles.table}>
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
                  <Select
                    value={user.role}
                    onChange={(event) => updateRole(user.id, event.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Layout>
  );
}
