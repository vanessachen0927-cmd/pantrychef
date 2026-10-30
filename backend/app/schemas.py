from pydantic import BaseModel, Field

class Ingredient(BaseModel):
    name: str
    quantity: float = Field(gt=0)
    unit: str

class RecipeOut(BaseModel):
    id: int
    title: str
    cuisine: str
    minutes: int
    servings: int
    image_url: str
    instructions: list[str]
    ingredients: list[Ingredient]
    model_config = {"from_attributes": True}

class ShoppingIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    quantity: float = Field(default=1, gt=0)
    unit: str = "item"

class PantryIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class AIRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    recipe_title: str = Field(default="", max_length=150)
