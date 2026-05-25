import { CheckCircle2, XCircle, Info } from "lucide-react";
import type { Toast } from "../types";
import { cn } from "../utils/cn";

export function ToastHost({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex min-w-[260px] max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ring-1 animate-in slide-in-from-bottom fade-in duration-200",
            t.kind === "success" &&
              "bg-white text-emerald-900 ring-emerald-200",
            t.kind === "error" && "bg-white text-rose-900 ring-rose-200",
            t.kind === "info" && "bg-white text-stone-800 ring-stone-200",
          )}
        >
          {t.kind === "success" && (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          )}
          {t.kind === "error" && (
            <XCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
          )}
          {t.kind === "info" && (
            <Info size={18} className="mt-0.5 shrink-0 text-indigo-600" />
          )}
          <span className="font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
