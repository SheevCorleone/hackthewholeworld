import json
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.repositories import audit_log_repo


def log_action(
    db: Session,
    *,
    actor_id: int | None,
    action: str,
    entity_type: str | None = None,
    entity_id: int | None = None,
    metadata: dict | None = None,
) -> AuditLog:
    payload = json.dumps(metadata, ensure_ascii=False) if metadata else None
    audit_log = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_json=payload,
    )
    return audit_log_repo.create_audit_log(db, audit_log)
