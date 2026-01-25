import Link from "next/link";
import Layout from "../components/Layout";
import ButtonLink from "../components/ButtonLink";
import Card from "../components/Card";
import Badge from "../components/Badge";
import styles from "../styles/Home.module.css";

export default function HomePage() {
  return (
    <Layout>
      <section className={styles.hero}>
        <div style={{ display: "grid", gap: "18px" }}>
          <div className={styles.pills}>
            <Badge tone="sber">Сбер</Badge>
            <Badge tone="nsu">НГУ</Badge>
          </div>
          <h1 className={styles.title}>
            Совместные проекты, где студент и куратор видят прогресс в одном окне.
          </h1>
          <p className={styles.lead}>
            Публикуйте кейсы, назначайте менторов и собирайте команды. Студенты видят задачи, берут в работу и
            синхронизируются по статусам.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/register">Начать сейчас</ButtonLink>
            <ButtonLink href="/tasks" variant="secondary">
              Смотреть задачи
            </ButtonLink>
          </div>
        </div>
        <Card>
          <h2>Что внутри MVP</h2>
          <ul className={styles.cardList}>
            <li>Каталог задач с фильтрами и тегами для студентов.</li>
            <li>Запросы на участие и подтверждения от ментора.</li>
            <li>Комментарии, история и статусная модель прогресса.</li>
            <li>Ролевые кабинеты и панель администрирования.</li>
          </ul>
          <div className={styles.note}>Среднее время согласования заявки — 1 рабочий день.</div>
        </Card>
      </section>
    </Layout>
  );
}
