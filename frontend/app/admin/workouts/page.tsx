"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, getWorkouts, createWorkout, deleteWorkout, getUsers, type WorkoutPlan, type User, type Exercise } from "@/lib/api";

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ user_id: "", nome: "", data_scadenza: "", note: "" });
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([
    { nome_esercizio: "", gruppo_muscolare: "", serie: 3, ripetizioni: "10", peso_kg: undefined, riposo_secondi: 90, ordine: 0 },
  ]);

  const load = async () => {
    try {
      const [w, u] = await Promise.all([getWorkouts(), getUsers()]);
      setWorkouts(w); setUsers(u);
    } catch { router.replace("/login"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.ruolo !== "admin") { router.replace("/login"); return; }
    load();
  }, [router]);

  const addEx = () => setExercises([...exercises, { nome_esercizio: "", gruppo_muscolare: "", serie: 3, ripetizioni: "10", riposo_secondi: 90, ordine: exercises.length }]);
  const removeEx = (i: number) => setExercises(exercises.filter((_, idx) => idx !== i));
  const updateEx = (i: number, k: string, v: string | number | undefined) => {
    const u = [...exercises]; (u[i] as Record<string, unknown>)[k] = v; setExercises(u);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWorkout({ ...form, note: form.note || undefined, exercises: exercises.map((ex, i) => ({ ...ex, ordine: i })) });
    setShowCreate(false);
    setForm({ user_id: "", nome: "", data_scadenza: "", note: "" });
    setExercises([{ nome_esercizio: "", serie: 3, ripetizioni: "10", riposo_secondi: 90, ordine: 0 }]);
    load();
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Eliminare "${nome}"?`)) return;
    await deleteWorkout(id); load();
  };

  const getUserName = (uid: string) => { const u = users.find(u => u.id === uid); return u ? `${u.nome} ${u.cognome}` : "—"; };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent-lime)] border-t-transparent rounded-full animate-spin" /></div>;

  const inputCls = "w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-dim)] text-sm focus:outline-none focus:border-[var(--accent-lime)]";
  const smInputCls = "w-full px-2 py-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-dim)] text-xs focus:outline-none focus:border-[var(--accent-lime)]";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-28 md:pb-8 pt-24 md:pt-8 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold">Schede Allenamento</h1>
              <p className="text-[var(--text-secondary)] mt-1">{workouts.length} schede totali</p>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-emerald)] text-[var(--bg-primary)] font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98]">+ Nuova Scheda</button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} className="glass rounded-2xl p-6 mb-6 animate-fade-in">
              <h3 className="font-semibold mb-4">Nuova Scheda</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><label className="text-xs text-[var(--text-muted)] block mb-1">Atleta</label><select value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} required className={inputCls}><option value="">Seleziona...</option>{users.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>)}</select></div>
                <div><label className="text-xs text-[var(--text-muted)] block mb-1">Nome</label><input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required placeholder="Scheda A - Forza" className={inputCls}/></div>
                <div><label className="text-xs text-[var(--text-muted)] block mb-1">Scadenza</label><input type="date" value={form.data_scadenza} onChange={e => setForm({...form, data_scadenza: e.target.value})} required className={inputCls}/></div>
                <div><label className="text-xs text-[var(--text-muted)] block mb-1">Note</label><input value={form.note} onChange={e => setForm({...form, note: e.target.value})} className={inputCls}/></div>
              </div>
              <h4 className="text-sm font-medium mb-3">Esercizi</h4>
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div key={i} className="flex flex-wrap gap-2 items-end bg-[var(--bg-primary)] rounded-xl p-3">
                    <div className="flex-1 min-w-[140px]"><label className="text-[10px] text-[var(--text-muted)] block">Esercizio</label><input value={ex.nome_esercizio||""} onChange={e=>updateEx(i,"nome_esercizio",e.target.value)} required className={smInputCls}/></div>
                    <div className="w-20"><label className="text-[10px] text-[var(--text-muted)] block">Gruppo</label><input value={ex.gruppo_muscolare||""} onChange={e=>updateEx(i,"gruppo_muscolare",e.target.value)} className={smInputCls}/></div>
                    <div className="w-14"><label className="text-[10px] text-[var(--text-muted)] block">Serie</label><input type="number" value={ex.serie||3} onChange={e=>updateEx(i,"serie",+e.target.value)} className={smInputCls}/></div>
                    <div className="w-14"><label className="text-[10px] text-[var(--text-muted)] block">Reps</label><input value={ex.ripetizioni||""} onChange={e=>updateEx(i,"ripetizioni",e.target.value)} className={smInputCls}/></div>
                    <div className="w-14"><label className="text-[10px] text-[var(--text-muted)] block">Kg</label><input type="number" value={ex.peso_kg||""} onChange={e=>updateEx(i,"peso_kg",e.target.value?+e.target.value:undefined)} className={smInputCls}/></div>
                    <div className="w-14"><label className="text-[10px] text-[var(--text-muted)] block">Riposo</label><input type="number" value={ex.riposo_secondi||90} onChange={e=>updateEx(i,"riposo_secondi",+e.target.value)} className={smInputCls}/></div>
                    {exercises.length > 1 && <button type="button" onClick={()=>removeEx(i)} className="text-red-400 hover:text-red-300 px-2 py-1">✕</button>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addEx} className="text-sm text-[var(--accent-lime)] hover:underline mt-3">+ Aggiungi esercizio</button>
              <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-dim)]">
                <button type="submit" className="px-5 py-2 rounded-lg bg-[var(--accent-lime)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-90">Crea Scheda</button>
                <button type="button" onClick={()=>setShowCreate(false)} className="px-5 py-2 rounded-lg border border-[var(--border-dim)] text-sm text-[var(--text-secondary)]">Annulla</button>
              </div>
            </form>
          )}

          <div className="space-y-4 stagger">
            {workouts.map(w => {
              const expired = new Date(w.data_scadenza) < new Date();
              return (
                <div key={w.id} className="glass rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{w.nome}</h3>
                      <p className="text-sm text-[var(--text-muted)]">Atleta: <span className="text-[var(--text-primary)]">{getUserName(w.user_id)}</span> • Scade: <span className={expired?"text-red-400":""}>{new Date(w.data_scadenza).toLocaleDateString("it-IT")}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${expired?"bg-red-500/10 text-red-400":"bg-emerald-500/10 text-emerald-400"}`}>{expired?"Scaduta":"Attiva"}</span>
                      <button onClick={()=>handleDelete(w.id,w.nome)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg></button>
                    </div>
                  </div>
                  {w.note && <p className="text-xs text-[var(--text-muted)] mb-3 italic">{w.note}</p>}
                  {w.exercises.length > 0 && (
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-xs min-w-[500px]"><thead><tr className="text-[var(--text-muted)] border-b border-[var(--border-dim)]"><th className="text-left py-2 whitespace-nowrap">#</th><th className="text-left py-2 whitespace-nowrap">Esercizio</th><th className="text-left py-2 whitespace-nowrap">Gruppo</th><th className="text-center py-2 whitespace-nowrap">Serie</th><th className="text-center py-2 whitespace-nowrap">Reps</th><th className="text-center py-2 whitespace-nowrap">Peso</th><th className="text-center py-2 whitespace-nowrap">Riposo</th></tr></thead><tbody>
                        {w.exercises.sort((a,b)=>a.ordine-b.ordine).map((ex,i) => (
                          <tr key={ex.id} className="border-b border-[var(--border-dim)]/30"><td className="py-2 text-[var(--text-muted)] whitespace-nowrap">{i+1}</td><td className="py-2 font-medium whitespace-nowrap">{ex.nome_esercizio}</td><td className="py-2 text-[var(--text-muted)] whitespace-nowrap">{ex.gruppo_muscolare||"—"}</td><td className="py-2 text-center whitespace-nowrap">{ex.serie}</td><td className="py-2 text-center whitespace-nowrap">{ex.ripetizioni}</td><td className="py-2 text-center whitespace-nowrap">{ex.peso_kg?`${ex.peso_kg}kg`:"—"}</td><td className="py-2 text-center whitespace-nowrap">{ex.riposo_secondi?`${ex.riposo_secondi}s`:"—"}</td></tr>
                        ))}
                      </tbody></table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
