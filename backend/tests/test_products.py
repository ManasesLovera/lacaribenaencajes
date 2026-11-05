from fastapi.testclient import TestClient


def test_list_products(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.get("/api/products", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    product = data["items"][0]
    assert product["name"] == "Pijama de prueba"
    assert product["net_income"] == 500.0
    assert product["margin"] == 50.0
    assert product["category"]["name"] == "Pijamas"


def test_product_crud(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    create = client.post(
        "/api/products",
        headers=auth_headers,
        json={
            "name": "Producto nuevo",
            "category_id": 1,
            "price": 2500,
            "cost": 1000,
            "stock": 4,
            "min_stock": 2,
        },
    )
    assert create.status_code == 201, create.text
    product_id = create.json()["id"]

    update = client.patch(
        f"/api/products/{product_id}",
        headers=auth_headers,
        json={"price": 2600, "stock": 1},
    )
    assert update.status_code == 200
    assert update.json()["price"] == 2600.0
    assert update.json()["net_income"] == 1600.0

    delete = client.delete(
        f"/api/products/{product_id}", headers=auth_headers
    )
    assert delete.status_code == 204
    assert (
        client.get(
            f"/api/products/{product_id}", headers=auth_headers
        ).status_code
        == 404
    )


def test_product_validation(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        "/api/products",
        headers=auth_headers,
        json={
            "name": "X",
            "category_id": 1,
            "price": -1,
            "cost": 10,
        },
    )
    assert response.status_code == 422

    missing = client.post(
        "/api/products",
        headers=auth_headers,
        json={
            "name": "Producto válido",
            "category_id": 999,
            "price": 10,
            "cost": 5,
        },
    )
    assert missing.status_code == 404


def test_categories(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.get("/api/categories", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()[0]["product_count"] == 1

    created = client.post(
        "/api/categories",
        headers=auth_headers,
        json={"name": "Accesorios", "color": "#B8863B"},
    )
    assert created.status_code == 201
    assert created.json()["slug"] == "accesorios"

    duplicate = client.post(
        "/api/categories",
        headers=auth_headers,
        json={"name": "Accesorios"},
    )
    assert duplicate.status_code == 409

    blocked = client.delete("/api/categories/1", headers=auth_headers)
    assert blocked.status_code == 409

    deleted = client.delete(
        f"/api/categories/{created.json()['id']}", headers=auth_headers
    )
    assert deleted.status_code == 204
