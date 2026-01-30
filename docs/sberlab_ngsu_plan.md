# Аналитика и план расширения SberCollab (Сбер x СберЛаб‑НГУ)

## 1.1 Текущее состояние (кратко)
- **Сущности**: `User` (роль, профиль), `Task` (проекты), `Assignment` (заявки), `Comment` (комментарии).【F:backend/app/models/user.py†L1-L52】【F:backend/app/models/task.py†L1-L33】【F:backend/app/models/assignment.py†L1-L49】【F:backend/app/models/comment.py†L1-L19】
- **Роли**: student, curator, mentor, manager, admin (в Enum User.role).【F:backend/app/models/user.py†L13-L24】
- **Эндпоинты**:
  - `/auth/*` (login/register/refresh/me).【F:backend/app/api/v1/auth.py†L1-L84】
  - `/tasks` (CRUD для куратора/менеджера).【F:backend/app/api/v1/tasks.py†L1-L64】
  - `/projects` (просмотр для ролей).【F:backend/app/api/v1/projects.py†L1-L53】
  - `/assignments` (создать заявку, список своих).【F:backend/app/api/v1/assignments.py†L1-L45】
  - `/manager/*` (dashboard, заявки, создание пользователей).【F:backend/app/api/v1/manager.py†L1-L206】
  - `/comments` (создать/изменить/удалить).【F:backend/app/api/v1/comments.py†L1-L66】

## 1.2 Новые бизнес‑требования (mapping)
- **Стандартизированное описание проекта** → расширение `Task` (goal, key_tasks, novelty, skills_required, course_alignment, diploma/practice/course flags, NDA).【F:backend/app/models/task.py†L8-L30】
- **Новые роли** → расширение `User.role`: UnivTeacher, UnivSupervisor, UnivAdmin, HR, AcademicPartnershipAdmin.【F:backend/app/models/user.py†L13-L25】
- **Workflow согласования (approval)** → новая таблица `Approval` и API `/approvals`, `/univ/approvals`.【F:backend/app/models/approval.py†L1-L29】【F:backend/app/api/v1/approvals.py†L1-L41】【F:backend/app/api/v1/univ.py†L1-L32】
- **Талант‑пайплайн для HR** → `/hr/dashboard` с метриками по студентам и рейтингам.【F:backend/app/api/v1/hr.py†L1-L40】
- **Портфолио студента** → `PortfolioEntry` + `/portfolio/me`.【F:backend/app/models/portfolio_entry.py†L1-L23】【F:backend/app/api/v1/portfolio.py†L1-L16】
- **Расширенное Q&A** → расширение `Comment` (is_private/recipient/meeting_info), `/questions`.【F:backend/app/models/comment.py†L10-L17】【F:backend/app/api/v1/questions.py†L1-L55】
- **Аналитика** → расширенный `manager` dashboard, `hr` dashboard, расчёт рейтингов через `Review`.【F:backend/app/api/v1/manager.py†L25-L84】【F:backend/app/api/v1/hr.py†L1-L40】
- **Подтверждение студентов** → статус пользователя `pending/active/disabled` и менеджерские решения в `/manager` (approvals).【F:backend/app/models/user.py†L13-L33】【F:backend/app/api/v1/manager.py†L185-L239】

## 1.3 ER‑диаграмма (текст)
- **users** (1) —< **tasks** (created_by), (1) —< **tasks** (mentor_id)
- **tasks** (1) —< **assignments**
- **users** (1) —< **assignments** (student_id)
- **assignments** (1) —< **reviews** (assignment_id, уникально)
- **users** (1) —< **reviews** (mentor_id)
- **tasks** (1) —< **approvals**
- **users** (1) —< **approvals** (requested_by), **users** (1) —< **approvals** (reviewer_id)
- **users** (1) —< **comments** (author_id), **users** (1) —< **comments** (recipient_id)
- **assignments** (1) —< **portfolio_entries** (assignment_id, уникально)
- **users** (1) —< **portfolio_entries** (student_id)
- **users** (1) —< **user_skills**
- **users** (1) —< **audit_logs**

## 1.4 Матрица ролей и прав (основное)
- **Student**: просмотр публичных проектов, заявки (`Assignment`), запросы `Approval`, вопросы/комментарии с NDA‑проверкой, просмотр портфолио/отзывов.
- **Mentor/Curator/Manager/Admin**: CRUD проектов, ответы на вопросы, принятие заявок, отзыв (`Review`), просмотр аналитики.
- **UnivTeacher/UnivSupervisor/UnivAdmin**: просмотр/изменение `Approval`.
- **HR/AcademicPartnershipAdmin**: аналитика талант‑пайплайна, просмотр проектов.
- **Защита Q&A**: приватные вопросы доступны автору/адресату/роль‑админам; при NDA требуется подтверждение в `Assignment`.

## 1.5 Roadmap
- **MVP (хакатон)**: расширение `Task`, `Approval`, `Review`, `PortfolioEntry`, роль UnivTeacher, базовый workflow, простые отзывы, базовое портфолио.
- **Next**: SSO, HR‑dashboard, модернизация Q&A, защищённый обмен контактами/календарь.
- **Prod**: multi‑tenant, 5000+ пользователей, SAML/OIDC, DLP/логирование, юридическая интеграция NDA, импорт/экспорт LMS/ERP.
