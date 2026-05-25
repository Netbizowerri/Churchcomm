import { useMemo, useState, type KeyboardEvent } from "react";
import {
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  Activity,
  Sparkles,
  Zap,
  BookOpen,
  Hash,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button, Modal, Badge } from "./ui";
import type {
  Admin,
  Broadcast,
  Channel,
  Contact,
  Group,
  Template,
} from "../types";
import { smsSegmentCount } from "../utils/phone";
import type { View } from "../App";
import { cn } from "../utils/cn";

export function Dashboard({
  admin,
  contacts,
  broadcasts,
  templates,
  groups,
  onSend,
  onSaveTemplate,
  setView,
}: {
  admin: Admin;
  contacts: Contact[];
  broadcasts: Broadcast[];
  templates: Template[];
  groups: Group[];
  onSend: (params: { title: string; body: string; channels: Channel }) => void;
  onSaveTemplate: (t: Template) => void;
  setView: (v: View) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState<Channel>("both");
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const active = contacts.filter((c) => c.status === "active");
  const whatsappEligible = active.filter((c) => c.whatsappEnabled).length;

  const smsCount = body.length;
  const smsSegments = smsSegmentCount(smsCount);
  const waRemaining = 4096 - body.length;

  const recipientCount = useMemo(() => {
    if (channels === "sms") return active.length;
    if (channels === "whatsapp") return whatsappEligible;
    return active.length; // both (max)
  }, [channels, active.length, whatsappEligible]);

  const canSend =
    body.trim().length > 0 && recipientCount > 0 && admin.role !== "viewer";

  const estimatedSeconds = Math.max(2, Math.ceil(recipientCount * 0.35));

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) setShowConfirm(true);
    }
  };

  const confirmSend = () => {
    setShowConfirm(false);
    onSend({ title: title.trim(), body: body.trim(), channels });
    setBody("");
    setTitle("");
  };

  const handleSaveTemplate = () => {
    if (!body.trim()) return;
    setSaving(true);
    const name = title.trim() || body.slice(0, 30) + (body.length > 30 ? "…" : "");
    onSaveTemplate({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    });
    setTimeout(() => setSaving(false), 400);
  };

  const loadTemplate = (t: Template) => {
    setTitle(t.title);
    setBody(t.body);
  };

  const inFlight = broadcasts.filter((b) => b.status === "sending")[0];
  const recent = broadcasts.slice(0, 4);

  const totalSent = broadcasts.reduce(
    (sum, b) => sum + b.deliveries.filter((d) => d.status === "delivered").length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Welcome, Admin 👋
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Reach your congregation in seconds. Compose a message and hit Enter.
          </p>
        </div>
        {inFlight && (
          <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm text-indigo-800">
            <Loader2 size={16} className="animate-spin" />
            <span>
              Broadcasting… <b>{inFlight.progress}%</b>
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-indigo-200">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${inFlight.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Active members"
          value={active.length}
          tone="indigo"
        />
        <StatCard
          icon={MessageSquare}
          label="Broadcasts"
          value={broadcasts.length}
          tone="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Messages delivered"
          value={totalSent}
          tone="emerald"
        />
        <StatCard
          icon={Activity}
          label="WhatsApp-ready"
          value={whatsappEligible}
          tone="sky"
        />
      </div>

      {/* Composer */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                  <Zap size={14} />
                </div>
                <div className="text-sm font-semibold text-stone-900">
                  Compose broadcast
                </div>
              </div>
              <div className="flex gap-1">
                {(["both", "sms", "whatsapp"] as Channel[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannels(c)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition-all",
                      channels === c
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200",
                    )}
                  >
                    {c === "both" ? "SMS + WhatsApp" : c}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional title (shows as WhatsApp preview)…"
                className="mb-3 w-full border-0 border-b border-dashed border-stone-200 bg-transparent py-1.5 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-0"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here… Press Enter to send, Shift+Enter for a new line. 😊"
                rows={6}
                className="w-full resize-none border-0 bg-transparent text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1">
                    <Hash size={12} />
                    {smsCount} chars · {smsSegments} SMS seg{smsSegments === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare size={12} />
                    {waRemaining >= 0
                      ? `${waRemaining} left for WA`
                      : `${-waRemaining} over WA limit`}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} />
                    {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveTemplate}
                    disabled={!body.trim() || saving}
                  >
                    {saving ? "Saved ✓" : "Save template"}
                  </Button>
                  <Button
                    onClick={() => setShowConfirm(true)}
                    disabled={!canSend}
                  >
                    <Send size={14} />
                    Send
                  </Button>
                </div>
              </div>
              {admin.role === "viewer" && (
                <div className="mt-2 text-xs text-amber-700">
                  Your Viewer role cannot send broadcasts — contact an admin to upgrade.
                </div>
              )}
              <div className="mt-3 text-[11px] text-stone-400">
                Tip: <kbd className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-600">Enter</kbd> sends,{" "}
                <kbd className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-600">Shift+Enter</kbd> for a new line.
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                <BookOpen size={15} />
                Quick templates
              </div>
              <button
                onClick={() => setView("templates")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Manage all →
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {templates.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  onClick={() => loadTemplate(t)}
                  className="group rounded-xl border border-stone-200 bg-white p-3 text-left transition-all hover:border-indigo-300 hover:shadow-sm"
                >
                  <div className="text-xs font-semibold text-stone-900 group-hover:text-indigo-700">
                    {t.name}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[11px] text-stone-500">
                    {t.body}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Recipients preview */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-stone-900">
                Recipients
              </div>
              <button
                onClick={() => setView("contacts")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all →
              </button>
            </div>
            <div className="space-y-2">
              {active.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg px-1 py-1.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-bold text-white">
                    {c.firstName[0]}
                    {c.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-stone-900">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="truncate text-[11px] text-stone-500">
                      {c.group || "No group"}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(channels === "sms" || channels === "both") && (
                      <Badge tone="indigo">SMS</Badge>
                    )}
                    {(channels === "whatsapp" || channels === "both") &&
                      c.whatsappEnabled && <Badge tone="emerald">WA</Badge>}
                  </div>
                </div>
              ))}
              {active.length > 5 && (
                <div className="text-center text-xs text-stone-500">
                  + {active.length - 5} more
                </div>
              )}
            </div>
          </div>

          {/* Groups */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-stone-900">
                Groups
              </div>
              <button
                onClick={() => setView("groups")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Manage →
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {groups.map((g) => {
                const count = contacts.filter(
                  (c) => c.group === g.name && c.status === "active",
                ).length;
                return (
                  <span
                    key={g.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1"
                    style={{
                      backgroundColor: g.color + "15",
                      color: g.color,
                      borderColor: g.color + "30",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                    {g.name}
                    <span className="opacity-60">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent broadcasts */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-stone-900">
            Recent broadcasts
          </div>
          <button
            onClick={() => setView("history")}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Full history <ArrowRight size={12} />
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 py-10 text-center">
            <Sparkles size={20} className="text-stone-300" />
            <div className="mt-2 text-sm font-medium text-stone-600">
              No broadcasts yet
            </div>
            <div className="text-xs text-stone-400">
              Your first message is just a keystroke away.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recent.map((b) => (
              <div key={b.id} className="flex items-start gap-3 py-3">
                <StatusDot status={b.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-stone-900">
                      {b.title}
                    </div>
                    <ChannelBadge channels={b.channels} />
                    <Badge tone={b.status === "sending" ? "amber" : "emerald"}>
                      {b.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-stone-500">
                    {b.body}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
                    <span>{formatRelative(b.sentAt)}</span>
                    <span>·</span>
                    <span>
                      {b.deliveries.filter((d) => d.status === "delivered").length}/
                      {b.deliveries.length} delivered
                    </span>
                    <span>·</span>
                    <span>by {b.sentBy}</span>
                  </div>
                  {b.status === "sending" && (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${b.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Send broadcast?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSend}>
              <Send size={14} />
              Send to {recipientCount}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Message preview
            </div>
            <div className="mt-1.5 rounded-xl border border-stone-200 bg-stone-50 p-3">
              {title && (
                <div className="mb-1 text-sm font-semibold text-stone-900">
                  {title}
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm text-stone-700">
                {body}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Recipients" value={recipientCount.toString()} />
            <InfoRow label="Channels" value={channels.toUpperCase()} />
            <InfoRow
              label="SMS segments"
              value={smsSegments.toString()}
            />
            <InfoRow
              label="Est. delivery"
              value={`~${estimatedSeconds}s`}
            />
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            You're about to send this message to <b>{recipientCount}</b> member
            {recipientCount === 1 ? "" : "s"}. This action cannot be undone.
          </div>
        </div>
      </Modal>
    </div>
  );
}

function greetingTime(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  tone: "indigo" | "amber" | "emerald" | "sky";
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    sky: "bg-sky-50 text-sky-600 ring-sky-100",
  };
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl ring-1",
            tones[tone],
          )}
        >
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
        {value}
      </div>
      <div className="mt-0.5 text-xs text-stone-500">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-stone-900">{value}</div>
    </div>
  );
}

export function StatusDot({ status }: { status: Broadcast["status"] }) {
  const map = {
    sending: "bg-amber-500 animate-pulse",
    completed: "bg-emerald-500",
    partial: "bg-orange-500",
    failed: "bg-rose-500",
  };
  return <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", map[status])} />;
}

export function ChannelBadge({ channels }: { channels: Channel }) {
  const labels = {
    both: "SMS + WhatsApp",
    sms: "SMS only",
    whatsapp: "WhatsApp only",
  };
  return (
    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
      {labels[channels]}
    </span>
  );
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}
