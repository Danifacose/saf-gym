"""
Seed script — Popola il DB con dati demo.
Crea: 1 admin, 3 atleti, 3 pacchetti, abbonamenti e schede.
Esegui: python seed.py
"""

from datetime import date, datetime, timedelta
from database import engine, SessionLocal, Base
from models import User, Package, Subscription, WorkoutPlan, WorkoutExercise
from auth import hash_password


def seed():
    # Ricrea le tabelle
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ── Admin ─────────────────────────────────────
        admin = User(
            email="admin@safgym.it",
            password_hash=hash_password("admin123"),
            nome="Dani",
            cognome="Admin",
            telefono="+39 333 1234567",
            ruolo="admin",
        )
        db.add(admin)

        # ── Atleti ────────────────────────────────────
        atleta1 = User(
            email="marco.rossi@email.com",
            password_hash=hash_password("password123"),
            nome="Marco",
            cognome="Rossi",
            data_nascita=date(1995, 3, 15),
            telefono="+39 340 1111111",
            codice_fiscale="RSSMRC95C15H501A",
            indirizzo="Via Roma 10, Roma",
        )
        atleta2 = User(
            email="laura.bianchi@email.com",
            password_hash=hash_password("password123"),
            nome="Laura",
            cognome="Bianchi",
            data_nascita=date(1998, 7, 22),
            telefono="+39 340 2222222",
            codice_fiscale="BNCLRA98L62H501B",
            indirizzo="Via Napoli 5, Roma",
        )
        atleta3 = User(
            email="giuseppe.verdi@email.com",
            password_hash=hash_password("password123"),
            nome="Giuseppe",
            cognome="Verdi",
            data_nascita=date(1990, 11, 8),
            telefono="+39 340 3333333",
            codice_fiscale="VRDGPP90S08H501C",
            indirizzo="Via Milano 20, Roma",
        )
        db.add_all([atleta1, atleta2, atleta3])
        db.flush()

        # ── Pacchetti ────────────────────────────────
        pkg_mensile = Package(
            nome="Mensile",
            durata_giorni=30,
            prezzo=39.90,
            descrizione="Accesso completo alla palestra per 1 mese",
        )
        pkg_trimestrale = Package(
            nome="Trimestrale",
            durata_giorni=90,
            prezzo=99.90,
            descrizione="Accesso completo alla palestra per 3 mesi. Risparmio del 16%!",
        )
        pkg_annuale = Package(
            nome="Annuale",
            durata_giorni=365,
            prezzo=349.90,
            descrizione="Accesso completo alla palestra per 12 mesi. Il miglior prezzo!",
        )
        db.add_all([pkg_mensile, pkg_trimestrale, pkg_annuale])
        db.flush()

        # ── Abbonamenti ──────────────────────────────
        today = date.today()

        # Marco: mensile, pagato
        sub1 = Subscription(
            user_id=atleta1.id,
            package_id=pkg_mensile.id,
            data_inizio=today - timedelta(days=10),
            data_scadenza=today + timedelta(days=20),
            pagato=True,
            data_pagamento=today - timedelta(days=10),
        )
        # Laura: trimestrale, pagato
        sub2 = Subscription(
            user_id=atleta2.id,
            package_id=pkg_trimestrale.id,
            data_inizio=today - timedelta(days=30),
            data_scadenza=today + timedelta(days=60),
            pagato=True,
            data_pagamento=today - timedelta(days=30),
        )
        # Giuseppe: mensile, NON pagato (scade tra 5 giorni)
        sub3 = Subscription(
            user_id=atleta3.id,
            package_id=pkg_mensile.id,
            data_inizio=today - timedelta(days=25),
            data_scadenza=today + timedelta(days=5),
            pagato=False,
        )
        db.add_all([sub1, sub2, sub3])
        db.flush()

        # ── Schede Allenamento ────────────────────────
        # Marco: scheda forza
        scheda_marco = WorkoutPlan(
            user_id=atleta1.id,
            nome="Scheda A - Forza",
            data_scadenza=today + timedelta(days=30),
            note="Aumentare il peso progressivamente ogni settimana",
        )
        db.add(scheda_marco)
        db.flush()

        esercizi_marco = [
            WorkoutExercise(workout_plan_id=scheda_marco.id, nome_esercizio="Panca piana", gruppo_muscolare="Petto", serie=4, ripetizioni="6-8", peso_kg=70, riposo_secondi=120, ordine=1),
            WorkoutExercise(workout_plan_id=scheda_marco.id, nome_esercizio="Squat", gruppo_muscolare="Gambe", serie=4, ripetizioni="6-8", peso_kg=80, riposo_secondi=150, ordine=2),
            WorkoutExercise(workout_plan_id=scheda_marco.id, nome_esercizio="Trazioni", gruppo_muscolare="Dorso", serie=4, ripetizioni="8-10", riposo_secondi=120, ordine=3),
            WorkoutExercise(workout_plan_id=scheda_marco.id, nome_esercizio="Military press", gruppo_muscolare="Spalle", serie=3, ripetizioni="8-10", peso_kg=40, riposo_secondi=90, ordine=4),
            WorkoutExercise(workout_plan_id=scheda_marco.id, nome_esercizio="Curl bilanciere", gruppo_muscolare="Bicipiti", serie=3, ripetizioni="10-12", peso_kg=30, riposo_secondi=60, ordine=5),
        ]
        db.add_all(esercizi_marco)

        # Laura: scheda ipertrofia
        scheda_laura = WorkoutPlan(
            user_id=atleta2.id,
            nome="Scheda B - Ipertrofia",
            data_scadenza=today + timedelta(days=45),
            note="Focus su volume e tempo sotto tensione",
        )
        db.add(scheda_laura)
        db.flush()

        esercizi_laura = [
            WorkoutExercise(workout_plan_id=scheda_laura.id, nome_esercizio="Hip thrust", gruppo_muscolare="Glutei", serie=4, ripetizioni="12-15", peso_kg=60, riposo_secondi=90, ordine=1),
            WorkoutExercise(workout_plan_id=scheda_laura.id, nome_esercizio="Leg press", gruppo_muscolare="Gambe", serie=4, ripetizioni="10-12", peso_kg=100, riposo_secondi=90, ordine=2),
            WorkoutExercise(workout_plan_id=scheda_laura.id, nome_esercizio="Lat machine", gruppo_muscolare="Dorso", serie=3, ripetizioni="12-15", peso_kg=35, riposo_secondi=60, ordine=3),
            WorkoutExercise(workout_plan_id=scheda_laura.id, nome_esercizio="Chest press", gruppo_muscolare="Petto", serie=3, ripetizioni="12-15", peso_kg=20, riposo_secondi=60, ordine=4),
            WorkoutExercise(workout_plan_id=scheda_laura.id, nome_esercizio="Crunch", gruppo_muscolare="Addome", serie=3, ripetizioni="20", riposo_secondi=45, ordine=5),
        ]
        db.add_all(esercizi_laura)

        # Giuseppe: scheda scaduta (da rinnovare)
        scheda_giuseppe = WorkoutPlan(
            user_id=atleta3.id,
            nome="Scheda C - Full Body",
            data_scadenza=today + timedelta(days=3),
            note="Scheda in scadenza — da aggiornare",
        )
        db.add(scheda_giuseppe)
        db.flush()

        esercizi_giuseppe = [
            WorkoutExercise(workout_plan_id=scheda_giuseppe.id, nome_esercizio="Stacco da terra", gruppo_muscolare="Gambe/Dorso", serie=4, ripetizioni="8", peso_kg=90, riposo_secondi=120, ordine=1),
            WorkoutExercise(workout_plan_id=scheda_giuseppe.id, nome_esercizio="Panca inclinata", gruppo_muscolare="Petto", serie=3, ripetizioni="10", peso_kg=50, riposo_secondi=90, ordine=2),
            WorkoutExercise(workout_plan_id=scheda_giuseppe.id, nome_esercizio="Rematore", gruppo_muscolare="Dorso", serie=3, ripetizioni="10", peso_kg=45, riposo_secondi=90, ordine=3),
            WorkoutExercise(workout_plan_id=scheda_giuseppe.id, nome_esercizio="Affondi", gruppo_muscolare="Gambe", serie=3, ripetizioni="12 per gamba", peso_kg=20, riposo_secondi=60, ordine=4),
        ]
        db.add_all(esercizi_giuseppe)

        db.commit()
        print("✅ Database popolato con successo!")
        print()
        print("👤 Admin:")
        print("   Email: admin@safgym.it")
        print("   Password: admin123")
        print()
        print("🏋️ Atleti:")
        print("   Marco Rossi — marco.rossi@email.com — password123 (mensile, pagato)")
        print("   Laura Bianchi — laura.bianchi@email.com — password123 (trimestrale, pagato)")
        print("   Giuseppe Verdi — giuseppe.verdi@email.com — password123 (mensile, NON pagato)")

    except Exception as e:
        db.rollback()
        print(f"❌ Errore: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
