from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_user
from ..models import SavedRecipe, PantryItem, ShoppingItem, Recipe
from ..schemas import ShoppingIn, PantryIn

router = APIRouter(prefix="/me", tags=["account"])

@router.get("/saved")
def saved(user: str = Depends(require_user), db: Session = Depends(get_db)):
    return [row.recipe_id for row in db.scalars(select(SavedRecipe).where(SavedRecipe.user_id == user)).all()]

@router.post("/saved/{recipe_id}")
def save(recipe_id: int, user: str = Depends(require_user), db: Session = Depends(get_db)):
    if not db.get(Recipe, recipe_id): raise HTTPException(404, "Recipe not found")
    if not db.scalar(select(SavedRecipe).where(SavedRecipe.user_id == user, SavedRecipe.recipe_id == recipe_id)):
        db.add(SavedRecipe(user_id=user, recipe_id=recipe_id)); db.commit()
    return {"saved": True}

@router.delete("/saved/{recipe_id}")
def unsave(recipe_id: int, user: str = Depends(require_user), db: Session = Depends(get_db)):
    row = db.scalar(select(SavedRecipe).where(SavedRecipe.user_id == user, SavedRecipe.recipe_id == recipe_id))
    if row: db.delete(row); db.commit()
    return {"saved": False}

@router.get("/pantry")
def pantry(user: str = Depends(require_user), db: Session = Depends(get_db)):
    return [{"id": r.id, "name": r.name} for r in db.scalars(select(PantryItem).where(PantryItem.user_id == user)).all()]

@router.post("/pantry")
def add_pantry(data: PantryIn, user: str = Depends(require_user), db: Session = Depends(get_db)):
    name = data.name.strip().lower()
    if not db.scalar(select(PantryItem).where(PantryItem.user_id == user, PantryItem.name == name)):
        db.add(PantryItem(user_id=user, name=name));db.commit()
    return {"name": name}

@router.delete("/pantry/{item_id}")
def remove_pantry(item_id: int, user: str = Depends(require_user), db: Session = Depends(get_db)):
    row = db.get(PantryItem, item_id)
    if not row or row.user_id != user: raise HTTPException(404, "Not found")
    db.delete(row);db.commit();return {"deleted": True}

@router.get("/shopping")
def shopping(user: str = Depends(require_user), db: Session = Depends(get_db)):
    return [{"id":r.id,"name":r.name,"quantity":r.quantity,"unit":r.unit,"checked":r.checked} for r in db.scalars(select(ShoppingItem).where(ShoppingItem.user_id == user)).all()]

@router.post("/shopping")
def add_shopping(data: ShoppingIn, user: str = Depends(require_user), db: Session = Depends(get_db)):
    row = ShoppingItem(user_id=user, **data.model_dump());db.add(row);db.commit();db.refresh(row)
    return {"id":row.id}

@router.patch("/shopping/{item_id}")
def toggle(item_id: int, user: str = Depends(require_user), db: Session = Depends(get_db)):
    row = db.get(ShoppingItem, item_id)
    if not row or row.user_id != user: raise HTTPException(404, "Not found")
    row.checked = not row.checked;db.commit();return {"checked":row.checked}

@router.delete("/shopping/{item_id}")
def remove_shopping(item_id: int, user: str = Depends(require_user), db: Session = Depends(get_db)):
    row = db.get(ShoppingItem, item_id)
    if not row or row.user_id != user: raise HTTPException(404, "Not found")
    db.delete(row);db.commit();return {"deleted":True}
