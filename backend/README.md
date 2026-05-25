# Church Communication Platform - Twilio SMS Backend

Complete backend for sending SMS and WhatsApp messages via Twilio to Nigerian numbers.

## ✅ What's Configured

- ✅ **Account SID:** Secured in `.env`
- ✅ **Twilio Number:** Secured in `.env`
- ✅ **WhatsApp Number:** Secured in `.env`
- ✅ **Auth Token:** Securely stored in `.env` (never shared)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start Backend (Development)

```bash
npm run dev
```

Expected output:
```
🚀 Church Communication Backend running on http://localhost:3000
📡 Twilio configured for SMS via: +16829073172
✨ CORS enabled for: http://localhost:5173
```

### 3. Start Frontend (New Terminal)

```bash
cd .. (back to root)
npm run dev
```

### 4. Test in App

- Log in (demo credentials in Login.tsx)
- Go to **Dashboard**
- Type a message
- Choose **SMS** channel
- Click **Send**
- Watch real SMS sent to your contacts! ✨

---

## 📡 API Endpoint

### POST `/api/broadcasts/send`

Send SMS and/or WhatsApp messages.

**Request:**
```json
{
  "broadcastId": "unique-id",
  "title": "Sunday Service",
  "body": "Join us this Sunday at 9 AM",
  "channels": "sms",
  "messages": [
    {
      "contactId": "c1",
      "phoneNumber": "+2349067180824",
      "channel": "sms",
      "body": "Join us this Sunday at 9 AM"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "broadcastId": "unique-id",
  "totalMessages": 1,
  "deliveries": [
    {
      "messageId": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "contactId": "c1",
      "phoneNumber": "+2349067180824",
      "channel": "sms",
      "status": "sending",
      "createdAt": "2026-05-25T10:30:00Z",
      "updatedAt": "2026-05-25T10:30:00Z"
    }
  ]
}
```

---

## ⚙️ Environment Variables

All stored in `backend/.env` (never commit):

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_here
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_here
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

---

## 🇳🇬 Nigerian Phone Format

All phone numbers must be in **E.164** format:

| Format | Example | Valid? |
|--------|---------|--------|
| E.164 | `+2349067180824` | ✅ |
| Local | `09067180824` | ❌ (frontend normalizes to E.164) |
| Digits only | `2349067180824` | ❌ |

Frontend converts local numbers to E.164 automatically via `normalizePhone()` in [src/utils/phone.ts](../src/utils/phone.ts).

---

## ✉️ SMS Behavior

- **Character Limit:** 160 chars per SMS
- **Long Messages:** Auto-split into multiple SMS (153 chars each after first)
- **Status:** "sending" → "delivered" or "failed"
- **Retry:** Twilio retries up to 72 hours on failure

---

## 💬 WhatsApp Setup (Next Step)

Currently configured with same number as SMS (`+16829073172`). To enable:

1. **Approve WhatsApp Business Account** on your Twilio console
2. **Update message templates** (WhatsApp requires pre-approved templates for production)
3. **Set `whatsappEnabled: true`** on contacts

See [WHATSAPP.md](./WHATSAPP.md) for detailed setup.

---

## 🐛 Troubleshooting

### **"Connection refused on port 3000"**
- Backend not running. Start with `npm run dev`
- Check if port 3000 is in use: `lsof -i :3000` (Mac/Linux)

### **"Invalid phone number" error from Twilio**
- Phone not in E.164 format (must include country code)
- Test format: `+234` + `9067180824` = `+2349067180824`

### **"401 Unauthorized" from Twilio**
- Check Auth Token in `.env` is correct
- Check Account SID is correct

### **Messages not delivered**
- Check contact's `phoneNumber` field in app
- Verify number is active (not deactivated in Twilio trial)
- Check Twilio console for logs: https://www.twilio.com/console/sms/logs

---

## 📊 Monitoring

Check message logs:

1. **Twilio Console:** https://www.twilio.com/console/sms/logs
2. **Backend Logs:** Terminal running `npm run dev`
3. **App UI:** View in **History** tab after sending

---

## 🔒 Security Notes

- ✅ Auth Token stored in `.env` (gitignored)
- ✅ Token never exposed to frontend
- ✅ CORS restricted to `http://localhost:5173` (dev only)
- ⚠️ For production, add authentication middleware

---

## 📦 Production Deployment

To deploy backend:

1. **Choose host:** Render, Railway, Heroku, AWS Lambda, etc.
2. **Set env vars:** Add on hosting platform
3. **Update CORS_ORIGIN:** Point to your frontend URL
4. **Update frontend API URL:** Change `http://localhost:3000` to your backend URL

Example (Render):
```bash
npm run build
npm start
```

---

## 📚 Next: WhatsApp Setup

Once SMS is working, see [WHATSAPP.md](./WHATSAPP.md) for WhatsApp configuration.
