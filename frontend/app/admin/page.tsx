"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, getAdminDashboard, type AdminDashboard } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.ruolo !== "admin") {
      router.replace("/login");
      return;
    }
    getAdminDashboard()
      .then(setData)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-lime)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Atleti Totali",
      value: data?.totale_atleti || 0,
      icon: "👥",
      color: "var(--accent-blue)",
    },
    {
      label: "Atleti Attivi",
      value: data?.atleti_attivi || 0,
      icon: "🏋️",
      color: "var(--accent-lime)",
    },
    {
      label: "Pagamenti OK",
      value: data?.pagamenti_in_regola || 0,
      icon: "✅",
      color: "var(--accent-emerald)",
    },
    {
      label: "Da Pagare",
      value: data?.pagamenti_scaduti || 0,
      icon: "⚠️",
      color: "var(--accent-red)",
      alert: (data?.pagamenti_scaduti || 0) > 0,
    },
    {
      label: "Schede in Scadenza",
      value: data?.schede_in_scadenza || 0,
      icon: "📋",
      color: "var(--accent-amber)",
      alert: (data?.schede_in_scadenza || 0) > 0,
    },
    {
      label: "Abbonamenti in Scadenza",
      value: data?.abbonamenti_in_scadenza || 0,
      icon: "🔔",
      color: "var(--accent-amber)",
      alert: (data?.abbonamenti_in_scadenza || 0) > 0,
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-28 md:pb-8 pt-24 md:pt-8 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Panoramica della tua palestra
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                  stat.alert ? "glow-red border-red-500/20" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[var(--text-muted)] text-sm mb-1">
                      {stat.label}
                    </p>
                    <p
                      className="text-4xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <button
              onClick={() => router.push("/admin/athletes")}
              className="glass rounded-2xl p-6 text-left hover:bg-[var(--bg-card-hover)] transition-all duration-300 group"
            >
              <h3 className="font-semibold mb-1 group-hover:text-[var(--accent-lime)] transition-colors">
                Gestisci Atleti →
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Visualizza, crea e modifica le schede dei tuoi atleti
              </p>
            </button>
            <button
              onClick={() => router.push("/admin/workouts")}
              className="glass rounded-2xl p-6 text-left hover:bg-[var(--bg-card-hover)] transition-all duration-300 group"
            >
              <h3 className="font-semibold mb-1 group-hover:text-[var(--accent-lime)] transition-colors">
                Schede Allenamento →
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Crea e assegna schede personalizzate
              </p>
            </button>
            <button
              onClick={() => router.push("/admin/packages")}
              className="glass rounded-2xl p-6 text-left hover:bg-[var(--bg-card-hover)] transition-all duration-300 group"
            >
              <h3 className="font-semibold mb-1 group-hover:text-[var(--accent-lime)] transition-colors">
                Pacchetti →
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Gestisci i tipi di abbonamento disponibili
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
