from fastapi import FastAPI
from .database import engine
from .models import Base
from .routers import candidates, auth as auth_router

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TechKraft Recruitment API")

app.include_router(auth_router.router)
app.include_router(candidates.router)

@app.get("/")
def health_check():
    return {"status": "online"}