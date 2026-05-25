# 💬 WhatsApp Setup for Twilio

Your SMS backend is ready. Here's **exactly what you need to provide** to make WhatsApp work in Nigeria.

---

## 📋 What You Need to Provide (3 Steps)

### **Step 1: WhatsApp Business Account**

You'll need Meta's WhatsApp Business Account. Provide me:

- [ ] **WhatsApp Business Account Phone Number** (e.g., `+234XXXXXXXXXX`)
  - *This is the number WhatsApp messages will come FROM*
  - Must be different from SMS number (`+16829073172`)
  - Should be a real Nigerian number or a WhatsApp Business API number

- [ ] **WhatsApp Business Account ID** (from Meta Business Manager)
  - Found at: https://business.facebook.com/settings/apps
  - Looks like: `1234567890123456`

- [ ] **WhatsApp Business Phone Number ID** (from Twilio)
  - Go to: https://www.twilio.com/console/sms/whatsapp/learn
  - Twilio links your WhatsApp Business Account to your Twilio account

---

### **Step 2: Message Templates (Required for WhatsApp)**

WhatsApp messages must use pre-approved templates. What you send:

1. **Template Name** — e.g., `sunday_service_reminder`
2. **Template Body** — e.g., 
   ```
   Beloved, join us this Sunday at 9:00 AM for worship. 
   Come expecting a mighty move of God! 🙏
   ```
3. **Language** — English (`en`)
4. **Category** — `MARKETING` or `TRANSACTIONAL`

You can provide **3-5 templates** and I'll configure them.

---

### **Step 3: Verify WhatsApp Business Account**

Meta requires verification:

- [ ] **Business Name** — Your church name
- [ ] **Business Category** — Select "Religious Organization"
- [ ] **Business Website** — If you have one
- [ ] **Business Address** — Your church location in Nigeria

---

## 🔄 How WhatsApp Will Work (Once Setup)

```
Your App (Dashboard)
  ↓ Select "SMS + WhatsApp"
  ↓
Backend (backend/src/twilio.ts)
  ↓ Sends via Twilio
  ↓
Twilio API
  ↓
Meta WhatsApp Business API
  ↓
WhatsApp Messages to contacts
```

---

## ✅ Once You Provide the Info Above

I will:

1. **Update `backend/.env`** with WhatsApp credentials
2. **Create message templates** in Meta & Twilio
3. **Update `backend/src/routes/broadcasts.ts`** to format WhatsApp messages
4. **Update `src/App.tsx`** to support "SMS + WhatsApp" channel
5. **Test** both channels working together

---

## 📱 Current State

- ✅ SMS fully working
- ❌ WhatsApp waiting for your credentials
- ⏳ `+16829073172` currently SMS only (can't send WhatsApp)

---

## 🎯 Getting WhatsApp Business Account

### Option A: Use Meta's Official WhatsApp Business API (Recommended)
1. Go to https://www.whatsapp.com/business/
2. Click "Get Started"
3. Follow verification steps
4. **Provide me:** Business Account ID + Phone Number ID

### Option B: Use Your Church's Existing WhatsApp Number
1. If you have a WhatsApp number for church already
2. Contact Meta Business Support to convert to Business Account
3. **Provide me:** The number + Account credentials

### Option C: Use Twilio's Sandbox (Testing Only)
- Already available in Twilio console
- Only for testing (not production)
- Auto-set to Twilio sandbox number

---

## 💡 What I Need From You (Copy & Paste)

Fill this out and send back:

```
WhatsApp Business Account Info:
- Business Name: _______________
- WhatsApp Business Phone: _______________
- Business Account ID: _______________
- Phone Number ID (from Twilio): _______________
- Business Category: Religious Organization
- Business Address: _______________

Message Templates (3-5):
Template 1:
- Name: _______________
- Body: _______________

Template 2:
- Name: _______________
- Body: _______________
```

---

## 🔒 Security

- WhatsApp credentials will be stored in `backend/.env` (gitignored)
- No credentials ever exposed to frontend
- API calls server-to-server only

---

## 📊 Pricing (WhatsApp in Nigeria)

| Recipient Type | Cost |
|---|---|
| Business Account (verification) | Free (one-time) |
| Messages sent | ₦3-8 per message |
| Messages received | Free |

---

## ⏱️ Timeline

Once you provide the info:
- **Day 1:** Meta approves templates (~24 hours)
- **Day 2:** I configure backend
- **Day 3:** WhatsApp live in your app ✨

---

## 🚨 Important Limitations

1. **WhatsApp numbers must be verified** — Meta verification takes 24-48 hours
2. **Templates must be pre-approved** — Can't send arbitrary messages
3. **Rate limits** — Twilio: 100 msgs/sec (plenty for churches)
4. **Must comply with Meta ToS** — No spam, promotions only to opted-in contacts

---

## ❓ FAQ

**Q: Can I use my personal WhatsApp number?**  
A: No, must be Business Account. Personal accounts can't use API.

**Q: How long until WhatsApp works?**  
A: 1-3 days after you provide credentials + Meta approval.

**Q: Can I send custom text (not templates)?**  
A: Not for broadcast messages. WhatsApp requires pre-approved templates for scale.

**Q: What if verification fails?**  
A: Contact Meta Support or Twilio support for help.

---

## 🎬 Next Steps

1. ✅ **SMS is ready NOW** — Start using it!
2. 📋 **Gather WhatsApp info above**
3. 📧 **Send me the template + credentials**
4. ⏳ **I'll configure everything**
5. ✨ **WhatsApp live in your app**

---

**Ready to add WhatsApp? Send the info above!**
