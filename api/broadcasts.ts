import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { broadcastId, title, body, channels, messages } = req.body;

    if (!broadcastId || !body || !channels || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Missing required fields: broadcastId, body, channels, messages",
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({ error: "No messages to send" });
    }

    // Load Twilio credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error(
        "Missing Twilio credentials. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER."
      );
    }

    const client = twilio(accountSid, authToken);

    console.log(
      `📢 Starting broadcast ${broadcastId}: ${messages.length} message(s) via ${channels}`
    );

    const deliveries: Array<{
      messageId: string;
      contactId: string;
      phoneNumber: string;
      channel: string;
      status: string;
      error?: string;
      createdAt: string;
      updatedAt: string;
    }> = [];

    let successCount = 0;
    let failureCount = 0;

    // Send all messages (sequential to avoid rate limiting)
    for (const msg of messages) {
      const delivery = {
        messageId: "",
        contactId: msg.contactId,
        phoneNumber: msg.phoneNumber,
        channel: msg.channel,
        status: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        let result;
        if (msg.channel === "sms") {
          result = await client.messages.create({
            body: body,
            from: twilioPhoneNumber,
            to: msg.phoneNumber,
          });
        } else if (msg.channel === "whatsapp") {
          // For WhatsApp, use the same Twilio number with whatsapp: prefix
          result = await client.messages.create({
            body: title ? `${title}\n\n${body}` : body,
            from: `whatsapp:${twilioPhoneNumber}`,
            to: `whatsapp:${msg.phoneNumber}`,
          });
        } else {
          throw new Error(`Unknown channel: ${msg.channel}`);
        }

        delivery.messageId = result.sid;
        delivery.status = "sending";
        successCount++;
        console.log(
          `✅ ${msg.channel.toUpperCase()} queued for ${msg.phoneNumber} (${result.sid})`
        );
      } catch (error: any) {
        delivery.status = "failed";
        delivery.error = error.message;
        failureCount++;
        console.error(
          `❌ ${msg.channel.toUpperCase()} failed for ${msg.phoneNumber}:`,
          error.message
        );
      }

      delivery.updatedAt = new Date().toISOString();
      deliveries.push(delivery);
    }

    return res.json({
      success: failureCount === 0,
      broadcastId,
      totalMessages: messages.length,
      deliveries,
    });
  } catch (error: any) {
    console.error("Broadcast error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send broadcast",
      broadcastId: "",
      totalMessages: 0,
      deliveries: [],
    });
  }
}