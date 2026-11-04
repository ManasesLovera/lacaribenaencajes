from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from lacaribena_api.core.config import Settings, get_settings
from lacaribena_api.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
    }
