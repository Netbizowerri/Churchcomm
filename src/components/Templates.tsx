import { useState } from "react";
import { Plus, Edit3, Trash2, FileText, Sparkles } from "lucide-react";
import { Button, Input, Modal, TextArea } from "./ui";
import type { Template } from "../types";
import { uid } from "../utils/phone";

export function Templates({
  templates,
  onUpsert,
  onDelete,
}: {
  templates: Template[];
  onUpsert: (t: Template) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Message templates
          </h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Pre-written messages ready to broadcast in one click.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={14} />
          New template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center">
          <Sparkles size={24} className="text-stone-300" />
          <div className="mt-3 text-sm font-semibold text-stone-600">
            No templates yet
          </div>
          <div className="text-xs text-stone-400">
            Create reusable messages to send faster.
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <FileText size={16} />
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setEditing(t)}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    title="Edit"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete template "${t.name}"?`)) {
                        onDelete(t.id);
                      }
                    }}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold text-stone-900">
                {t.name}
              </div>
              {t.title && (
                <div className="mt-0.5 text-xs font-medium text-indigo-600">
                  {t.title}
                </div>
              )}
              <div className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-stone-600">
                {t.body}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-[11px] text-stone-400">
                <span>{t.body.length} chars</span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <TemplateForm
          template={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(t) => {
            onUpsert(t);
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function TemplateForm({
  template,
  onClose,
  onSave,
}: {
  template: Template | null;
  onClose: () => void;
  onSave: (t: Template) => void;
}) {
  const [name, setName] = useState(template?.name || "");
  const [title, setTitle] = useState(template?.title || "");
  const [body, setBody] = useState(template?.body || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Required";
    if (!body.trim()) errs.body = "Required";
    if (body.length > 4096) errs.body = "Exceeds WhatsApp limit (4096)";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      id: template?.id || uid(),
      name: name.trim(),
      title: title.trim(),
      body: body.trim(),
      createdAt: template?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={template ? "Edit template" : "Create template"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>
            {template ? "Save changes" : "Create template"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Template name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sunday Service Reminder"
          error={errors.name}
          autoFocus
        />
        <Input
          label="Optional title (WhatsApp preview)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Sunday Service"
        />
        <div>
          <div className="flex items-center justify-between">
            <span className="mb-1.5 block text-xs font-medium text-stone-600">
              Message body *
            </span>
            <span className="text-[10px] text-stone-400">
              {body.length}/4096
            </span>
          </div>
          <TextArea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Beloved, join us this Sunday…"
            error={errors.body}
          />
        </div>
      </div>
    </Modal>
  );
}
