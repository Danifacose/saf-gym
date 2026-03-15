"""
Router: Gestione schede allenamento e esercizi.
"""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import WorkoutPlan, WorkoutExercise, User
from schemas import (
    WorkoutPlanCreate, WorkoutPlanUpdate, WorkoutPlanOut,
    ExerciseCreate, ExerciseUpdate, ExerciseOut,
    UserDashboard, SubscriptionOut
)
from auth import get_current_user, get_current_admin
from models import Subscription

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


# ── Dashboard Utente ──────────────────────────────────

@router.get("/my-dashboard", response_model=UserDashboard)
def user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dashboard personale dell'utente: scheda attiva, abbonamento, scadenze."""
    today = date.today()

    # Abbonamento attivo più recente
    abbonamento = db.query(Subscription).options(
        joinedload(Subscription.package)
    ).filter(
        Subscription.user_id == current_user.id,
        Subscription.data_scadenza >= today
    ).order_by(Subscription.data_scadenza.desc()).first()

    # Scheda attiva più recente
    scheda = db.query(WorkoutPlan).options(
        joinedload(WorkoutPlan.exercises)
    ).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.attivo == True
    ).order_by(WorkoutPlan.data_creazione.desc()).first()

    # Calcoli giorni rimanenti
    giorni_pagamento = None
    if abbonamento:
        giorni_pagamento = (abbonamento.data_scadenza - today).days

    giorni_scheda = None
    if scheda:
        giorni_scheda = (scheda.data_scadenza - today).days

    return UserDashboard(
        user=current_user,
        abbonamento_attivo=abbonamento,
        scheda_attiva=scheda,
        giorni_al_pagamento=giorni_pagamento,
        giorni_scadenza_scheda=giorni_scheda,
    )


# ── CRUD Schede (Admin) ──────────────────────────────

@router.get("", response_model=list[WorkoutPlanOut])
def list_workouts(
    user_id: str = None,
    attivo: bool = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Lista schede allenamento con filtri (solo admin)."""
    query = db.query(WorkoutPlan).options(joinedload(WorkoutPlan.exercises))
    if user_id:
        query = query.filter(WorkoutPlan.user_id == user_id)
    if attivo is not None:
        query = query.filter(WorkoutPlan.attivo == attivo)
    return query.order_by(WorkoutPlan.data_creazione.desc()).all()


@router.get("/{plan_id}", response_model=WorkoutPlanOut)
def get_workout(
    plan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dettaglio di una scheda. Admin vede tutte, utente solo le sue."""
    plan = db.query(WorkoutPlan).options(
        joinedload(WorkoutPlan.exercises)
    ).filter(WorkoutPlan.id == plan_id).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Scheda non trovata")
    if current_user.ruolo != "admin" and plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accesso non autorizzato")
    return plan


@router.post("", response_model=WorkoutPlanOut, status_code=201)
def create_workout(
    data: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Crea una nuova scheda con esercizi (solo admin)."""
    # Verifica utente
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    plan = WorkoutPlan(
        user_id=data.user_id,
        nome=data.nome,
        data_scadenza=data.data_scadenza,
        note=data.note,
    )
    db.add(plan)
    db.flush()

    # Aggiungi esercizi
    for i, ex_data in enumerate(data.exercises):
        exercise = WorkoutExercise(
            workout_plan_id=plan.id,
            nome_esercizio=ex_data.nome_esercizio,
            gruppo_muscolare=ex_data.gruppo_muscolare,
            serie=ex_data.serie,
            ripetizioni=ex_data.ripetizioni,
            peso_kg=ex_data.peso_kg,
            riposo_secondi=ex_data.riposo_secondi,
            note=ex_data.note,
            ordine=ex_data.ordine if ex_data.ordine else i,
        )
        db.add(exercise)

    db.commit()

    # Ricarica con relazioni
    return db.query(WorkoutPlan).options(
        joinedload(WorkoutPlan.exercises)
    ).filter(WorkoutPlan.id == plan.id).first()


@router.put("/{plan_id}", response_model=WorkoutPlanOut)
def update_workout(
    plan_id: str,
    data: WorkoutPlanUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Modifica una scheda (solo admin)."""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Scheda non trovata")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=204)
def delete_workout(
    plan_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Elimina una scheda (solo admin)."""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Scheda non trovata")
    db.delete(plan)
    db.commit()


# ── CRUD Esercizi ─────────────────────────────────────

@router.post("/{plan_id}/exercises", response_model=ExerciseOut, status_code=201)
def add_exercise(
    plan_id: str,
    data: ExerciseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Aggiunge un esercizio a una scheda esistente (solo admin)."""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Scheda non trovata")

    exercise = WorkoutExercise(
        workout_plan_id=plan_id,
        **data.model_dump()
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@router.put("/exercises/{exercise_id}", response_model=ExerciseOut)
def update_exercise(
    exercise_id: str,
    data: ExerciseUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Modifica un esercizio (solo admin)."""
    ex = db.query(WorkoutExercise).filter(WorkoutExercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Esercizio non trovato")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ex, key, value)
    db.commit()
    db.refresh(ex)
    return ex


@router.delete("/exercises/{exercise_id}", status_code=204)
def delete_exercise(
    exercise_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Elimina un esercizio (solo admin)."""
    ex = db.query(WorkoutExercise).filter(WorkoutExercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Esercizio non trovato")
    db.delete(ex)
    db.commit()
