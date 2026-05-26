import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Send SMS via Termii API
 * Termii is a Nigerian SMS gateway perfect for African phone numbers
 * Docs: https://developers.termii.com/messaging
 */
async function sendTermiiSMS(
  apiKey: string,
  to: string,
  message: string,
): Promise<{ success: boolean; messageId: string | null; error?: string }> {
  try {
    const response = await fetch("https://api.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        to,
        from: "ChurchComm",
        sms: message,
        type: "plain",
        channel: "generic",
      }),
    });

    const data = await response.json();

    if (data.code === "ok" && data.message_id) {
      return { success: true, messageId: data.message_id };
    }
    return {
      success: false,
      messageId: null,
      error: data.message || data.error || "Termii API error",
    };
  } catch (error: any) {
    return {
      success: false,
      messageId: null,
      error: error.message || "Network error sending SMS",
    };
  }
}

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

    // Load Termii credentials from environment
    const termiiApiKey =
      process.env.TERMII_LIVE_API_KEY || process.env.TERMII_API_KEY;
    const termiiSecret = process.env.TERMII_SECRET_KEY;

    if (!termiiApiKey) {
      throw new Error(
        "Missing Termii API key. Set TERMII_LIVE_API_KEY in your environment variables.",
      );
    }

    console.log(
      `📢 Starting broadcast ${broadcastId}: ${messages.length} message(s) via Termii`,
    );

    const deliveries: any[] = [];

    let successCount = 0;
    let failureCount = 0;

    // Send all messages via Termii (sequential to avoid rate limiting)
    for (const msg of messages) {
      const delivery: any = {
        messageId: "",
        contactId: msg.contactId,
        phoneNumber: msg.phoneNumber,
        channel: "sms",
        status: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        // Termii only supports SMS — skip WhatsApp messages silently
        if (msg.channel !== "sms") {
          delivery.status = "skipped";
          delivery.error = "WhatsApp not available with Termii";
          failureCount++;
          deliveries.push(delivery);
          continue;
        }

        const result = await sendTermiiSMS(termiiApiKey, msg.phoneNumber, body);

        if (result.success) {
          delivery.messageId = result.messageId || "";
          delivery.status = "sending";
          successCount++;
          console.log(`✅ SMS sent to ${msg.phoneNumber} (${result.messageId})`);
        } else {
          delivery.status = "failed";
          delivery.error = result.error;
          failureCount++;
          console.error(`❌ SMS failed for ${msg.phoneNumber}:`, result.error);
        }
      } catch (error: any) {
        delivery.status = "failed";
        delivery.error = error.message;
        failureCount++;
        console.error(`❌ Error sending to ${msg.phoneNumber}:`, error.message);
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