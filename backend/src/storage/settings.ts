import fs from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), ".settings.json");

export interface WhatsAppSettings {
  businessId: string;
  phoneNumberId: string;
  phoneNumber: string;
}

export interface TwilioSettings {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface Settings {
  whatsapp: WhatsAppSettings;
  twilio: TwilioSettings;
}

const DEFAULT_SETTINGS: Settings = {
  whatsapp: {
    businessId: "",
    phoneNumberId: "",
    phoneNumber: "",
  },
  twilio: {
    accountSid: "",
    authToken: "",
    phoneNumber: "",
  },
};

async function readSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  const settings = await readSettings();
  return settings.whatsapp;
}

export async function getTwilioSettings(): Promise<TwilioSettings> {
  const settings = await readSettings();
  return settings.twilio;
}

export async function updateWhatsAppSettings(
  whatsapp: Partial<WhatsAppSettings>,
): Promise<WhatsAppSettings> {
  const settings = await readSettings();
  settings.whatsapp = { ...settings.whatsapp, ...whatsapp };
  await writeSettings(settings);
  console.log("✅ WhatsApp settings updated");
  return settings.whatsapp;
}

export async function updateTwilioSettings(
  twilio: Partial<TwilioSettings>,
): Promise<TwilioSettings> {
  const settings = await readSettings();
  settings.twilio = { ...settings.twilio, ...twilio };
  await writeSettings(settings);
  console.log("✅ Twilio settings updated");
  return settings.twilio;
}
