/**
 * API Client — Gestisce tutte le chiamate al backend FastAPI.
 * Centralizza autenticazione, error handling e base URL.
 */

const API_BASE = "https://saf-gym.onrender.com";
// ── Helper ───────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("saf_gym_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token scaduto o invalido
    if (typeof window !== "undefined") {
      localStorage.removeItem("saf_gym_token");
      localStorage.removeItem("saf_gym_user");
      window.location.href = "/login";
    }
    throw new Error("Non autorizzato");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Errore sconosciuto" }));
    throw new Error(error.detail || `Errore ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
  ruolo: string;
  user_id: string;
  nome: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("saf_gym_token", data.access_token);
  localStorage.setItem(
    "saf_gym_user",
    JSON.stringify({ id: data.user_id, nome: data.nome, ruolo: data.ruolo })
  );
  return data;
}

export function logout() {
  localStorage.removeItem("saf_gym_token");
  localStorage.removeItem("saf_gym_user");
  window.location.href = "/login";
}

export function getCurrentUser(): { id: string; nome: string; ruolo: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("saf_gym_user");
  return raw ? JSON.parse(raw) : null;
}

export function getMe() {
  return request<User>("/auth/me");
}

// ── Types ────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  data_nascita?: string;
  telefono?: string;
  codice_fiscale?: string;
  indirizzo?: string;
  data_iscrizione: string;
  ruolo: string;
  attivo: boolean;
}

export interface Package {
  id: string;
  nome: string;
  durata_giorni: number;
  prezzo: number;
  descrizione?: string;
  attivo: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  package_id: string;
  data_inizio: string;
  data_scadenza: string;
  pagato: boolean;
  data_pagamento?: string;
  note?: string;
  user?: User;
  package?: Package;
}

export interface Exercise {
  id: string;
  nome_esercizio: string;
  gruppo_muscolare?: string;
  serie: number;
  ripetizioni: string;
  peso_kg?: number;
  riposo_secondi?: number;
  note?: string;
  ordine: number;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  nome: string;
  data_creazione: string;
  data_scadenza: string;
  note?: string;
  attivo: boolean;
  exercises: Exercise[];
}

export interface AdminDashboard {
  totale_atleti: number;
  atleti_attivi: number;
  pagamenti_in_regola: number;
  pagamenti_scaduti: number;
  schede_in_scadenza: number;
  abbonamenti_in_scadenza: number;
}

export interface UserDashboard {
  user: User;
  abbonamento_attivo?: Subscription;
  scheda_attiva?: WorkoutPlan;
  giorni_al_pagamento?: number;
  giorni_scadenza_scheda?: number;
}

// ── API Calls ────────────────────────────────────────

// Users
export const getUsers = (attivo?: boolean) =>
  request<User[]>(`/users${attivo !== undefined ? `?attivo=${attivo}` : ""}`);
export const getUser = (id: string) => request<User>(`/users/${id}`);
export const createUser = (data: Partial<User> & { password: string }) =>
  request<User>("/users", { method: "POST", body: JSON.stringify(data) });
export const updateUser = (id: string, data: Partial<User>) =>
  request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteUser = (id: string) =>
  request(`/users/${id}`, { method: "DELETE" });

// Packages
export const getPackages = () => request<Package[]>("/packages");
export const createPackage = (data: Partial<Package>) =>
  request<Package>("/packages", { method: "POST", body: JSON.stringify(data) });
export const updatePackage = (id: string, data: Partial<Package>) =>
  request<Package>(`/packages/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePackage = (id: string) =>
  request(`/packages/${id}`, { method: "DELETE" });

// Subscriptions
export const getSubscriptions = (userId?: string, pagato?: boolean) => {
  const params = new URLSearchParams();
  if (userId) params.set("user_id", userId);
  if (pagato !== undefined) params.set("pagato", String(pagato));
  const qs = params.toString();
  return request<Subscription[]>(`/subscriptions${qs ? `?${qs}` : ""}`);
};
export const getAdminDashboard = () => request<AdminDashboard>("/subscriptions/dashboard");
export const createSubscription = (data: Partial<Subscription>) =>
  request<Subscription>("/subscriptions", { method: "POST", body: JSON.stringify(data) });
export const updateSubscription = (id: string, data: Partial<Subscription>) =>
  request<Subscription>(`/subscriptions/${id}`, { method: "PUT", body: JSON.stringify(data) });

// Workouts
export const getUserDashboard = () => request<UserDashboard>("/workouts/my-dashboard");
export const getWorkouts = (userId?: string) =>
  request<WorkoutPlan[]>(`/workouts${userId ? `?user_id=${userId}` : ""}`);
export const getWorkout = (id: string) => request<WorkoutPlan>(`/workouts/${id}`);
export const createWorkout = (data: {
  user_id: string;
  nome: string;
  data_scadenza: string;
  note?: string;
  exercises: Partial<Exercise>[];
}) => request<WorkoutPlan>("/workouts", { method: "POST", body: JSON.stringify(data) });
export const updateWorkout = (id: string, data: Partial<WorkoutPlan>) =>
  request<WorkoutPlan>(`/workouts/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteWorkout = (id: string) =>
  request(`/workouts/${id}`, { method: "DELETE" });
export const addExercise = (planId: string, data: Partial<Exercise>) =>
  request<Exercise>(`/workouts/${planId}/exercises`, { method: "POST", body: JSON.stringify(data) });
export const updateExercise = (id: string, data: Partial<Exercise>) =>
  request<Exercise>(`/workouts/exercises/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteExercise = (id: string) =>
  request(`/workouts/exercises/${id}`, { method: "DELETE" });
