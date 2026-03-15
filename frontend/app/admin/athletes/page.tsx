"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  getCurrentUser,
  getUsers,
  createUser,
  deleteUser,
  getSubscriptions,
  type User,
  type Subscription,
} from "@/lib/api";

export default function AthletesPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [subs, setSubs] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nome: "", cognome: "", email: "", password: "", telefono: "" });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [u, s] = await Promise.all([getUsers(), getSubscriptions()]);
      setUsers(u);
      // Mappa l'abbonamento più recente per utente
      const subMap: Record<string, Subscription> = {};
      s.forEach((sub) => {
        if (!subMap[sub.user_id] || sub.data_scadenza > subMap[sub.user_id].data_scadenza) {
          subMap[sub.user_id] = sub;
        }
      });
      setSubs(subMap);
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.ruolo !== "admin") { router.replace("/login"); return; }
    load();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createUser({ ...form });
      setShowCreate(false);
      setForm({ nome: "", cognome: "", email: "", password: "", telefono: "" });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore");
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Eliminare ${nome}?`)) return;
    await deleteUser(id);
    load();
  };

  if (loading) {
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold">Atleti</h1>
              <p className="text-[var(--text-secondary)] mt-1">
                {users.length} atleti registrati
              </p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-emerald)] text-[var(--bg-primary)] font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
            >
              + Nuovo Atleta
            </button>
          </div>

          {/* Create form */}
          {showCreate && (
            <form onSubmit={handleCreate} className="glass rounded-2xl p-6 mb-6 animate-fade-in">
              <h3 className="font-semibold mb-4">Nuovo Atleta</h3>
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: "nome", label: "Nome", type: "text" },
                  { key: "cognome", label: "Cognome", type: "text" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "password", label: "Password", type: "password" },
                  { key: "telefono", label: "Telefono", type: "tel" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-[var(--text-muted)] mb-1 block">{field.label}</label>
                    <input
                      type={field.type}
                      required={field.key !== "telefono"}
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-dim)] text-sm focus:outline-none focus:border-[var(--accent-lime)] transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="px-5 py-2 rounded-lg bg-[var(--accent-lime)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-90 transition-all">
                  Crea
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-lg border border-[var(--border-dim)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-all">
                  Annulla
                </button>
              </div>
            </form>
          )}

          {/* Athletes table */}
          <div className="glass rounded-2xl overflow-x-auto animate-fade-in">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--border-dim)]">
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Atleta</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Contatti</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Abbonamento</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Pagamento</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Azioni</th>
                </tr>
              </thead>
              <tbody className="stagger">
                {users.map((user) => {
                  const sub = subs[user.id];
                  const isExpired = sub && new Date(sub.data_scadenza) < new Date();
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-[var(--border-dim)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/athletes/${user.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-lime)] to-[var(--accent-emerald)] flex items-center justify-center text-[var(--bg-primary)] text-sm font-bold shrink-0">
                            {user.nome[0]}{user.cognome[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.nome} {user.cognome}</p>
                            <p className="text-xs text-[var(--text-muted)]">
                              dal {new Date(user.data_iscrizione).toLocaleDateString("it-IT")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm">{user.email}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user.telefono || "—"}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sub ? (
                          <div>
                            <p className="text-sm">{sub.package?.nome || "—"}</p>
                            <p className={`text-xs ${isExpired ? "text-red-400" : "text-[var(--text-muted)]"}`}>
                              {isExpired ? "Scaduto" : `Scade il ${new Date(sub.data_scadenza).toLocaleDateString("it-IT")}`}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Nessuno</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sub ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            sub.pagato
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sub.pagato ? "bg-emerald-400" : "bg-red-400"}`} />
                            {sub.pagato ? "Pagato" : "Non pagato"}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(user.id, `${user.nome} ${user.cognome}`); }}
                          className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1"
                          title="Elimina"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-[var(--text-muted)]">
                Nessun atleta registrato. Clicca &quot;Nuovo Atleta&quot; per aggiungerne uno.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
