import Layout from "../../components/Layout";
import RouteGuard from "../../components/RouteGuard";
import Card from "../../components/Card";
import styles from "../../styles/Manager.module.css";

export default function ManagerReviewsPage() {
  return (
    <RouteGuard roles={["manager", "admin"]}>
      <Layout>
        <div className={styles.pageHeader}>
          <h1>Рецензии</h1>
          <p>Просмотр итоговых рецензий по проектам.</p>
        </div>
        <Card>
          <p>Рецензий пока нет. После завершения проектов они появятся здесь.</p>
        </Card>
      </Layout>
    </RouteGuard>
  );
}
