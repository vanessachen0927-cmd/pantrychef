from sqlalchemy import String, Integer, Float, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

class Recipe(Base):
    __tablename__ = "recipes"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150), index=True)
    cuisine: Mapped[str] = mapped_column(String(60), default="International")
    minutes: Mapped[int] = mapped_column(Integer, default=25)
    servings: Mapped[int] = mapped_column(Integer, default=2)
    image_url: Mapped[str] = mapped_column(String(500), default="")
    instructions: Mapped[list] = mapped_column(JSON, default=list)
    ingredients: Mapped[list] = mapped_column(JSON, default=list)

class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(80), index=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))
    __table_args__ = (UniqueConstraint("user_id", "recipe_id"),)

class PantryItem(Base):
    __tablename__ = "pantry_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(80), index=True)
    name: Mapped[str] = mapped_column(String(100))
    __table_args__ = (UniqueConstraint("user_id", "name"),)

class ShoppingItem(Base):
    __tablename__ = "shopping_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(80), index=True)
    name: Mapped[str] = mapped_column(String(100))
    quantity: Mapped[float] = mapped_column(Float, default=1)
    unit: Mapped[str] = mapped_column(String(30), default="item")
    checked: Mapped[bool] = mapped_column(default=False)
