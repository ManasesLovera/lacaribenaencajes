from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from lacaribena_api.db.session import get_db
from lacaribena_api.security.auth import get_current_user
from lacaribena_api.seed import reset_demo

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/reset-demo")
def reset_demo_data(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> dict[str, str]:
    reset_demo(db)
    return {"status": "ok", "message": "Datos de demostración restaurados"}
