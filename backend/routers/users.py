"""
Router: Autenticazione + gestione utenti.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import (
    LoginRequest, TokenResponse, UserCreate, UserUpdate, UserOut
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_current_admin
)

router = APIRouter(prefix="/api", tags=["users"])


# ── Auth ──────────────────────────────────────────────

@router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login con email e password. Restituisce JWT token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o password non validi"
        )
    if not user.attivo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disattivato"
        )
    token = create_access_token(data={"sub": user.id, "ruolo": user.ruolo})
    return TokenResponse(
        access_token=token,
        ruolo=user.ruolo,
        user_id=user.id,
        nome=user.nome
    )


@router.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Restituisce i dati dell'utente corrente."""
    return current_user


# ── CRUD Utenti (Admin) ──────────────────────────────

@router.get("/users", response_model=list[UserOut])
def list_users(
    attivo: bool = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Lista tutti gli utenti (solo admin)."""
    query = db.query(User).filter(User.ruolo == "utente")
    if attivo is not None:
        query = query.filter(User.attivo == attivo)
    return query.order_by(User.cognome, User.nome).all()


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Dettaglio di un singolo utente (solo admin)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    return user


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Crea un nuovo utente (solo admin)."""
    # Controlla email duplicata
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email già registrata"
        )
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        nome=data.nome,
        cognome=data.cognome,
        data_nascita=data.data_nascita,
        telefono=data.telefono,
        codice_fiscale=data.codice_fiscale,
        indirizzo=data.indirizzo,
        ruolo=data.ruolo,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Modifica un utente (solo admin)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Elimina un utente (solo admin)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    db.delete(user)
    db.commit()
