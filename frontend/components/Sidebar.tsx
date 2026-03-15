"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, getCurrentUser } from "@/lib/api";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// Icone SVG inline per evitare dipendenze
const icons = {
  dashboard: (
    <svg className="w-6 h-6 md:w-5 md:h-5 text-current pb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6 md:w-5 md:h-5 text-current pb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  workout: (
    <svg className="w-6 h-6 md:w-5 md:h-5 text-current pb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  ),
  packages: (
    <svg className="w-6 h-6 md:w-5 md:h-5 text-current pb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  subscription: (
    <svg className="w-6 h-6 md:w-5 md:h-5 text-current pb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
};

const adminMenu: SidebarItem[] = [
  { label: "Dashboard", href: "/admin", icon: icons.dashboard },
  { label: "Atleti", href: "/admin/athletes", icon: icons.users },
  { label: "Schede", href: "/admin/workouts", icon: icons.workout },
  { label: "Pacchetti", href: "/admin/packages", icon: icons.packages },
];

const userMenu: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
  { label: "Scheda", href: "/dashboard/workout", icon: icons.workout },
  { label: "Abbonamento", href: "/dashboard/subscription", icon: icons.subscription },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = getCurrentUser();
  const isAdmin = user?.ruolo === "admin";
  const menu = isAdmin ? adminMenu : userMenu;

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-dim)] z-50">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border-dim)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-lime)] to-[var(--accent-emerald)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--bg-primary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight leading-none pt-1">SAF GYM</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {isAdmin ? "Gestionale Admin" : "Area Atleta"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--accent-lime)]/10 text-[var(--accent-lime)] border border-[var(--border-accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-[var(--border-dim)]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-lime)] to-[var(--accent-emerald)] flex items-center justify-center text-[var(--bg-primary)] text-xs font-bold">
              {user?.nome?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nome || "Utente"}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize">{user?.ruolo}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            {icons.logout}
            Esci
          </button>
        </div>
      </aside>

      {/* ─── MOBILE TOP BAR ─── */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[var(--bg-secondary)]/90 backdrop-blur-md border-b border-[var(--border-dim)] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-lime)] to-[var(--accent-emerald)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--bg-primary)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight leading-none text-[var(--accent-lime)]">SAF GYM</h2>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {user?.nome ? `${user.nome} • ${isAdmin ? "Admin" : "Atleta"}` : "Gestionale"}
            </p>
          </div>
        </div>
        <button onClick={logout} className="p-2 text-[var(--text-secondary)] hover:text-red-400 rounded-lg hover:bg-[var(--bg-card)] transition-colors">
           {icons.logout}
        </button>
      </div>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t border-[var(--border-dim)] flex items-center justify-around px-2 z-50 pb-[env(safe-area-inset-bottom)] h-16 shadow-2xl">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-[var(--accent-lime)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-[var(--accent-lime)]/10 scale-110" : ""}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium leading-none ${isActive ? "font-bold text-[var(--accent-lime)]" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
