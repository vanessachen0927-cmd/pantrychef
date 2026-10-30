
import os
import tempfile
from pathlib import Path

# Use a dedicated temporary database before importing the application.
_test_directory = tempfile.TemporaryDirectory(prefix="pantrychef_tests_")
_test_db = Path(_test_directory.name) / "test.db"

os.environ["DATABASE_URL"] = f"sqlite:///{_test_db}"
os.environ["FRONTEND_ORIGIN"] = "http://localhost:3000"

from fastapi.testclient import TestClient
os.environ["SUPABASE_URL"] = "https://pantrychef-test.supabase.co"
from app.main import app


def test_health():
    with TestClient(app) as client:
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_recipe_listing():
    with TestClient(app) as client:
        response = client.get("/recipes")

        assert response.status_code == 200

        recipes = response.json()

        assert len(recipes) >= 4
        assert any(
            recipe["title"] == "Tomato Basil Pasta"
            for recipe in recipes
        )


def test_recipe_details():
    with TestClient(app) as client:
        response = client.get("/recipes/1")

        assert response.status_code == 200

        recipe = response.json()

        assert recipe["title"] == "Tomato Basil Pasta"
        assert recipe["servings"] == 2
        assert len(recipe["ingredients"]) > 0
        assert len(recipe["instructions"]) > 0


def test_recipe_not_found():
    with TestClient(app) as client:
        response = client.get("/recipes/999999")

        assert response.status_code == 404
        assert response.json()["detail"] == "Recipe not found"


def test_search_recipes():
    with TestClient(app) as client:
        response = client.get(
            "/recipes",
            params={"q": "pasta"},
        )

        assert response.status_code == 200

        recipes = response.json()

        assert len(recipes) == 1
        assert recipes[0]["title"] == "Tomato Basil Pasta"


def test_filter_by_cuisine():
    with TestClient(app) as client:
        response = client.get(
            "/recipes",
            params={"cuisine": "Italian"},
        )

        assert response.status_code == 200

        recipes = response.json()

        assert len(recipes) > 0
        assert all(
            recipe["cuisine"] == "Italian"
            for recipe in recipes
        )


def test_filter_by_cooking_time():
    with TestClient(app) as client:
        response = client.get(
            "/recipes",
            params={"max_minutes": 15},
        )

        assert response.status_code == 200

        recipes = response.json()

        assert len(recipes) > 0
        assert all(
            recipe["minutes"] <= 15
            for recipe in recipes
        )


def test_invalid_query_parameters():
    with TestClient(app) as client:
        response = client.get(
            "/recipes",
            params={"limit": -1},
        )

        assert response.status_code == 422


def test_protected_route():
    with TestClient(app) as client:
        response = client.get("/me/saved")

        assert response.status_code == 401


def test_cors():
    with TestClient(app) as client:
        response = client.get(
            "/recipes",
            headers={"Origin": "http://localhost:3000"},
        )

        assert response.status_code == 200
        assert (
            response.headers.get("access-control-allow-origin")
            == "http://localhost:3000"
        )
