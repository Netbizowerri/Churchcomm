export type Role = "super_admin" | "admin" | "viewer";

export type Admin = {
  id: string;
  email: string;
  password: string; // demo only
  name: string;
  role: Role;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string; // E.164
  whatsappEnabled: boolean;
  group: string;
  email: string;
  status: "active" | "inactive";
  dateAdded: string; // ISO
  notes: string;
};

export type Channel = "sms" | "whatsapp" | "both";

export type DeliveryStatus = "queued" | "sending" | "delivered" | "failed";

export type DeliveryRecord = {
  contactId: string;
  channel: "sms" | "whatsapp";
  status: DeliveryStatus;
  updatedAt: string;
};

export type Broadcast = {
  id: string;
  title: string;
  body: string;
  channels: Channel;
  recipientCount: number;
  sentAt: string;
  sentBy: string;
  progress: number; // 0-100
  status: "sending" | "completed" | "partial" | "failed";
  deliveries: DeliveryRecord[];
};

export type Template = {
  id: string;
  name: string;
  title: string;
  body: string;
  createdAt: string;
};

export type Group = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Toast = {
  id: string;
  message: string;
  kind: "success" | "error" | "info";
};
