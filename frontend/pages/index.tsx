import Link from "next/link";
import Layout from "../components/Layout";
import Button from "../components/Button";
import styles from "../styles/Home.module.css";

export default function HomePage() {
  return (
    <Layout>
      <section className={styles.hero}>
        <div>
          <div className={styles.pills}>
            <span className={styles.pill}>Sber x SberLab-НГУ</span>
            <span className={styles.pillAlt}>Навигация по ролям</span>
          </div>
          <h1 className={styles.title}>
            Платформа, где менеджер, куратор, ментор и студент видят весь цикл проекта в одном окне.
          </h1>
          <p className={styles.lead}>
            Доступ к платформе получают заранее отобранные пользователи. Менеджер управляет проектами и заявками,
            студенты подают запросы на участие, менторы сопровождают команды.
          </p>
          <div className={styles.actions}>
            <Link href="/login">
              <Button size="lg">ВХОД</Button>
            </Link>
          </div>
        </div>
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>Как работает</h2>
          <ul className={styles.cardList}>
            <li>Менеджер создаёт проекты, назначает менторов и решает по заявкам.</li>
            <li>Студенты видят доступные проекты и отправляют заявку.</li>
            <li>Роли и доступы распределяются строго по RBAC.</li>
          </ul>
          <div className={styles.note}>Все действия фиксируются в единой админ-панели.</div>
        </div>
      </section>
    </Layout>
  );
}
