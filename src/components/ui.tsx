import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[size];

  return (
<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
        <div
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />
      <div
        className={cn(
          "relative w-full rounded-2xl bg-white shadow-2xl ring-1 ring-stone-200",
          width,
        )}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-stone-100 bg-stone-50/50 px-6 py-3 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 disabled:bg-stone-300 disabled:shadow-none",
    secondary:
      "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 disabled:bg-stone-50 disabled:text-stone-400",
    ghost:
      "text-stone-600 hover:bg-stone-100 disabled:text-stone-400",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 disabled:bg-stone-300",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  hint,
  className,
  ...props
}: {
  label?: string;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-stone-600">
          {label}
        </span>
      )}
      <input
        {...props}
        className={cn(
          "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-stone-50 disabled:text-stone-500",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
          className,
        )}
      />
      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
      {hint && !error && (
        <span className="mt-1 block text-xs text-stone-500">{hint}</span>
      )}
    </label>
  );
}

export function TextArea({
  label,
  error,
  className,
  ...props
}: {
  label?: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-stone-600">
          {label}
        </span>
      )}
      <textarea
        {...props}
        className={cn(
          "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
          className,
        )}
      />
      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
    </label>
  );
}

export function Select({
  label,
  children,
  className,
  ...props
}: {
  label?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-stone-600">
          {label}
        </span>
      )}
      <select
        {...props}
        className={cn(
          "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          className,
        )}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({
  children,
  tone = "stone",
}: {
  children: ReactNode;
  tone?: "stone" | "indigo" | "emerald" | "amber" | "rose" | "sky";
}) {
  const tones = {
    stone: "bg-stone-100 text-stone-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
