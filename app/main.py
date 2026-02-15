from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.screentime import router as screentime_router
from app.routers.dashboard import router as dashboard_router
from app.routers.game import router as game_router

app = FastAPI(title="Screentime Backend", version="0.1.0")

origins = settings.cors_origins_list()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(screentime_router, prefix="/screentime", tags=["screentime"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
app.include_router(game_router, prefix="/game", tags=["game"])
