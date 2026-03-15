"""
Modelli SQLAlchemy per Saf Gym.
Definisce: User, Package, Subscription, WorkoutPlan, WorkoutExercise.
"""

import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, Date, DateTime,
    ForeignKey, Text
)
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    """Utente della palestra (atleta o admin)."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    nome = Column(String, nullable=False)
    cognome = Column(String, nullable=False)
    data_nascita = Column(Date, nullable=True)
    telefono = Column(String, nullable=True)
    codice_fiscale = Column(String, nullable=True)
    indirizzo = Column(String, nullable=True)
    data_iscrizione = Column(DateTime, default=datetime.utcnow)
    ruolo = Column(String, default="utente")  # "admin" o "utente"
    attivo = Column(Boolean, default=True)

    # Relazioni
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")


class Package(Base):
    """Tipo di pacchetto/abbonamento disponibile."""
    __tablename__ = "packages"

    id = Column(String, primary_key=True, default=generate_uuid)
    nome = Column(String, nullable=False)
    durata_giorni = Column(Integer, nullable=False)
    prezzo = Column(Float, nullable=False)
    descrizione = Column(Text, nullable=True)
    attivo = Column(Boolean, default=True)

    # Relazioni
    subscriptions = relationship("Subscription", back_populates="package")


class Subscription(Base):
    """Abbonamento di un utente a un pacchetto."""
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    package_id = Column(String, ForeignKey("packages.id"), nullable=False)
    data_inizio = Column(Date, nullable=False)
    data_scadenza = Column(Date, nullable=False)
    pagato = Column(Boolean, default=False)
    data_pagamento = Column(Date, nullable=True)
    note = Column(Text, nullable=True)

    # Relazioni
    user = relationship("User", back_populates="subscriptions")
    package = relationship("Package", back_populates="subscriptions")


class WorkoutPlan(Base):
    """Scheda di allenamento assegnata a un utente."""
    __tablename__ = "workout_plans"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    nome = Column(String, nullable=False)
    data_creazione = Column(DateTime, default=datetime.utcnow)
    data_scadenza = Column(Date, nullable=False)
    note = Column(Text, nullable=True)
    attivo = Column(Boolean, default=True)

    # Relazioni
    user = relationship("User", back_populates="workout_plans")
    exercises = relationship("WorkoutExercise", back_populates="workout_plan", cascade="all, delete-orphan")


class WorkoutExercise(Base):
    """Singolo esercizio all'interno di una scheda."""
    __tablename__ = "workout_exercises"

    id = Column(String, primary_key=True, default=generate_uuid)
    workout_plan_id = Column(String, ForeignKey("workout_plans.id"), nullable=False)
    nome_esercizio = Column(String, nullable=False)
    gruppo_muscolare = Column(String, nullable=True)
    serie = Column(Integer, nullable=False, default=3)
    ripetizioni = Column(String, nullable=False, default="10")  # String per "8-12", "AMRAP" ecc.
    peso_kg = Column(Float, nullable=True)
    riposo_secondi = Column(Integer, nullable=True, default=90)
    note = Column(Text, nullable=True)
    ordine = Column(Integer, nullable=False, default=0)

    # Relazioni
    workout_plan = relationship("WorkoutPlan", back_populates="exercises")
