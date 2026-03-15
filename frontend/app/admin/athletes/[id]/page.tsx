"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  getCurrentUser,
  getUser,
  updateUser,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  getWorkouts,
  getPackages,
  type User,
  type Subscription,
  type WorkoutPlan,
  type Package,
} from "@/lib/api";

export default function AthleteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showNewSub, setShowNewSub] = useState(false);
  const [newSub, setNewSub] = useState({ package_id: "", data_inizio: "", pagato: false });

  const load = async () => {
    try {
      const [u, s, w, p] = await Promise.all([
        getUser(userId),
        getSubscriptions(userId),
        getWorkouts(userId),
        getPackages(),
      ]);
      setUser(u);
      setSubs(s);
      setWorkouts(w);
      setPackages(p);
      setEditForm(u);
    } catch {
      router.replace("/admin/athletes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cur = getCurrentUser();
    if (!cur || cur.ruolo !== "admin") { router.replace("/login"); return; }
    load();
  }, [userId, router]);

  const handleSave = async () => {
    if (!user) return;
    await updateUser(user.id, editForm);
    setEditing(false);
    load();
  };

  const handlePay = async (subId: string) => {
    await updateSubscription(subId, {
      pagato: true,
      data_pagamento: new Date().toISOString().split("T")[0],
    });
    load();
  };

  const handleNewSub = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSubscription({
      user_id: userId,
      package_id: newSub.package_id,
      data_inizio: newSub.data_inizio,
      pagato: newSub.pagato,
    });
    setShowNewSub(false);
    setNewSub({ package_id: "", data_inizio: "", pagato: false });
    load();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-lime)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-28 md:pb-8 pt-24 md:pt-8 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back */}
          <button
            onClick={() => router.push("/admin/athletes")}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-6 flex items-center gap-1 transition-colors"
          >
            ← Torna agli atleti
          </button>

          {/* Profile Card */}
          <div className="glass rounded-2xl p-8 mb-6 animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-lime)] to-[var(--accent-emerald)] flex items-center justify-center text-[var(--bg-primary)] text-xl font-bold">
                  {user.nome[0]}{user.cognome[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.nome} {user.cognome}</h1>
                  <p className="text-[var(--text-muted)] text-sm">
                    Iscritto dal {new Date(user.data_iscrizione).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-lg border border-[var(--border-dim)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-all"
              >
                {editing ? "Annulla" : "Modifica"}
              </button>
            </div>

            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "nome", label: "Nome" },
                  { key: "cognome", label: "Cognome" },
                  { key: "email", label: "Email" },
                  { key: "telefono", label: "Telefono" },
                  { key: "codice_fiscale", label: "Codice Fiscale" },
                  { key: "indirizzo", label: "Indirizzo" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-[var(--text-muted)] mb-1 block">{f.label}</label>
                    <input
                      value={(editForm as Record<string, string>)[f.key] || ""}
                      onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-dim)] text-sm focus:outline-none focus:border-[var(--accent-lime)] transition-colors"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-[var(--accent-lime)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-90 transition-all">
                    Salva
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[var(--text-muted)]">Email:</span> <span className="ml-2">{user.email}</span></div>
                <div><span className="text-[var(--text-muted)]">Telefono:</span> <span className="ml-2">{user.telefono || "—"}</span></div>
                <div><span className="text-[var(--text-muted)]">Cod. Fiscale:</span> <span className="ml-2">{user.codice_fiscale || "—"}</span></div>
                <div><span className="text-[var(--text-muted)]">Indirizzo:</span> <span className="ml-2">{user.indirizzo || "—"}</span></div>
                <div><span className="text-[var(--text-muted)]">Data nascita:</span> <span className="ml-2">{user.data_nascita ? new Date(user.data_nascita).toLocaleDateString("it-IT") : "—"}</span></div>
                <div><span className="text-[var(--text-muted)]">Stato:</span> <span className={`ml-2 ${user.attivo ? "text-emerald-400" : "text-red-400"}`}>{user.attivo ? "Attivo" : "Disattivato"}</span></div>
              </div>
            )}
          </div>

          {/* Abbonamenti */}
          <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Abbonamenti</h2>
              <button onClick={() => setShowNewSub(!showNewSub)} className="text-sm text-[var(--accent-lime)] hover:underline">
                + Nuovo abbonamento
              </button>
            </div>

            {showNewSub && (
              <form onSubmit={handleNewSub} className="bg-[var(--bg-primary)] rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Pacchetto</label>
                  <select
                    value={newSub.package_id}
                    onChange={(e) => setNewSub({ ...newSub, package_id: e.target.value })}
                    required
                    className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-dim)] text-sm focus:outline-none focus:border-[var(--accent-lime)]"
                  >
                    <option value="">Seleziona...</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome} — €{p.prezzo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Data inizio</label>
                  <input
                    type="date"
                    value={newSub.data_inizio}
                    onChange={(e) => setNewSub({ ...newSub, data_inizio: e.target.value })}
                    required
                    className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-dim)] text-sm focus:outline-none focus:border-[var(--accent-lime)]"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newSub.pagato} onChange={(e) => setNewSub({ ...newSub, pagato: e.target.checked })} className="rounded" />
                  Pagato
                </label>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--accent-lime)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-90">
                  Aggiungi
                </button>
              </form>
            )}

            <div className="space-y-3">
              {subs.map((sub) => {
                const isExpired = new Date(sub.data_scadenza) < new Date();
                return (
                  <div key={sub.id} className="flex items-center justify-between bg-[var(--bg-primary)] rounded-xl px-5 py-4">
                    <div>
                      <p className="font-medium text-sm">{sub.package?.nome || "Pacchetto"}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(sub.data_inizio).toLocaleDateString("it-IT")} → {new Date(sub.data_scadenza).toLocaleDateString("it-IT")}
                        {isExpired && <span className="text-red-400 ml-2">SCADUTO</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sub.pagato
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {sub.pagato ? "Pagato" : "Non pagato"}
                      </span>
                      {!sub.pagato && (
                        <button
                          onClick={() => handlePay(sub.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
                        >
                          Segna pagato
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {subs.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">Nessun abbonamento</p>
              )}
            </div>
          </div>

          {/* Schede */}
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Schede Allenamento</h2>
            <div className="space-y-3">
              {workouts.map((w) => {
                const isExpired = new Date(w.data_scadenza) < new Date();
                return (
                  <div key={w.id} className="bg-[var(--bg-primary)] rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{w.nome}</p>
                      <span className={`text-xs ${isExpired ? "text-red-400" : w.attivo ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                        {isExpired ? "Scaduta" : w.attivo ? "Attiva" : "Disattivata"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mb-3">
                      Scade: {new Date(w.data_scadenza).toLocaleDateString("it-IT")} • {w.exercises.length} esercizi
                    </p>
                    {w.exercises.length > 0 && (
                      <div className="border-t border-[var(--border-dim)] pt-3 mt-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-[var(--text-muted)]">
                              <th className="text-left py-1">Esercizio</th>
                              <th className="text-left py-1">Gruppo</th>
                              <th className="text-center py-1">Serie</th>
                              <th className="text-center py-1">Reps</th>
                              <th className="text-center py-1">Peso</th>
                              <th className="text-center py-1">Riposo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {w.exercises.sort((a, b) => a.ordine - b.ordine).map((ex) => (
                              <tr key={ex.id} className="border-t border-[var(--border-dim)]/50">
                                <td className="py-1.5 font-medium">{ex.nome_esercizio}</td>
                                <td className="py-1.5 text-[var(--text-muted)]">{ex.gruppo_muscolare || "—"}</td>
                                <td className="py-1.5 text-center">{ex.serie}</td>
                                <td className="py-1.5 text-center">{ex.ripetizioni}</td>
                                <td className="py-1.5 text-center">{ex.peso_kg ? `${ex.peso_kg}kg` : "—"}</td>
                                <td className="py-1.5 text-center">{ex.riposo_secondi ? `${ex.riposo_secondi}s` : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
              {workouts.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">Nessuna scheda</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
