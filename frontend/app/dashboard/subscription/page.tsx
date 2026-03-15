"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, getUserDashboard, type UserDashboard } from "@/lib/api";

export default function SubscriptionPage() {
  const router = useRouter();
  const [data, setData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace("/login"); return; }
    getUserDashboard().then(setData).catch(() => router.replace("/login")).finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent-lime)] border-t-transparent rounded-full animate-spin"/></div>;

  const sub = data.abbonamento_attivo;
  const expired = sub && new Date(sub.data_scadenza) < new Date();

  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 md:ml-64 pb-28 md:pb-8 pt-24 md:pt-8 p-4 md:p-8"><div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold">Il mio Abbonamento</h1>
          <p className="text-[var(--text-secondary)] mt-1">Dettagli del tuo pacchetto</p>
        </div>

        {sub ? (
          <div className="animate-fade-in">
            <div className="glass rounded-2xl p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-1">Pacchetto attuale</p>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-emerald)]">
                    {sub.package?.nome || "—"}
                  </h2>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  expired ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  sub.pagato ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {expired ? "Scaduto" : sub.pagato ? "✅ In regola" : "⚠️ Pagamento richiesto"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--bg-primary)] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--accent-lime)]">€{sub.package?.prezzo?.toFixed(2) || "—"}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Prezzo</p>
                </div>
                <div className="bg-[var(--bg-primary)] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{sub.package?.durata_giorni || "—"}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Giorni totali</p>
                </div>
                <div className="bg-[var(--bg-primary)] rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${data.giorni_al_pagamento !== null && data.giorni_al_pagamento !== undefined && data.giorni_al_pagamento <= 7 ? "text-amber-400" : ""}`}>
                    {data.giorni_al_pagamento ?? "—"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Giorni rimanenti</p>
                </div>
                <div className="bg-[var(--bg-primary)] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{sub.pagato ? "✅" : "❌"}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Pagamento</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm text-[var(--text-muted)] mb-4">Dettagli</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-[var(--border-dim)]">
                  <span className="text-[var(--text-muted)]">Data inizio</span>
                  <span>{new Date(sub.data_inizio).toLocaleDateString("it-IT")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border-dim)]">
                  <span className="text-[var(--text-muted)]">Data scadenza</span>
                  <span className={expired ? "text-red-400 font-medium" : ""}>{new Date(sub.data_scadenza).toLocaleDateString("it-IT")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border-dim)]">
                  <span className="text-[var(--text-muted)]">Stato pagamento</span>
                  <span className={sub.pagato ? "text-emerald-400" : "text-red-400"}>{sub.pagato ? "Pagato" : "Non pagato"}</span>
                </div>
                {sub.data_pagamento && (
                  <div className="flex justify-between py-2 border-b border-[var(--border-dim)]">
                    <span className="text-[var(--text-muted)]">Data pagamento</span>
                    <span>{new Date(sub.data_pagamento).toLocaleDateString("it-IT")}</span>
                  </div>
                )}
                {sub.note && (
                  <div className="flex justify-between py-2">
                    <span className="text-[var(--text-muted)]">Note</span>
                    <span>{sub.note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center animate-fade-in">
            <p className="text-6xl mb-4">💳</p>
            <p className="text-[var(--text-muted)]">Nessun abbonamento attivo</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Contatta la segreteria per attivare un pacchetto</p>
          </div>
        )}
      </div></main>
    </div>
  );
}
