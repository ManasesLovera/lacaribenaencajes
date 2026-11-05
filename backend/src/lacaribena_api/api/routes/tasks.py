from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from lacaribena_api.db.session import get_db
from lacaribena_api.models import Task
from lacaribena_api.schemas.models import TaskCreate, TaskRead, TaskUpdate
from lacaribena_api.security.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_task_or_404(db: Session, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada",
        )
    return task


@router.get("", response_model=list[TaskRead])
def list_tasks(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> list[Task]:
    return list(db.scalars(select(Task).order_by(Task.id)).all())


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Task:
    task = Task(title=payload.title.strip())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Task:
    task = get_task_or_404(db, task_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "title" and value is not None:
            value = value.strip()
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Response:
    task = get_task_or_404(db, task_id)
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
