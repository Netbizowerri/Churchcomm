import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Download,
  CheckSquare,
  Square,
  Filter,
  Phone,
  MessageCircle,
  UserCircle,
} from "lucide-react";
import { Button, Input, Modal, Select, Badge } from "./ui";
import type { Contact, Group } from "../types";
import {
  formatPhoneForDisplay,
  isValidNigerianPhone,
  normalizePhone,
  uid,
} from "../utils/phone";
import { cn } from "../utils/cn";

export function Contacts({
  contacts,
  groups,
  onUpsert,
  onDelete,
  onPermanentDelete,
  onBulk,
}: {
  contacts: Contact[];
  groups: Group[];
  onUpsert: (c: Contact) => void;
  onDelete: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onBulk: (ids: string[], action: "activate" | "deactivate" | "delete") => void;
}) {
  const [query, setQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"active" | "inactive" | "all">(
    "active",
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Contact | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return contacts.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterGroup !== "all" && c.group !== filterGroup) return false;
      if (!q) return true;
      return (
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [contacts, query, filterGroup, filterStatus]);

  const allSelected =
    filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  };

  const handleExport = () => {
    const rows = [
      ["First Name", "Last Name", "Phone", "Email", "Group", "WhatsApp", "Status"].join(
        ",",
      ),
      ...filtered.map((c) =>
        [
          c.firstName,
          c.lastName,
          c.phoneNumber,
          c.email,
          c.group,
          c.whatsappEnabled ? "Yes" : "No",
          c.status,
        ].join(","),
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `churchcomm-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Contacts
          </h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Manage your church members and their contact preferences.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={14} />
          Add member
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or email…"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <Filter size={14} className="text-stone-400" />
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="w-auto"
        >
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
          <option value="all">All</option>
        </Select>
        <Select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="w-auto"
        >
          <option value="all">All groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 px-4 py-3 ring-1 ring-indigo-200">
          <div className="text-sm font-medium text-indigo-900">
            {selected.size} selected
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onBulk(Array.from(selected), "activate");
                setSelected(new Set());
              }}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onBulk(Array.from(selected), "deactivate");
                setSelected(new Set());
              }}
            >
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (
                  confirm(
                    `Permanently delete ${selected.size} contact(s)? This cannot be undone.`,
                  )
                ) {
                  onBulk(Array.from(selected), "delete");
                  setSelected(new Set());
                }
              }}
            >
              <Trash2 size={12} />
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100 bg-stone-50/50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} className="text-stone-400 hover:text-stone-700">
                    {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 hidden md:table-cell">Group</th>
                <th className="px-4 py-3 hidden lg:table-cell">Channels</th>
                <th className="px-4 py-3 hidden lg:table-cell">Added</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-stone-500">
                    No contacts match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={cn(
                    "transition-colors hover:bg-stone-50/60",
                    selected.has(c.id) && "bg-indigo-50/40",
                  )}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelect(c.id)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      {selected.has(c.id) ? (
                        <CheckSquare size={16} className="text-indigo-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
                          c.status === "inactive"
                            ? "bg-stone-300"
                            : "bg-gradient-to-br from-indigo-500 to-violet-500",
                        )}
                      >
                        {c.firstName[0]}
                        {c.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-stone-900">
                          {c.firstName} {c.lastName}
                        </div>
                        {c.email && (
                          <div className="text-[11px] text-stone-500">{c.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-700">
                    {formatPhoneForDisplay(c.phoneNumber)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {c.group ? (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                        {c.group}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1">
                      <Badge tone="indigo">
                        <Phone size={10} />
                        SMS
                      </Badge>
                      {c.whatsappEnabled && (
                        <Badge tone="emerald">
                          <MessageCircle size={10} />
                          WA
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-stone-500">
                    {new Date(c.dateAdded).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {c.status === "active" ? (
                      <Badge tone="emerald">active</Badge>
                    ) : (
                      <Badge tone="stone">inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(c)}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (c.status === "active") {
                            if (
                              confirm(
                                `Deactivate ${c.firstName} ${c.lastName}? They won't receive messages but history is preserved.`,
                              )
                            ) {
                              onDelete(c.id);
                            }
                          } else {
                            if (
                              confirm(
                                `Permanently delete ${c.firstName} ${c.lastName}? This cannot be undone.`,
                              )
                            ) {
                              onPermanentDelete(c.id);
                            }
                          }
                        }}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                        title={c.status === "active" ? "Deactivate" : "Delete permanently"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/40 px-4 py-2.5 text-xs text-stone-500">
          <div>
            Showing <b>{filtered.length}</b> of <b>{contacts.length}</b> contact
            {contacts.length === 1 ? "" : "s"}
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-stone-600 hover:bg-white"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {(creating || editing) && (
        <ContactForm
          contact={editing}
          groups={groups}
          existingPhones={contacts
            .filter((c) => c.id !== editing?.id)
            .map((c) => c.phoneNumber)}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(c) => {
            onUpsert(c);
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ContactForm({
  contact,
  groups,
  existingPhones,
  onClose,
  onSave,
}: {
  contact: Contact | null;
  groups: Group[];
  existingPhones: string[];
  onClose: () => void;
  onSave: (c: Contact) => void;
}) {
  const [firstName, setFirstName] = useState(contact?.firstName || "");
  const [lastName, setLastName] = useState(contact?.lastName || "");
  const [phone, setPhone] = useState(
    contact ? formatPhoneForDisplay(contact.phoneNumber) : "",
  );
  const [email, setEmail] = useState(contact?.email || "");
  const [group, setGroup] = useState(contact?.group || "");
  const [whatsappEnabled, setWhatsappEnabled] = useState(
    contact?.whatsappEnabled ?? true,
  );
  const [notes, setNotes] = useState(contact?.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Required";
    if (!lastName.trim()) errs.lastName = "Required";
    const normalized = normalizePhone(phone);
    if (!normalized) {
      errs.phone = "Invalid phone format";
    } else if (!isValidNigerianPhone(normalized)) {
      errs.phone = "Must be a valid Nigerian number";
    } else if (existingPhones.includes(normalized)) {
      errs.phone = "Phone number already exists";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Invalid email";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const now = contact?.dateAdded || new Date().toISOString();
    onSave({
      id: contact?.id || uid(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: normalized,
      email: email.trim(),
      group,
      whatsappEnabled,
      status: contact?.status || "active",
      dateAdded: now,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={contact ? "Edit member" : "Add new member"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>
            {contact ? "Save changes" : "Add member"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First name *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName}
          autoFocus
        />
        <Input
          label="Last name *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errors.lastName}
        />
        <Input
          label="Phone number *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0801 234 5678"
          error={errors.phone}
        />
        <Input
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Select
          label="Group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value="">No group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </Select>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            checked={whatsappEnabled}
            onChange={(e) => setWhatsappEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
          />
          <MessageCircle size={16} className="text-emerald-600" />
          <div>
            <div className="font-medium text-stone-900">WhatsApp enabled</div>
            <div className="text-[11px] text-stone-500">
              Include in WhatsApp broadcasts
            </div>
          </div>
        </label>
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-600">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Prefers SMS, lives in Abuja…"
              className="w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-[11px] text-stone-600">
        <UserCircle size={14} className="mt-0.5 shrink-0 text-stone-400" />
        <div>
          Phone numbers are stored in E.164 format (e.g.{" "}
          <code className="rounded bg-stone-200 px-1 font-mono">+2349067180824</code>
          ). We accept <code className="rounded bg-stone-200 px-1 font-mono">0801…</code>,{" "}
          <code className="rounded bg-stone-200 px-1 font-mono">+234…</code>, or{" "}
          <code className="rounded bg-stone-200 px-1 font-mono">234…</code>.
        </div>
      </div>
    </Modal>
  );
}
