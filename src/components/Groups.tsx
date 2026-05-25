import { useState } from "react";
import { Plus, Edit3, Trash2, Tag as TagIcon, Users as UsersIcon } from "lucide-react";
import { Button, Input, Modal } from "./ui";
import type { Contact, Group } from "../types";
import { uid } from "../utils/phone";

const PALETTE = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

export function Groups({
  groups,
  contacts,
  onUpsert,
  onDelete,
}: {
  groups: Group[];
  contacts: Contact[];
  onUpsert: (g: Group) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<Group | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Groups
          </h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Organize members into groups for targeted communication.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={14} />
          New group
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => {
          const members = contacts.filter(
            (c) => c.group === g.name && c.status === "active",
          );
          return (
            <div
              key={g.id}
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: g.color }}
              />
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl ring-1"
                  style={{
                    backgroundColor: g.color + "15",
                    color: g.color,
                    borderColor: g.color + "30",
                  }}
                >
                  <TagIcon size={18} />
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setEditing(g)}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    title="Edit"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete group "${g.name}"? Members will be unassigned.`,
                        )
                      ) {
                        onDelete(g.id);
                      }
                    }}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-base font-semibold text-stone-900">
                {g.name}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                <UsersIcon size={13} />
                <b className="text-stone-900">{members.length}</b> active
                member{members.length === 1 ? "" : "s"}
              </div>
              {members.length > 0 && (
                <div className="mt-3 -space-x-1.5 flex">
                  {members.slice(0, 6).map((c) => (
                    <div
                      key={c.id}
                      title={`${c.firstName} ${c.lastName}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                      style={{
                        backgroundColor: g.color,
                      }}
                    >
                      {c.firstName[0]}
                      {c.lastName[0]}
                    </div>
                  ))}
                  {members.length > 6 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-stone-100 text-[10px] font-semibold text-stone-600">
                      +{members.length - 6}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(creating || editing) && (
        <GroupForm
          group={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(g) => {
            onUpsert(g);
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function GroupForm({
  group,
  onClose,
  onSave,
}: {
  group: Group | null;
  onClose: () => void;
  onSave: (g: Group) => void;
}) {
  const [name, setName] = useState(group?.name || "");
  const [color, setColor] = useState(group?.color || PALETTE[0]);
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    onSave({
      id: group?.id || uid(),
      name: name.trim(),
      color,
      createdAt: group?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={group ? "Edit group" : "Create group"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>
            {group ? "Save changes" : "Create group"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Group name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Youth, Choir, Ushers"
          error={error}
          autoFocus
        />
        <div>
          <div className="mb-1.5 block text-xs font-medium text-stone-600">
            Color
          </div>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="relative h-8 w-8 rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? c : "transparent",
                  outlineColor: color === c ? c : "transparent",
                }}
                aria-label={`Select ${c}`}
              >
                {color === c && (
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div
          className="flex items-center gap-3 rounded-xl p-3 ring-1"
          style={{
            backgroundColor: color + "10",
            borderColor: color + "30",
            color,
          }}
        >
          <TagIcon size={16} />
          <span className="text-sm font-semibold">Preview: {name || "Group name"}</span>
        </div>
      </div>
    </Modal>
  );
}
