from fastapi.testclient import TestClient

from lacaribena_api.core.config import get_settings

settings = get_settings()


def test_root(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["docs"] == "/docs"
    assert data["auth"] == "/api/auth/login"


def test_openapi(client: TestClient) -> None:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert response.json()["info"]["title"] == settings.app_name


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["database"] == "ok"
