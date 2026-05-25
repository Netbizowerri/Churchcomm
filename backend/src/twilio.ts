import twilio from "twilio";
import dotenv from "dotenv";
import type { WhatsAppSettings } from "./storage/settings.js";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error(
    "Missing required Twilio credentials: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER",
  );
}

export const twilioClient = twilio(accountSid, authToken);

/**
 * Send SMS via Twilio
 * Numbers should be in E.164 format: +234XXXXXXXXXX for Nigeria
 */
export async function sendSMS(phoneNumber: string, message: string) {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    const err = error as any;
    console.error(`SMS send failed for ${phoneNumber}:`, err.message);
    return {
      success: false,
      messageId: null,
      error: err.message || "Unknown error",
    };
  }
}

/**
 * Send WhatsApp message via Twilio
 * Numbers should be in E.164 format with 'whatsapp:' prefix
 * Requires WhatsApp Business Account setup
 */
export async function sendWhatsApp(
  phoneNumber: string,
  message: string,
  settings: WhatsAppSettings,
) {
  try {
    if (!settings.phoneNumber) {
      throw new Error("WhatsApp phone number not configured");
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${settings.phoneNumber}`,
      to: `whatsapp:${phoneNumber}`,
    });
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    const err = error as any;
    console.error(`WhatsApp send failed for ${phoneNumber}:`, err.message);
    return {
      success: false,
      messageId: null,
      error: err.message || "Unknown error",
    };
  }
}

/**
 * Get message status
 */
export async function getMessageStatus(messageSid: string) {
  try {
    const message = await twilioClient.messages(messageSid).fetch();
    return {
      sid: message.sid,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    const err = error as any;
    console.error(`Failed to fetch message status:`, err.message);
    return null;
  }
}
