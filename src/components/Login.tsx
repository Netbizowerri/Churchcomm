import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, Sparkles, Lock, AlertTriangle } from "lucide-react";
import { Button, Input } from "./ui";
import type { Role } from "../types";

export function Login({
  onLogin,
  failedAttempts,
  lockedUntil,
}: {
  onLogin: (email: string, password: string, remember: boolean) => {
    ok: boolean;
    error?: string;
  };
  failedAttempts: number;
  lockedUntil: number | null;
}) {
  const [email, setEmail] = useState("admin@churchcomm.ng");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string>("");
  const [lockedMsg, setLockedMsg] = useState<string>("");
  const [role, setRole] = useState<Role | null>(null);

  // Lockout display
  useEffect(() => {
    if (lockedUntil && lockedUntil > Date.now()) {
      const mins = Math.ceil((lockedUntil - Date.now()) / 60000);
      setLockedMsg(
        `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
      );
    } else {
      setLockedMsg("");
    }
  }, [lockedUntil]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (lockedUntil && lockedUntil > Date.now()) {
      const mins = Math.ceil((lockedUntil - Date.now()) / 60000);
      setLockedMsg(
        `Account locked. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
      );
      return;
    }
    const result = onLogin(email.trim().toLowerCase(), password, remember);
    if (!result.ok) {
      setError(result.error || "Invalid credentials");
      setRole(null);
    }
  };

  const remainingAttempts = 5 - failedAttempts;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-stone-50">
      {/* Brand side */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 p-12 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-violet-400 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <ShieldCheck size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">CHURCHCOMM</div>
              <div className="text-xs text-indigo-200">Admin Portal</div>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-amber-200 ring-1 ring-white/20 backdrop-blur">
            <Sparkles size={14} />
            Built for Nigerian churches
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
            One message.<br />
            <span className="text-amber-300">Every member.</span><br />
            Every channel.
          </h1>
          <p className="max-w-md text-base text-indigo-100">
            Broadcast announcements, prayer alerts, and event reminders to your
            entire congregation over SMS and WhatsApp — instantly.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { k: "160", l: "SMS characters" },
              { k: "4,096", l: "WhatsApp limit" },
              { k: "2×", l: "Channels" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur"
              >
                <div className="text-2xl font-bold text-white">{s.k}</div>
                <div className="text-xs text-indigo-200">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-indigo-200">
          © 2026 ChurchComm. All rights reserved.
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-stone-900">
                CHURCHCOMM
              </div>
              <div className="text-[11px] text-stone-500">Admin Portal</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Sign in to continue to your church dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@churchcomm.ng"
            />
            <div className="relative">
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me (7 days)
              </label>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password reset link would be emailed to " +
                      (email || "your account"),
                  )
                }
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </button>
            </div>

            {lockedMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {lockedMsg}
              </div>
            )}
            {error && !lockedMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">{error}</div>
                  {remainingAttempts > 0 && (
                    <div className="mt-0.5 text-rose-600/80">
                      {remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"}{" "}
                      remaining before a 15-minute lockout.
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                !email ||
                !password ||
                (lockedUntil !== null && lockedUntil > Date.now())
              }
            >
              <Lock size={16} />
              Sign in securely
            </Button>

            {role && (
              <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                Signed in as {role}.
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
