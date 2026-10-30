
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .config import settings
from .db import Base, engine, get_db
from .models import Recipe
from .schemas import RecipeOut
from .seed import seed
from .routers import users, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed()
    yield


app = FastAPI(
    title="PantryChef API",
    version="0.1.0",
    lifespan=lifespan,
)

# Allow requests from the local Next.js development server.
LOCAL_FRONTEND_ORIGINS = [
    "http:" + "//localhost:3000",
    "http:" + "//127.0.0.1:3000",
]

configured_origins = [
    origin.strip()
    for origin in settings.frontend_origin.split(",")
    if origin.strip()
]

allowed_origins = list(
    dict.fromkeys(LOCAL_FRONTEND_ORIGINS + configured_origins)
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(users.router)
app.include_router(ai.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/recipes", response_model=list[RecipeOut])
def recipes(
    q: str = "",
    cuisine: str = "",
    max_minutes: int | None = Query(None, ge=1),
    pantry: str = "",
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = select(Recipe)

    if q:
        stmt = stmt.where(
            func.lower(Recipe.title).like(f"%{q.lower()}%")
        )

    if cuisine:
        stmt = stmt.where(
            func.lower(Recipe.cuisine) == cuisine.lower()
        )

    if max_minutes:
        stmt = stmt.where(Recipe.minutes <= max_minutes)

    items = list(db.scalars(stmt.limit(limit)).all())

    if pantry:
        have = {
            item.strip().lower()
            for item in pantry.split(",")
            if item.strip()
        }

        items.sort(
            key=lambda recipe: -sum(
                ingredient["name"].lower() in have
                for ingredient in recipe.ingredients
            )
        )

    return items


@app.get("/recipes/{recipe_id}", response_model=RecipeOut)
def recipe(recipe_id: int, db: Session = Depends(get_db)):
    found = db.get(Recipe, recipe_id)

    if not found:
        raise HTTPException(
            status_code=404,
            detail="Recipe not found",
        )

    return found
