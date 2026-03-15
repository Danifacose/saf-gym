"""
Router: Gestione pacchetti abbonamento.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Package, User
from schemas import PackageCreate, PackageUpdate, PackageOut
from auth import get_current_admin, get_current_user

router = APIRouter(prefix="/api/packages", tags=["packages"])


@router.get("", response_model=list[PackageOut])
def list_packages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista tutti i pacchetti attivi."""
    return db.query(Package).filter(Package.attivo == True).order_by(Package.prezzo).all()


@router.get("/{package_id}", response_model=PackageOut)
def get_package(
    package_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dettaglio di un singolo pacchetto."""
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Pacchetto non trovato")
    return pkg


@router.post("", response_model=PackageOut, status_code=201)
def create_package(
    data: PackageCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Crea un nuovo pacchetto (solo admin)."""
    pkg = Package(**data.model_dump())
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return pkg


@router.put("/{package_id}", response_model=PackageOut)
def update_package(
    package_id: str,
    data: PackageUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Modifica un pacchetto (solo admin)."""
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Pacchetto non trovato")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pkg, key, value)
    db.commit()
    db.refresh(pkg)
    return pkg


@router.delete("/{package_id}", status_code=204)
def delete_package(
    package_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Disattiva un pacchetto (solo admin). Non lo elimina per preservare lo storico."""
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Pacchetto non trovato")
    pkg.attivo = False
    db.commit()
