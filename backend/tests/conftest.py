from collections.abc import Generator
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import lacaribena_api.models  # noqa: F401
from lacaribena_api.core.config import get_settings
from lacaribena_api.db.base import Base
from lacaribena_api.db.session import get_db
from lacaribena_api.main import app
from lacaribena_api.models import Category, Product, User
from lacaribena_api.security.auth import hash_password

settings = get_settings()


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    testing_session = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False
    )
    session = testing_session()

    category = Category(name="Pijamas", slug="pijamas", color="#8C2A28")
    session.add(category)
    session.flush()
    session.add(
        Product(
            name="Pijama de prueba",
            category_id=category.id,
            price=Decimal("1000.00"),
            cost=Decimal("500.00"),
            stock=5,
            min_stock=2,
        )
    )
    session.add(
        User(
            name="Yesenia Castillo",
            email=settings.seed_email,
            hashed_password=hash_password(settings.seed_password),
        )
    )
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(engine)


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={
            "email": settings.seed_email,
            "password": settings.seed_password,
        },
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
