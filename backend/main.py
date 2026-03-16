origins = [
 "*"
º"""
Saf Gym — Backend FastAPI
Entry point: avvia il server, configura CORS, include i router.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import users, packages, subscriptions, workouts

# ── Crea le tabelle del DB ────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App FastAPI ───────────────────────────────────────
app = FastAPI(
    title="Saf Gym API",
    description="API per la gestione della palestra Saf Gym",
    version="1.0.0",
)
from fastapi.middleware.cors import CORSMiddleware
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],origins = ["*"]

app.add_middleware(
 CORSMiddleware,
 allow_origins=origins,
 allow_credentials=True,
 allow_methods=["*"],
 allow_headers=["*"],
)

# ── Router ────────────────────────────────────────────
app.include_router(users.router)
app.include_router(packages.router)
app.include_router(subscriptions.router)
app.include_router(workouts.router)


@app.get("/")
def root():
    """Health check."""
    return {"status": "ok", "app": "Saf Gym API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
