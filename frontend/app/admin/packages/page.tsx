"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, getPackages, createPackage, updatePackage, deletePackage, type Package } from "@/lib/api";

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nome: "", durata_giorni: 30, prezzo: 0, descrizione: "" });
  const load = async () => { try { setPackages(await getPackages()); } catch { router.replace("/login"); } finally { setLoading(false); } };
  useEffect(() => { const u = getCurrentUser(); if (!u || u.ruolo !== "admin") { router.replace("/login"); return; } load(); }, [router]);

  const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); await createPackage(form); setShowCreate(false); setForm({ nome: "", durata_giorni: 30, prezzo: 0, descrizione: "" }); load(); };
  const handleDelete = async (id: string, nome: string) => { if (!confirm(`Eliminare "${nome}"?`)) return; await deletePackage(id); load(); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent-lime)] border-t-transparent rounded-full animate-spin"/></div>;
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-dim)] text-sm focus:outline-none focus:border-[var(--accent-lime)] transition-colors";

  return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 md:ml-64 pb-28 md:pb-8 pt-24 md:pt-8 p-4 md:p-8"><div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div><h1 className="text-3xl font-bold">Pacchetti</h1><p className="text-[var(--text-secondary)] mt-1">Gestione abbonamenti disponibili</p></div>
          <button onClick={()=>setShowCreate(!showCreate)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-emerald)] text-[var(--bg-primary)] font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98]">+ Nuovo Pacchetto</button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="glass rounded-2xl p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold mb-4">Nuovo Pacchetto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-[var(--text-muted)] block mb-1">Nome</label><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required placeholder="Mensile" className={inputCls}/></div>
              <div><label className="text-xs text-[var(--text-muted)] block mb-1">Durata (giorni)</label><input type="number" value={form.durata_giorni} onChange={e=>setForm({...form,durata_giorni:+e.target.value})} required min={1} className={inputCls}/></div>
              <div><label className="text-xs text-[var(--text-muted)] block mb-1">Prezzo (€)</label><input type="number" value={form.prezzo} onChange={e=>setForm({...form,prezzo:+e.target.value})} required step={0.01} min={0} className={inputCls}/></div>
              <div><label className="text-xs text-[var(--text-muted)] block mb-1">Descrizione</label><input value={form.descrizione} onChange={e=>setForm({...form,descrizione:e.target.value})} placeholder="Opzionale" className={inputCls}/></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="px-5 py-2 rounded-lg bg-[var(--accent-lime)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-90">Crea</button>
              <button type="button" onClick={()=>setShowCreate(false)} className="px-5 py-2 rounded-lg border border-[var(--border-dim)] text-sm text-[var(--text-secondary)]">Annulla</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {packages.map(pkg => (
            <div key={pkg.id} className="glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-lime)] to-[var(--accent-emerald)] flex items-center justify-center text-[var(--bg-primary)] font-bold text-sm">{pkg.durata_giorni}g</div>
                <button onClick={()=>handleDelete(pkg.id,pkg.nome)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <h3 className="text-lg font-bold mb-1">{pkg.nome}</h3>
              <p className="text-3xl font-bold text-[var(--accent-lime)] mb-2">€{pkg.prezzo.toFixed(2)}</p>
              {pkg.descrizione && <p className="text-xs text-[var(--text-muted)]">{pkg.descrizione}</p>}
              <p className="text-xs text-[var(--text-muted)] mt-2">Durata: {pkg.durata_giorni} giorni</p>
            </div>
          ))}
        </div>
        {packages.length === 0 && <div className="text-center py-12 text-[var(--text-muted)] glass rounded-2xl">Nessun pacchetto. Creane uno!</div>}
      </div></main>
    </div>
  );
}
