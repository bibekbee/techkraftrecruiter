from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
from .routers import candidates, auth as auth_router

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TechKraft Recruitment API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:5173"
    ],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if "sqlite" in str(engine.url):
    Base.metadata.create_all(bind=engine)

app.include_router(auth_router.router)
app.include_router(candidates.router)

@app.get("/")
def health_check():
    return {"status": "online"}