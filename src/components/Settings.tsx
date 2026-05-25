import { useState } from "react";
import { Button, Input } from "./ui";
import { Lock, Save, AlertCircle } from "lucide-react";
import type { Admin } from "../types";

export function Settings({ admin, onClose }: { admin: Admin; onClose: () => void }) {
  const [whatsappBusinessId, setWhatsappBusinessId] = useState("");
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState("");
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const canEdit = admin.role === "super_admin";

  if (!canEdit) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 text-red-600" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Access Denied</h3>
            <p className="mt-1 text-sm text-red-700">Only Super Admins can manage settings.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappBusinessId: whatsappBusinessId.trim(),
          whatsappPhoneNumberId: whatsappPhoneNumberId.trim(),
          whatsappPhoneNumber: whatsappPhoneNumber.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setMessage({ type: "success", text: "✅ WhatsApp settings saved successfully!" });
      setTimeout(() => {
        setMessage(null);
      }, 4000);
    } catch (error) {
      const err = error as any;
      setMessage({ type: "error", text: `❌ Error: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Settings</h2>
        <p className="mt-1 text-sm text-stone-500">Manage API credentials and integrations</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 text-sm font-medium ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* WhatsApp Settings */}
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-stone-900">WhatsApp Business Account</h3>
        </div>

        <p className="mb-6 text-sm text-stone-500">
          Update your WhatsApp Business credentials. These are securely stored and only used by the backend.
        </p>

        <div className="space-y-4">
          <Input
            label="WhatsApp Business Account ID"
            placeholder="e.g., 1234567890123456"
            value={whatsappBusinessId}
            onChange={(e) => setWhatsappBusinessId(e.target.value)}
            type="password"
            hint="Found in Meta Business Manager"
          />

          <Input
            label="WhatsApp Phone Number ID"
            placeholder="e.g., 1234567890123456"
            value={whatsappPhoneNumberId}
            onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
            type="password"
            hint="From Twilio Console after connecting WhatsApp"
          />

          <Input
            label="WhatsApp Business Phone Number"
            placeholder="+234XXXXXXXXXX"
            value={whatsappPhoneNumber}
            onChange={(e) => setWhatsappPhoneNumber(e.target.value)}
            hint="The number WhatsApp messages will be sent from"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !whatsappBusinessId.trim()}
          className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save WhatsApp Settings"}
        </button>
      </div>

      {/* SMS Info */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
        <h3 className="font-semibold text-emerald-900">SMS Configuration</h3>
        <p className="mt-2 text-sm text-emerald-700">
          SMS credentials are managed via backend environment variables for security. Contact your system administrator to update Twilio SMS settings.
        </p>
      </div>

      {/* Close Button */}
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
