# Gestione Palestra Saf Gym

## Obiettivo
App gestionale per la palestra Saf Gym con area admin e area utente.

## Stack
- **Backend**: FastAPI + SQLite (`backend/`)
- **Frontend**: Next.js + React + Tailwind CSS (`frontend/`)

## Avvio

### Backend
```bash
cd backend
python3 seed.py        # Popola con dati demo (solo la prima volta)
python3 main.py        # Avvia su http://localhost:8000
```

### Frontend
```bash
cd frontend
npm run dev            # Avvia su http://localhost:3000
```

## Credenziali Demo
- **Admin**: admin@safgym.it / admin123
- **Atleta**: marco.rossi@email.com / password123

## Funzionalità Admin
1. Dashboard con statistiche (atleti, pagamenti, scadenze)
2. Gestione atleti (crea, modifica, elimina)
3. Gestione abbonamenti (assegna, segna pagato)
4. Gestione schede allenamento (crea con esercizi, scadenza)
5. Gestione pacchetti (mensile, trimestrale, annuale)

## Funzionalità Utente
1. Dashboard personale (panoramica)
2. Visualizzazione scheda allenamento
3. Dettaglio abbonamento e stato pagamento

## API Endpoints
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Utente corrente
- `GET/POST/PUT/DELETE /api/users` — CRUD utenti (admin)
- `GET/POST/PUT/DELETE /api/packages` — CRUD pacchetti
- `GET/POST/PUT/DELETE /api/subscriptions` — CRUD abbonamenti
- `GET /api/subscriptions/dashboard` — Stats admin
- `GET/POST/PUT/DELETE /api/workouts` — CRUD schede
- `GET /api/workouts/my-dashboard` — Dashboard utente

## Casi Limite
- Login con email inesistente → errore 401
- Account disattivato → errore 403
- Token scaduto → redirect a login
- Eliminazione pacchetto → soft delete (preserva storico)
