export type DeliveryStatus = "queued" | "sending" | "delivered" | "failed";

export interface SendMessageRequest {
  contactId: string;
  phoneNumber: string;
  channel: "sms" | "whatsapp";
  body: string;
  title?: string;
}

export interface BroadcastRequest {
  broadcastId: string;
  title: string;
  body: string;
  channels: "sms" | "whatsapp" | "both";
  messages: SendMessageRequest[];
}

export interface MessageDelivery {
  messageId: string;
  contactId: string;
  phoneNumber: string;
  channel: "sms" | "whatsapp";
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface BroadcastResponse {
  success: boolean;
  broadcastId: string;
  totalMessages: number;
  deliveries: MessageDelivery[];
  error?: string;
}
