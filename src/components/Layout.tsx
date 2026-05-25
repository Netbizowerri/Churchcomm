import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  History as HistoryIcon,
  FileText,
  Tag,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Menu,
  X,
  Bell,
  Search,
  Settings as SettingsIcon,
} from "lucide-react";
import type { Admin } from "../types";
import type { View } from "../App";
import { cn } from "../utils/cn";

const NAV: { id: View; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "groups", label: "Groups", icon: Tag },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export function AppLayout({
  view,
  setView,
  admin,
  onLogout,
  onReset,
  children,
  activeContactCount,
  broadcastCount,
}: {
  view: View;
  setView: (v: View) => void;
  admin: Admin;
  onLogout: () => void;
  onReset: () => void;
  children: ReactNode;
  activeContactCount: number;
  broadcastCount: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel = {
    super_admin: "Super Admin",
    admin: "Admin",
    viewer: "Viewer",
  }[admin.role];

  const roleTone = {
    super_admin: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    admin: "bg-amber-100 text-amber-700 ring-amber-200",
    viewer: "bg-stone-100 text-stone-700 ring-stone-200",
  }[admin.role];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShieldCheck size={16} />
            </div>
            <span className="text-sm font-bold tracking-tight">CHURCHCOMM</span>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
            roleTone,
          )}
        >
          {roleLabel}
        </span>
      </div>

      {/* Sidebar backdrop (mobile) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight text-stone-900">
                  CHURCHCOMM
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
                  Broadcast Console
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0",
                      active ? "text-indigo-600" : "text-stone-400 group-hover:text-stone-600",
                    )}
                  />
                  <span>{item.label}</span>
                  {item.id === "contacts" && (
                    <span className="ml-auto rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600">
                      {activeContactCount}
                    </span>
                  )}
                  {item.id === "history" && broadcastCount > 0 && (
                    <span className="ml-auto rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {broadcastCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-stone-100 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-stone-50 p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white">
                {admin.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-stone-900">
                  {admin.name}
                </div>
                <div className="truncate text-xs text-stone-500">
                  {admin.email}
                </div>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={onLogout}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"
              >
                <LogOut size={12} />
                Sign out
              </button>
              <button
                onClick={onReset}
                className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-stone-500 ring-1 ring-stone-200 hover:bg-stone-100"
                title="Reset demo data"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="hidden items-center justify-between gap-4 border-b border-stone-200 bg-white/80 px-8 py-4 backdrop-blur lg:flex">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold tracking-tight text-stone-900 capitalize">
                {view}
              </h1>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
                  roleTone,
                )}
              >
                {roleLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  placeholder="Search members, messages…"
                  className="w-72 rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button className="relative rounded-lg p-2 text-stone-500 hover:bg-stone-100">
                <Bell size={18} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
