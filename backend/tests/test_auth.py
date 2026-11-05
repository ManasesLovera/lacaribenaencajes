from fastapi.testclient import TestClient

from lacaribena_api.core.config import get_settings

settings = get_settings()


def test_login_rejects_wrong_password(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": settings.seed_email, "password": "incorrecta"},
    )
    assert response.status_code == 401


def test_login_and_me(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={
            "email": settings.seed_email,
            "password": settings.seed_password,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == settings.seed_email

    me = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["name"] == "Yesenia Castillo"


def test_oauth2_token_endpoint(client: TestClient) -> None:
    response = client.post(
        "/api/auth/token",
        data={
            "username": settings.seed_email,
            "password": settings.seed_password,
        },
    )
    assert response.status_code == 200
    assert response.json()["access_token"]


def test_protected_route_requires_auth(client: TestClient) -> None:
    assert client.get("/api/products").status_code == 401
    assert client.get("/api/categories").status_code == 401
    assert client.get("/api/orders").status_code == 401
