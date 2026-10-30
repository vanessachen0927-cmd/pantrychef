from sqlalchemy import select
from .db import SessionLocal
from .models import Recipe

RECIPES = [
 dict(title="Tomato Basil Pasta",cuisine="Italian",minutes=25,servings=2,image_url="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1000",ingredients=[{"name":"pasta","quantity":200,"unit":"g"},{"name":"tomato","quantity":3,"unit":"item"},{"name":"basil","quantity":15,"unit":"g"},{"name":"olive oil","quantity":2,"unit":"tbsp"}],instructions=["Boil pasta until al dente.","Cook chopped tomatoes in olive oil.","Toss pasta with tomatoes and fresh basil."]),
 dict(title="Veggie Fried Rice",cuisine="Asian",minutes=20,servings=2,image_url="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1000",ingredients=[{"name":"cooked rice","quantity":350,"unit":"g"},{"name":"egg","quantity":2,"unit":"item"},{"name":"carrot","quantity":1,"unit":"item"},{"name":"soy sauce","quantity":2,"unit":"tbsp"}],instructions=["Scramble eggs in a hot pan.","Add vegetables and cooked rice.","Season with soy sauce and stir fry."]),
 dict(title="Chickpea Salad",cuisine="Mediterranean",minutes=15,servings=2,image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000",ingredients=[{"name":"chickpeas","quantity":300,"unit":"g"},{"name":"cucumber","quantity":1,"unit":"item"},{"name":"tomato","quantity":2,"unit":"item"},{"name":"lemon juice","quantity":2,"unit":"tbsp"}],instructions=["Rinse and drain chickpeas.","Dice vegetables.","Toss everything with lemon juice."]),
 dict(title="Garlic Mushroom Toast",cuisine="European",minutes=15,servings=2,image_url="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000",ingredients=[{"name":"bread","quantity":4,"unit":"slice"},{"name":"mushrooms","quantity":200,"unit":"g"},{"name":"garlic","quantity":2,"unit":"clove"},{"name":"butter","quantity":1,"unit":"tbsp"}],instructions=["Toast bread.","Sauté mushrooms and garlic in butter.","Pile mushrooms over toast."])
]

def seed():
    with SessionLocal() as db:
        if db.scalar(select(Recipe.id).limit(1)) is None:
            db.add_all([Recipe(**recipe) for recipe in RECIPES]);db.commit()
