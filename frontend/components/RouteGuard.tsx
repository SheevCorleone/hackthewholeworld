import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./auth";
import styles from "../styles/Guard.module.css";

type Props = {
  children: ReactNode;
  roles?: Array<"manager" | "admin" | "curator" | "student" | "mentor">;
};

export default function RouteGuard({ children, roles }: Props) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (roles && user && !roles.includes(user.role)) {
      router.replace("/403");
    }
  }, [loading, isAuthenticated, roles, user, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.loading}>
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  }

  if (roles && user && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
