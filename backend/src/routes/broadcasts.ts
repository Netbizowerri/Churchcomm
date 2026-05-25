import express from "express";
import { sendSMS, sendWhatsApp } from "../twilio.js";
import { getWhatsAppSettings } from "../storage/settings.js";
import type { BroadcastRequest, BroadcastResponse, MessageDelivery } from "../types.js";

const router = express.Router();

/**
 * POST /api/broadcasts/send
 * Send broadcast messages via SMS and/or WhatsApp
 */
router.post("/send", async (req: express.Request, res: express.Response) => {
  try {
    const { broadcastId, title, body, channels, messages } = req.body as BroadcastRequest;

    if (!broadcastId || !body || !channels || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Missing required fields: broadcastId, body, channels, messages",
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: "No messages to send",
      });
    }

    // Check if WhatsApp is configured (if needed)
    const whatsappSettings = await getWhatsAppSettings();
    const whatsappConfigured = whatsappSettings.businessId && whatsappSettings.phoneNumberId;

    console.log(
      `📢 Starting broadcast ${broadcastId}: ${messages.length} message(s) via ${channels}`,
    );
    if (!whatsappConfigured && (channels === "whatsapp" || channels === "both")) {
      console.warn("⚠️ WhatsApp not configured - will skip WhatsApp messages");
    }

    const deliveries: MessageDelivery[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Send all messages concurrently
    const results = await Promise.all(
      messages.map(async (msg) => {
        const delivery: MessageDelivery = {
          messageId: "",
          contactId: msg.contactId,
          phoneNumber: msg.phoneNumber,
          channel: msg.channel,
          status: "queued",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          let sendResult;

          if (msg.channel === "sms") {
            sendResult = await sendSMS(msg.phoneNumber, body);
          } else if (msg.channel === "whatsapp") {
            if (!whatsappConfigured) {
              throw new Error("WhatsApp not configured. Configure in Settings.");
            }
            const waMessage = title ? `${title}\n\n${body}` : body;
            sendResult = await sendWhatsApp(msg.phoneNumber, waMessage, whatsappSettings);
          } else {
            throw new Error(`Unknown channel: ${msg.channel}`);
          }

          if (sendResult.success) {
            delivery.messageId = sendResult.messageId || "";
            delivery.status = "sending";
            successCount++;
            console.log(
              `✅ ${msg.channel.toUpperCase()} queued for ${msg.phoneNumber} (${delivery.messageId})`,
            );
          } else {
            delivery.status = "failed";
            delivery.error = sendResult.error;
            failureCount++;
            console.error(`❌ ${msg.channel.toUpperCase()} failed for ${msg.phoneNumber}:`, sendResult.error);
          }
        } catch (error) {
          const err = error as any;
          delivery.status = "failed";
          delivery.error = err.message;
          failureCount++;
          console.error(`❌ Error sending ${msg.channel} to ${msg.phoneNumber}:`, err.message);
        }

        delivery.updatedAt = new Date().toISOString();
        return delivery;
      }),
    );

    deliveries.push(...results);

    const response: BroadcastResponse = {
      success: failureCount === 0,
      broadcastId,
      totalMessages: messages.length,
      deliveries,
    };

    console.log(
      `📊 Broadcast ${broadcastId} complete: ${successCount}✅ ${failureCount}❌`,
    );

    res.json(response);
  } catch (error) {
    const err = error as any;
    console.error("Broadcast error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to send broadcast",
      broadcastId: "",
      totalMessages: 0,
      deliveries: [],
    });
  }
});

/**
 * GET /api/broadcasts/status/:sid
 * Get message delivery status from Twilio
 */
router.get("/status/:sid", async (req: express.Request, res: express.Response) => {
  try {
    const { sid } = req.params;

    if (!sid) {
      return res.status(400).json({ error: "Missing message SID" });
    }

    // TODO: Fetch from Twilio and update your database
    res.json({
      messageId: sid,
      status: "unknown", // In production, fetch actual status
      note: "Status tracking requires database integration",
    });
  } catch (error) {
    const err = error as any;
    res.status(500).json({ error: err.message });
  }
});

export default router;
