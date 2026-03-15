"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, getUserDashboard, type UserDashboard } from "@/lib/api";

export default function UserDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace("/login"); return; }
    if (u.ruolo === "admin") { router.replace("/admin"); return; }
    getUserDashboard().then(setData).catch(() => router.replace("/login")).finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent-lime)] border-t-transparent rounded-full animate-spin"/></div>;

  const sub = data.abbonamento_attivo;
  const scheda = data.scheda_attiva;

  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 md:ml-64 pb-28 md:pb-8 pt-24 md:pt-8 p-4 md:p-8"><div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold">Ciao, {data.user.nome}! 👋</h1>
          <p className="text-[var(--text-secondary)] mt-1">Ecco la tua situazione</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 stagger">
          {/* Abbonamento */}
          <div className={`glass rounded-2xl p-6 ${sub && !sub.pagato ? "glow-red" : "animate-pulse-glow"}`}>
            <h3 className="text-sm text-[var(--text-muted)] mb-3">📋 Abbonamento</h3>
            {sub ? (<>
              <p className="text-xl font-bold mb-1">{sub.package?.nome || "—"}</p>
              <p className="text-sm text-[var(--text-muted)]">Scade il {new Date(sub.data_scadenza).toLocaleDateString("it-IT")}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.pagato ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {sub.pagato ? "✅ Pagato" : "⚠️ Non pagato"}
                </span>
                {data.giorni_al_pagamento !== null && data.giorni_al_pagamento !== undefined && (
                  <span className="text-xs text-[var(--text-muted)]">{data.giorni_al_pagamento} giorni rimanenti</span>
                )}
              </div>
            </>) : <p className="text-[var(--text-muted)] text-sm">Nessun abbonamento attivo</p>}
          </div>

          {/* Scheda */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm text-[var(--text-muted)] mb-3">🏋️ Scheda Allenamento</h3>
            {scheda ? (<>
              <p className="text-xl font-bold mb-1">{scheda.nome}</p>
              <p className="text-sm text-[var(--text-muted)]">Scade il {new Date(scheda.data_scadenza).toLocaleDateString("it-IT")}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-[var(--text-muted)]">{scheda.exercises.length} esercizi</span>
                {data.giorni_scadenza_scheda !== null && data.giorni_scadenza_scheda !== undefined && (
                  <span className={`text-xs ${data.giorni_scadenza_scheda <= 7 ? "text-amber-400" : "text-[var(--text-muted)]"}`}>
                    {data.giorni_scadenza_scheda <= 0 ? "⚠️ Scaduta" : `${data.giorni_scadenza_scheda} giorni rimanenti`}
                  </span>
                )}
              </div>
              <button onClick={() => router.push("/dashboard/workout")} className="mt-4 text-sm text-[var(--accent-lime)] hover:underline">Vedi scheda completa →</button>
            </>) : <p className="text-[var(--text-muted)] text-sm">Nessuna scheda attiva</p>}
          </div>
        </div>

        {/* Info personali */}
        <div className="glass rounded-2xl p-6 animate-fade-in">
          <h3 className="text-sm text-[var(--text-muted)] mb-4">👤 Le tue informazioni</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[var(--text-muted)]">Nome:</span> <span className="ml-2">{data.user.nome} {data.user.cognome}</span></div>
            <div><span className="text-[var(--text-muted)]">Email:</span> <span className="ml-2">{data.user.email}</span></div>
            <div><span className="text-[var(--text-muted)]">Telefono:</span> <span className="ml-2">{data.user.telefono || "—"}</span></div>
            <div><span className="text-[var(--text-muted)]">Iscritto dal:</span> <span className="ml-2">{new Date(data.user.data_iscrizione).toLocaleDateString("it-IT")}</span></div>
          </div>
        </div>
      </div></main>
    </div>
  );
}
