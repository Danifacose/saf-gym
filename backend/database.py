"""
Database setup — SQLAlchemy + SQLite
Configura engine, session e Base per tutti i modelli.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Il database SQLite viene salvato nella root del backend
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./saf_gym.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Necessario per SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency injection per ottenere una sessione DB."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
