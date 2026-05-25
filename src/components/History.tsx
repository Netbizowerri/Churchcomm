import { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Filter,
  Inbox,
  Eye,
} from "lucide-react";
import { Button, Badge, Modal } from "./ui";
import { ChannelBadge, StatusDot, formatRelative } from "./Dashboard";
import type { Broadcast, Contact } from "../types";
import { formatPhoneForDisplay } from "../utils/phone";

export function History({
  broadcasts,
  contacts,
}: {
  broadcasts: Broadcast[];
  contacts: Contact[];
}) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "sending" | "completed" | "partial" | "failed"
  >("all");
  const [selected, setSelected] = useState<Broadcast | null>(null);

  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  const filtered = broadcasts.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.body.toLowerCase().includes(q) ||
      b.sentBy.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          Broadcast history
        </h2>
        <p className="mt-0.5 text-sm text-stone-500">
          Every message, every delivery, fully logged.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, body, or sender…"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <Filter size={14} className="text-stone-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All statuses</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
          <option value="partial">Partial</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox size={28} className="text-stone-300" />
            <div className="mt-3 text-sm font-semibold text-stone-600">
              No broadcasts yet
            </div>
            <div className="text-xs text-stone-400">
              Your message history will appear here.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map((b) => {
              const delivered = b.deliveries.filter((d) => d.status === "delivered").length;
              const failed = b.deliveries.filter((d) => d.status === "failed").length;
              const total = b.deliveries.length;
              return (
                <div
                  key={b.id}
                  className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-stone-50/60"
                >
                  <StatusDot status={b.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-stone-900">
                        {b.title}
                      </div>
                      <ChannelBadge channels={b.channels} />
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-stone-600">
                      {b.body}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                      <span>{formatRelative(b.sentAt)}</span>
                      <span>·</span>
                      <span>by {b.sentBy}</span>
                      <span>·</span>
                      <span>
                        {b.recipientCount} recipient{b.recipientCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    {b.status === "sending" && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-700">
                        <Loader2 size={12} className="animate-spin" />
                        Sending… {b.progress}%
                        <div className="h-1 w-24 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full bg-amber-500 transition-all"
                            style={{ width: `${b.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-semibold text-stone-900">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      {delivered}/{total}
                    </div>
                    {failed > 0 && (
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-xs text-rose-600">
                        <XCircle size={11} />
                        {failed} failed
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      onClick={() => setSelected(b)}
                    >
                      <Eye size={12} />
                      Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title || "Broadcast details"}
        size="xl"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              {selected.title && (
                <div className="mb-1 font-semibold text-stone-900">
                  {selected.title}
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm text-stone-700">
                {selected.body}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-200 pt-3 text-xs text-stone-500">
                <span>Sent {formatRelative(selected.sentAt)}</span>
                <span>·</span>
                <span>by {selected.sentBy}</span>
                <span>·</span>
                <ChannelBadge channels={selected.channels} />
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Delivery log ({selected.deliveries.length})
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 rounded-xl border border-stone-200">
                {selected.deliveries.map((d, idx) => {
                  const c = contactMap.get(d.contactId);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-3 py-2 text-xs"
                    >
                      <DeliveryIcon status={d.status} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-stone-900">
                          {c
                            ? `${c.firstName} ${c.lastName}`
                            : "(deleted contact)"}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {c ? formatPhoneForDisplay(c.phoneNumber) : ""}
                        </div>
                      </div>
                      <Badge
                        tone={d.channel === "sms" ? "indigo" : "emerald"}
                      >
                        {d.channel.toUpperCase()}
                      </Badge>
                      <span className="text-[11px] text-stone-400">
                        {formatRelative(d.updatedAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatusBadge({ status }: { status: Broadcast["status"] }) {
  const map = {
    sending: { tone: "amber" as const, label: "sending" },
    completed: { tone: "emerald" as const, label: "completed" },
    partial: { tone: "amber" as const, label: "partial" },
    failed: { tone: "rose" as const, label: "failed" },
  }[status];
  return <Badge tone={map.tone}>{map.label}</Badge>;
}

function DeliveryIcon({ status }: { status: string }) {
  if (status === "delivered")
    return <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />;
  if (status === "failed")
    return <XCircle size={13} className="text-rose-500 shrink-0" />;
  if (status === "sending")
    return <Loader2 size={13} className="animate-spin text-indigo-500 shrink-0" />;
  return <Clock size={13} className="text-stone-400 shrink-0" />;
}
