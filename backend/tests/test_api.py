from fastapi.testclient import TestClient


def test_tasks(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    created = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Tarea de prueba"},
    )
    assert created.status_code == 201
    task_id = created.json()["id"]

    listed = client.get("/api/tasks", headers=auth_headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.patch(
        f"/api/tasks/{task_id}",
        headers=auth_headers,
        json={"done": True},
    )
    assert updated.status_code == 200
    assert updated.json()["done"] is True

    deleted = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert deleted.status_code == 204


def test_settings(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    current = client.get("/api/settings", headers=auth_headers)
    assert current.status_code == 200
    assert current.json()["store_name"] == "La Caribeña Encajes"

    updated = client.put(
        "/api/settings",
        headers=auth_headers,
        json={"store_name": "La Caribeña QA", "monthly_goal": 200000},
    )
    assert updated.status_code == 200
    assert updated.json()["store_name"] == "La Caribeña QA"
    assert updated.json()["monthly_goal"] == 200000


def test_orders_and_analytics(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    orders = client.get("/api/orders", headers=auth_headers)
    assert orders.status_code == 200
    assert orders.json()["total"] == 0

    dashboard = client.get(
        "/api/analytics/dashboard?period=mes", headers=auth_headers
    )
    assert dashboard.status_code == 200
    data = dashboard.json()
    assert "today" in data
    assert "monthly" in data
    assert len(data["monthly"]) == 12

    summary = client.get("/api/analytics/summary", headers=auth_headers)
    assert summary.status_code == 200
    assert "hoy" in summary.json()["periods"]

    sales = client.get("/api/analytics/sales", headers=auth_headers)
    assert sales.status_code == 200
    assert "channels" in sales.json()

    operations = client.get(
        "/api/analytics/operations", headers=auth_headers
    )
    assert operations.status_code == 200
    assert operations.json()["inventory_health"]["active_products"] == 1


def test_create_order(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    created = client.post(
        "/api/orders",
        headers=auth_headers,
        json={
            "customer_name": "Cliente de prueba",
            "payment_method": "Transferencia",
            "items": [{"product_id": 1, "quantity": 2}],
        },
    )
    assert created.status_code == 201, created.text
    order = created.json()
    assert order["total"] == 2000.0
    assert order["items"][0]["product_name"] == "Pijama de prueba"

    orders = client.get("/api/orders", headers=auth_headers)
    assert orders.json()["total"] == 1

    updated = client.patch(
        f"/api/orders/{order['id']}",
        headers=auth_headers,
        json={"status": "Enviada"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "Enviada"

    dashboard = client.get(
        "/api/analytics/dashboard?period=hoy", headers=auth_headers
    )
    assert dashboard.status_code == 200
    assert dashboard.json()["today"]["orders"] >= 1


def test_reset_demo(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post("/api/admin/reset-demo", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    products = client.get(
        "/api/products?page_size=100", headers=auth_headers
    )
    assert products.json()["total"] == 24
    orders = client.get("/api/orders?limit=1000", headers=auth_headers)
    assert orders.json()["total"] == 224
