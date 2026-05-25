import express from "express";
import { getWhatsAppSettings, updateWhatsAppSettings, getTwilioSettings, updateTwilioSettings } from "../storage/settings.js";

const router = express.Router();

/**
 * GET /api/settings/whatsapp
 * Get current WhatsApp settings
 */
router.get("/whatsapp", async (req: express.Request, res: express.Response) => {
  try {
    const settings = await getWhatsAppSettings();
    res.json({
      businessId: settings.businessId ? "***" : "", // Mask for security
      phoneNumberId: settings.phoneNumberId ? "***" : "",
      phoneNumber: settings.phoneNumber,
      configured: !!settings.businessId && !!settings.phoneNumberId,
    });
  } catch (error) {
    const err = error as any;
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/settings/whatsapp
 * Update WhatsApp settings
 */
router.post("/whatsapp", async (req: express.Request, res: express.Response) => {
  try {
    const { whatsappBusinessId, whatsappPhoneNumberId, whatsappPhoneNumber } = req.body;

    if (!whatsappBusinessId || !whatsappPhoneNumberId || !whatsappPhoneNumber) {
      return res.status(400).json({
        error: "Missing required fields: whatsappBusinessId, whatsappPhoneNumberId, whatsappPhoneNumber",
      });
    }

    const updated = await updateWhatsAppSettings({
      businessId: whatsappBusinessId,
      phoneNumberId: whatsappPhoneNumberId,
      phoneNumber: whatsappPhoneNumber,
    });

    res.json({
      success: true,
      message: "WhatsApp settings updated",
      phoneNumber: updated.phoneNumber,
    });
  } catch (error) {
    const err = error as any;
    console.error("Settings update error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/settings/twilio
 * Get current Twilio settings
 */
router.get("/twilio", async (req: express.Request, res: express.Response) => {
  try {
    const settings = await getTwilioSettings();
    res.json({
      accountSid: settings.accountSid ? "***" : "", // Mask for security
      authToken: settings.authToken ? "***" : "",
      phoneNumber: settings.phoneNumber,
      configured: !!settings.accountSid && !!settings.authToken && !!settings.phoneNumber,
    });
  } catch (error) {
    const err = error as any;
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/settings/twilio
 * Update Twilio settings
 */
router.post("/twilio", async (req: express.Request, res: express.Response) => {
  try {
    const { accountSid, authToken, phoneNumber } = req.body;

    if (!accountSid || !authToken || !phoneNumber) {
      return res.status(400).json({
        error: "Missing required fields: accountSid, authToken, phoneNumber",
      });
    }

    const updated = await updateTwilioSettings({
      accountSid,
      authToken,
      phoneNumber,
    });

    res.json({
      success: true,
      message: "Twilio settings updated",
      phoneNumber: updated.phoneNumber,
    });
  } catch (error) {
    const err = error as any;
    console.error("Settings update error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
