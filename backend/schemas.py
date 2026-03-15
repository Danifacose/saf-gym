"""
Pydantic Schemas per validazione input/output API.
Separati dai modelli SQLAlchemy per mantenere il confine tra DB e API.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


# ── Auth ──────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    ruolo: str
    user_id: str
    nome: str


# ── User ──────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str
    nome: str
    cognome: str
    data_nascita: Optional[date] = None
    telefono: Optional[str] = None
    codice_fiscale: Optional[str] = None
    indirizzo: Optional[str] = None
    ruolo: str = "utente"

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    cognome: Optional[str] = None
    email: Optional[str] = None
    data_nascita: Optional[date] = None
    telefono: Optional[str] = None
    codice_fiscale: Optional[str] = None
    indirizzo: Optional[str] = None
    attivo: Optional[bool] = None

class UserOut(BaseModel):
    id: str
    email: str
    nome: str
    cognome: str
    data_nascita: Optional[date] = None
    telefono: Optional[str] = None
    codice_fiscale: Optional[str] = None
    indirizzo: Optional[str] = None
    data_iscrizione: datetime
    ruolo: str
    attivo: bool

    class Config:
        from_attributes = True


# ── Package ───────────────────────────────────────────

class PackageCreate(BaseModel):
    nome: str
    durata_giorni: int
    prezzo: float
    descrizione: Optional[str] = None

class PackageUpdate(BaseModel):
    nome: Optional[str] = None
    durata_giorni: Optional[int] = None
    prezzo: Optional[float] = None
    descrizione: Optional[str] = None
    attivo: Optional[bool] = None

class PackageOut(BaseModel):
    id: str
    nome: str
    durata_giorni: int
    prezzo: float
    descrizione: Optional[str] = None
    attivo: bool

    class Config:
        from_attributes = True


# ── Subscription ──────────────────────────────────────

class SubscriptionCreate(BaseModel):
    user_id: str
    package_id: str
    data_inizio: date
    pagato: bool = False
    data_pagamento: Optional[date] = None
    note: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    pagato: Optional[bool] = None
    data_pagamento: Optional[date] = None
    note: Optional[str] = None

class SubscriptionOut(BaseModel):
    id: str
    user_id: str
    package_id: str
    data_inizio: date
    data_scadenza: date
    pagato: bool
    data_pagamento: Optional[date] = None
    note: Optional[str] = None
    # Dati annidati
    user: Optional[UserOut] = None
    package: Optional[PackageOut] = None

    class Config:
        from_attributes = True


# ── Workout ───────────────────────────────────────────

class ExerciseCreate(BaseModel):
    nome_esercizio: str
    gruppo_muscolare: Optional[str] = None
    serie: int = 3
    ripetizioni: str = "10"
    peso_kg: Optional[float] = None
    riposo_secondi: Optional[int] = 90
    note: Optional[str] = None
    ordine: int = 0

class ExerciseUpdate(BaseModel):
    nome_esercizio: Optional[str] = None
    gruppo_muscolare: Optional[str] = None
    serie: Optional[int] = None
    ripetizioni: Optional[str] = None
    peso_kg: Optional[float] = None
    riposo_secondi: Optional[int] = None
    note: Optional[str] = None
    ordine: Optional[int] = None

class ExerciseOut(BaseModel):
    id: str
    nome_esercizio: str
    gruppo_muscolare: Optional[str] = None
    serie: int
    ripetizioni: str
    peso_kg: Optional[float] = None
    riposo_secondi: Optional[int] = None
    note: Optional[str] = None
    ordine: int

    class Config:
        from_attributes = True

class WorkoutPlanCreate(BaseModel):
    user_id: str
    nome: str
    data_scadenza: date
    note: Optional[str] = None
    exercises: List[ExerciseCreate] = []

class WorkoutPlanUpdate(BaseModel):
    nome: Optional[str] = None
    data_scadenza: Optional[date] = None
    note: Optional[str] = None
    attivo: Optional[bool] = None

class WorkoutPlanOut(BaseModel):
    id: str
    user_id: str
    nome: str
    data_creazione: datetime
    data_scadenza: date
    note: Optional[str] = None
    attivo: bool
    exercises: List[ExerciseOut] = []

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────

class AdminDashboard(BaseModel):
    totale_atleti: int
    atleti_attivi: int
    pagamenti_in_regola: int
    pagamenti_scaduti: int
    schede_in_scadenza: int
    abbonamenti_in_scadenza: int

class UserDashboard(BaseModel):
    user: UserOut
    abbonamento_attivo: Optional[SubscriptionOut] = None
    scheda_attiva: Optional[WorkoutPlanOut] = None
    giorni_al_pagamento: Optional[int] = None
    giorni_scadenza_scheda: Optional[int] = None
