import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Contacts } from "./components/Contacts";
import { History } from "./components/History";
import { Templates } from "./components/Templates";
import { Groups } from "./components/Groups";
import { Settings } from "./components/Settings";
import { AppLayout } from "./components/Layout";
import { loadStore, saveStore, resetStore } from "./store";
import { loadBroadcasts, saveBroadcasts } from "./utils/broadcastStore";
import { uid } from "./utils/phone";
import type {
  Broadcast,
  Channel,
  Contact,
  DeliveryStatus,
  Group,
  Template,
  Toast as ToastType,
} from "./types";
import { ToastHost } from "./components/Toast";

export type View = "dashboard" | "contacts" | "history" | "templates" | "groups" | "settings";

export default function App() {
  const [store, setStore] = useState(() => loadStore());
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(() => loadBroadcasts());
  const [view, setView] = useState<View>("dashboard");
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const broadcastTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Persist store on change
  useEffect(() => {
    saveStore(store);
  }, [store]);
  useEffect(() => {
    saveBroadcasts(broadcasts);
  }, [broadcasts]);

  // Cleanup broadcast timers on unmount
  useEffect(() => {
    return () => {
      broadcastTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const pushToast = useCallback(
    (message: string, kind: ToastType["kind"] = "success") => {
      const id = uid();
      setToasts((prev) => [...prev, { id, message, kind }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const currentAdmin = useMemo(
    () => store.admins.find((a) => a.id === store.currentAdminId) || null,
    [store.admins, store.currentAdminId],
  );

  // --- Auth ---
  const handleLogin = useCallback(
    (email: string, password: string, remember: boolean) => {
      const now = Date.now();
      if (store.lockedUntil && store.lockedUntil > now) {
        return { ok: false, error: "Account is locked. Please wait." };
      }
      const admin = store.admins.find((a) => a.email === email);
      if (!admin || admin.password !== password) {
        const nextAttempts = store.failedAttempts + 1;
        setStore((s) => {
          const locked =
            nextAttempts >= 5 ? now + 15 * 60 * 1000 : s.lockedUntil;
          return {
            ...s,
            failedAttempts: nextAttempts,
            lockedUntil: locked,
            currentAdminId: null,
            rememberMe: false,
          };
        });
        return {
          ok: false,
          error:
            nextAttempts >= 5
              ? "Too many failed attempts. Locked for 15 minutes."
              : "Invalid email or password.",
        };
      }
      setStore((s) => ({
        ...s,
        currentAdminId: admin.id,
        failedAttempts: 0,
        lockedUntil: null,
        rememberMe: remember,
      }));
      pushToast(`Welcome, Admin 🙏`, "success");
      return { ok: true };
    },
    [store.admins, store.failedAttempts, store.lockedUntil, pushToast],
  );

  const handleLogout = useCallback(() => {
    setStore((s) => ({ ...s, currentAdminId: null, rememberMe: false }));
    setView("dashboard");
  }, []);

  // --- Contacts ---
  const upsertContact = useCallback(
    (c: Contact) => {
      setStore((s) => {
        const exists = s.contacts.find((x) => x.id === c.id);
        const contacts = exists
          ? s.contacts.map((x) => (x.id === c.id ? c : x))
          : [...s.contacts, c];
        return { ...s, contacts };
      });
    },
    [],
  );

  const deleteContact = useCallback((id: string) => {
    setStore((s) => ({
      ...s,
      contacts: s.contacts.map((c) =>
        c.id === id ? { ...c, status: "inactive" } : c,
      ),
    }));
  }, []);

  const permanentlyDeleteContact = useCallback((id: string) => {
    setStore((s) => ({
      ...s,
      contacts: s.contacts.filter((c) => c.id !== id),
    }));
  }, []);

  const bulkUpdateContacts = useCallback(
    (ids: string[], action: "activate" | "deactivate" | "delete") => {
      setStore((s) => {
        let contacts = s.contacts;
        if (action === "activate") {
          contacts = contacts.map((c) =>
            ids.includes(c.id) ? { ...c, status: "active" } : c,
          );
        } else if (action === "deactivate") {
          contacts = contacts.map((c) =>
            ids.includes(c.id) ? { ...c, status: "inactive" } : c,
          );
        } else {
          contacts = contacts.filter((c) => !ids.includes(c.id));
        }
        return { ...s, contacts };
      });
    },
    [],
  );

  // --- Templates ---
  const upsertTemplate = useCallback((t: Template) => {
    setStore((s) => {
      const exists = s.templates.find((x) => x.id === t.id);
      const templates = exists
        ? s.templates.map((x) => (x.id === t.id ? t : x))
        : [...s.templates, t];
      return { ...s, templates };
    });
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setStore((s) => ({
      ...s,
      templates: s.templates.filter((t) => t.id !== id),
    }));
  }, []);

  // --- Groups ---
  const upsertGroup = useCallback((g: Group) => {
    setStore((s) => {
      const exists = s.groups.find((x) => x.id === g.id);
      const groups = exists
        ? s.groups.map((x) => (x.id === g.id ? g : x))
        : [...s.groups, g];
      return { ...s, groups };
    });
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setStore((s) => ({
      ...s,
      groups: s.groups.filter((g) => g.id !== id),
    }));
  }, []);

  // --- Broadcast Engine (Twilio) ---
  const startBroadcast = useCallback(
    async (params: { title: string; body: string; channels: Channel; contactIds?: string[] }) => {
      if (!currentAdmin) return;
      const active = store.contacts.filter((c) => c.status === "active");
      if (active.length === 0) {
        pushToast("No active contacts to send to.", "error");
        return;
      }

      // Filter to selected contacts (or default to all active)
      const targets = params.contactIds
        ? active.filter((c) => params.contactIds!.includes(c.id))
        : active;

      if (targets.length === 0) {
        pushToast("No contacts selected.", "error");
        return;
      }

      // Build messages array for API
      const messages: Array<{
        contactId: string;
        phoneNumber: string;
        channel: "sms" | "whatsapp";
        body: string;
        title?: string;
      }> = [];

      targets.forEach((c) => {
        if (params.channels === "sms" || params.channels === "both") {
          messages.push({
            contactId: c.id,
            phoneNumber: c.phoneNumber,
            channel: "sms",
            body: params.body,
            title: params.title,
          });
        }
        if (
          (params.channels === "whatsapp" || params.channels === "both") &&
          c.whatsappEnabled
        ) {
          messages.push({
            contactId: c.id,
            phoneNumber: c.phoneNumber,
            channel: "whatsapp",
            body: params.body,
            title: params.title,
          });
        }
      });

      if (messages.length === 0) {
        pushToast(
          "No recipients match the selected channels.",
          "error",
        );
        return;
      }

      const broadcastId = uid();
      const broadcast: Broadcast = {
        id: broadcastId,
        title: params.title || "(Untitled broadcast)",
        body: params.body,
        channels: params.channels,
        recipientCount: targets.length,
        sentAt: new Date().toISOString(),
        sentBy: currentAdmin.name,
        progress: 0,
        status: "sending",
        deliveries: messages.map((m) => ({
          contactId: m.contactId,
          channel: m.channel,
          status: "queued" as DeliveryStatus,
          updatedAt: new Date().toISOString(),
        })),
      };

      setBroadcasts((prev) => [broadcast, ...prev]);
      pushToast(
        `📡 Sending to ${targets.length} contact${targets.length === 1 ? "" : "s"} via Twilio…`,
        "info",
      );

      try {
        const response = await fetch("http://localhost:3000/api/broadcasts/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            broadcastId,
            title: params.title,
            body: params.body,
            channels: params.channels,
            messages,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();

        // Update broadcast with actual delivery status from API
        setBroadcasts((prev) =>
          prev.map((b) => {
            if (b.id !== broadcastId) return b;
            const successCount = result.deliveries.filter(
              (d: any) => d.status !== "failed",
            ).length;
            const failureCount = result.deliveries.filter(
              (d: any) => d.status === "failed",
            ).length;
            return {
              ...b,
              deliveries: result.deliveries,
              progress: 100, // All sent
              status:
                failureCount === 0 ? "completed" : failureCount === successCount ? "failed" : "partial",
            };
          }),
        );

        const successCount = result.deliveries.filter(
          (d: any) => d.status !== "failed",
        ).length;
        const failureCount = result.deliveries.filter(
          (d: any) => d.status === "failed",
        ).length;

        if (failureCount === 0) {
          pushToast(`✅ Broadcast delivered to ${successCount} recipient(s)!`, "success");
        } else {
          pushToast(
            `⚠️ Broadcast sent: ${successCount} delivered, ${failureCount} failed`,
            failureCount < successCount ? "success" : "error",
          );
        }
      } catch (error) {
        const err = error as any;
        console.error("Broadcast error:", err);
        pushToast(
          `❌ Broadcast failed: ${err.message}. Is backend running on port 3000?`,
          "error",
        );

        // Mark broadcast as failed
        setBroadcasts((prev) =>
          prev.map((b) => {
            if (b.id !== broadcastId) return b;
            return {
              ...b,
              status: "failed",
              progress: 0,
            };
          }),
        );
      }
    },
    [currentAdmin, store.contacts, pushToast],
  );

  const handleReset = useCallback(() => {
    if (!confirm("Reset all data to seed defaults? This cannot be undone.")) return;
    const fresh = resetStore();
    setStore(fresh);
    setBroadcasts([]);
    pushToast("Data reset to defaults.", "info");
  }, [pushToast]);

  if (!currentAdmin) {
    return (
      <>
        <Login
          onLogin={handleLogin}
          failedAttempts={store.failedAttempts}
          lockedUntil={store.lockedUntil}
        />
        <ToastHost toasts={toasts} />
      </>
    );
  }

  const activeContacts = store.contacts.filter((c) => c.status === "active");

  return (
    <>
      <AppLayout
        view={view}
        setView={setView}
        admin={currentAdmin}
        onLogout={handleLogout}
        onReset={handleReset}
        activeContactCount={activeContacts.length}
        broadcastCount={broadcasts.length}
      >
        {view === "dashboard" && (
          <Dashboard
            admin={currentAdmin}
            contacts={store.contacts}
            broadcasts={broadcasts}
            templates={store.templates}
            groups={store.groups}
            onSend={startBroadcast}
            onSaveTemplate={upsertTemplate}
            setView={setView}
          />
        )}
        {view === "contacts" && (
          <Contacts
            contacts={store.contacts}
            groups={store.groups}
            onUpsert={upsertContact}
            onDelete={deleteContact}
            onPermanentDelete={permanentlyDeleteContact}
            onBulk={bulkUpdateContacts}
          />
        )}
        {view === "history" && (
          <History broadcasts={broadcasts} contacts={store.contacts} />
        )}
        {view === "templates" && (
          <Templates
            templates={store.templates}
            onUpsert={upsertTemplate}
            onDelete={deleteTemplate}
          />
        )}
        {view === "groups" && (
          <Groups
            groups={store.groups}
            contacts={store.contacts}
            onUpsert={upsertGroup}
            onDelete={deleteGroup}
          />
        )}
        {view === "settings" && (
          <Settings
            admin={currentAdmin}
            onClose={() => setView("dashboard")}
          />
        )}
      </AppLayout>
      <ToastHost toasts={toasts} />
    </>
  );
}
