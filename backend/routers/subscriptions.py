"""
Router: Gestione abbonamenti e tracking pagamenti.
"""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Subscription, Package, User
from schemas import SubscriptionCreate, SubscriptionUpdate, SubscriptionOut, AdminDashboard
from auth import get_current_admin, get_current_user

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.get("", response_model=list[SubscriptionOut])
def list_subscriptions(
    user_id: str = None,
    pagato: bool = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Lista abbonamenti con filtri opzionali (solo admin)."""
    query = db.query(Subscription).options(
        joinedload(Subscription.user),
        joinedload(Subscription.package)
    )
    if user_id:
        query = query.filter(Subscription.user_id == user_id)
    if pagato is not None:
        query = query.filter(Subscription.pagato == pagato)
    return query.order_by(Subscription.data_scadenza.desc()).all()


@router.get("/dashboard", response_model=AdminDashboard)
def admin_dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Statistiche dashboard admin."""
    today = date.today()
    soon = today + timedelta(days=7)

    totale_atleti = db.query(User).filter(User.ruolo == "utente").count()
    atleti_attivi = db.query(User).filter(User.ruolo == "utente", User.attivo == True).count()

    # Abbonamenti attivi (non scaduti)
    active_subs = db.query(Subscription).filter(
        Subscription.data_scadenza >= today
    )
    pagamenti_in_regola = active_subs.filter(Subscription.pagato == True).count()
    pagamenti_scaduti = db.query(Subscription).filter(
        Subscription.pagato == False,
        Subscription.data_scadenza >= today
    ).count()

    # Schede in scadenza (prossimi 7 giorni)
    from models import WorkoutPlan
    schede_in_scadenza = db.query(WorkoutPlan).filter(
        WorkoutPlan.attivo == True,
        WorkoutPlan.data_scadenza <= soon,
        WorkoutPlan.data_scadenza >= today
    ).count()

    # Abbonamenti in scadenza (prossimi 7 giorni)
    abbonamenti_in_scadenza = db.query(Subscription).filter(
        Subscription.data_scadenza <= soon,
        Subscription.data_scadenza >= today
    ).count()

    return AdminDashboard(
        totale_atleti=totale_atleti,
        atleti_attivi=atleti_attivi,
        pagamenti_in_regola=pagamenti_in_regola,
        pagamenti_scaduti=pagamenti_scaduti,
        schede_in_scadenza=schede_in_scadenza,
        abbonamenti_in_scadenza=abbonamenti_in_scadenza,
    )


@router.post("", response_model=SubscriptionOut, status_code=201)
def create_subscription(
    data: SubscriptionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Crea un nuovo abbonamento per un utente (solo admin)."""
    # Verifica che utente e pacchetto esistano
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    package = db.query(Package).filter(Package.id == data.package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Pacchetto non trovato")

    # Calcola data scadenza
    data_scadenza = data.data_inizio + timedelta(days=package.durata_giorni)

    sub = Subscription(
        user_id=data.user_id,
        package_id=data.package_id,
        data_inizio=data.data_inizio,
        data_scadenza=data_scadenza,
        pagato=data.pagato,
        data_pagamento=data.data_pagamento,
        note=data.note,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # Ricarica con le relazioni
    sub = db.query(Subscription).options(
        joinedload(Subscription.user),
        joinedload(Subscription.package)
    ).filter(Subscription.id == sub.id).first()

    return sub


@router.put("/{sub_id}", response_model=SubscriptionOut)
def update_subscription(
    sub_id: str,
    data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Modifica un abbonamento — es. segna come pagato (solo admin)."""
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Abbonamento non trovato")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sub, key, value)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/{sub_id}", status_code=204)
def delete_subscription(
    sub_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Elimina un abbonamento (solo admin)."""
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Abbonamento non trovato")
    db.delete(sub)
    db.commit()
