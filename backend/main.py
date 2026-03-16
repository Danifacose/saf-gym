origins = ["*"]
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
    from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import users, packages, subscriptions, workouts

# crea le tabelle del database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Saf Gym API",
    description="API per la gestione della palestra Saf Gym",
    version="1.0.0",
)

# CORS
origins = ["*"]
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import users, packages, subscriptions, workouts

# crea le tabelle del database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Saf Gym API",
    description="API per la gestione della palestra Saf Gym",
    version="1.0.0",
)

# CORS
origins = ["*"]
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import users, packages, subscriptions, workouts

# crea le tabelle del database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Saf Gym API",
    description="API per la gestione della palestra Saf Gym",
    version="1.0.0",
)

# CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(users.router)
app.include_router(packages.router)
app.include_router(subscriptions.router)
app.include_router(workouts.router)


@app.get("/")
def root():
    return {"message": "Saf Gym API running"}
