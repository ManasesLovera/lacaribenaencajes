from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from lacaribena_api.db.session import get_db
from lacaribena_api.models import StoreSettings
from lacaribena_api.schemas.models import SettingsRead, SettingsUpdate
from lacaribena_api.security.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])


def get_or_create_settings(db: Session) -> StoreSettings:
    settings = db.get(StoreSettings, 1)
    if settings:
        return settings
    settings = StoreSettings(id=1)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


@router.get("", response_model=SettingsRead)
def read_settings(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> StoreSettings:
    return get_or_create_settings(db)


@router.put("", response_model=SettingsRead)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> StoreSettings:
    settings = get_or_create_settings(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
