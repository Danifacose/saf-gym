"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, getUserDashboard, type UserDashboard } from "@/lib/api";

export default function WorkoutPage() {
  const router = useRouter();
  const [data, setData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace("/login"); return; }
    getUserDashboard().then(setData).catch(() => router.replace("/login")).finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent-lime)] border-t-transparent rounded-full animate-spin"/></div>;

  const scheda = data.scheda_attiva;
  const expired = scheda && new Date(scheda.data_scadenza) < new Date();

  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 md:ml-64 pb-28 md:pb-8 pt-24 md:pt-8 p-4 md:p-8"><div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold">La mia Scheda</h1>
          <p className="text-[var(--text-secondary)] mt-1">Il tuo programma di allenamento</p>
        </div>

        {scheda ? (
          <div className="animate-fade-in">
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{scheda.nome}</h2>
                  {scheda.note && <p className="text-sm text-[var(--text-muted)] italic mt-1">{scheda.note}</p>}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${expired ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {expired ? "Scaduta" : "Attiva"}
                  </span>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    Scade: {new Date(scheda.data_scadenza).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 stagger">
              {scheda.exercises.sort((a, b) => a.ordine - b.ordine).map((ex, i) => (
                <div key={ex.id} className="glass rounded-2xl p-5 hover:bg-[var(--bg-card-hover)] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-lime)] to-[var(--accent-emerald)] flex items-center justify-center text-[var(--bg-primary)] font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{ex.nome_esercizio}</h3>
                      {ex.gruppo_muscolare && <p className="text-xs text-[var(--accent-lime)]">{ex.gruppo_muscolare}</p>}
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="text-lg font-bold">{ex.serie}</p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase">Serie</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{ex.ripetizioni}</p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase">Reps</p>
                      </div>
                      {ex.peso_kg && (
                        <div>
                          <p className="text-lg font-bold">{ex.peso_kg}<span className="text-xs font-normal">kg</span></p>
                          <p className="text-[10px] text-[var(--text-muted)] uppercase">Peso</p>
                        </div>
                      )}
                      {ex.riposo_secondi && (
                        <div>
                          <p className="text-lg font-bold">{ex.riposo_secondi}<span className="text-xs font-normal">s</span></p>
                          <p className="text-[10px] text-[var(--text-muted)] uppercase">Riposo</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {ex.note && <p className="text-xs text-[var(--text-muted)] mt-2 ml-14 italic">{ex.note}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-6xl mb-4">🏋️</p>
            <p className="text-[var(--text-muted)]">Nessuna scheda attiva al momento</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Contatta il tuo trainer per avere una nuova scheda</p>
          </div>
        )}
      </div></main>
    </div>
  );
}
