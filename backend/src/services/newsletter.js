const axios = require('axios');
const nodemailer = require('nodemailer');
const { dbAll, dbGet, dbRun } = require('../middleware/database');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_EMAIL_FROM = process.env.RESEND_EMAIL_FROM;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_LIST_ID = process.env.SENDGRID_LIST_ID;
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'insatastroclub@gmail.com';
const NEWSLETTER_WEBHOOK_URL = process.env.NEWSLETTER_WEBHOOK_URL;

const NEWSLETTER_TEMPLATE_KEYS = ['greeting', 'workshop', 'announcement'];
const DEFAULT_NEWSLETTER_TEMPLATES = {
  greeting: {
    subject: 'Welcome to Astro Club!',
    body: `Thanks for joining the Astro Club community.

You are now subscribed to receive the latest workshops, events, and astronomy updates. We are excited to have you with us!

Explore our upcoming workshops, read the latest sky guides, and connect with fellow stargazers.

Clear skies,
The Astro Club team`,
  },
  workshop: {
    subject: 'New Astro Workshop Available',
    body: `We have a brand new workshop ready for you.

This session covers hands-on astronomy tools, observation techniques, and real-time sky mapping.

Visit the Astro Club dashboard to reserve your spot today!`,
  },
  announcement: {
    subject: 'Astro Club Update',
    body: `Here's the latest Astro Club announcement.

Stay tuned for our upcoming events, feature releases, and community news.

Thank you for being part of the Astro community.`,
  },
};

function renderNewsletterHtml(templateKey, bodyText) {
  const cleanedBody = String(bodyText || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => `<p>${line}</p>`).join('');
  const templateClass = templateKey === 'workshop' ? 'newsletter-workshop' : templateKey === 'announcement' ? 'newsletter-announcement' : 'newsletter-greeting';
  const heroTitle = templateKey === 'workshop' ? 'Workshop News' : templateKey === 'announcement' ? 'Club Announcement' : 'Welcome to Astro Club';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${templateKey}</title><style>
      body { margin: 0; padding: 0; background: #09090b; color: #fafafa; font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
      .container { width: 100%; max-width: 720px; margin: 0 auto; padding: 32px; }
      .card { background: #18181b; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 32px; }
      .hero { color: #fff; padding: 28px; border-radius: 22px; margin-bottom: 24px; }
      .hero h1 { margin: 0; font-size: 28px; font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.02em; font-weight: 700; }
      .hero p { margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.5; }
      .section { margin-bottom: 24px; font-size: 15px; line-height: 1.7; color: #a1a1aa; }
      .section p { margin: 0 0 12px; }
      .section strong { color: #fafafa; }
      .footer { font-size: 13px; color: #52525b; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 20px; }
      .ambient { background: radial-gradient(ellipse at top, rgba(167, 139, 250, 0.08) 0%, transparent 50%); padding: 2px 0; }
      .newsletter-greeting .hero { background: linear-gradient(135deg, #2563eb, #0ea5e9); }
      .newsletter-workshop .hero { background: linear-gradient(135deg, #7c3aed, #22d3ee); }
      .newsletter-announcement .hero { background: linear-gradient(135deg, #0f766e, #2dd4bf); }
    </style></head><body>
      <div class="ambient">
      <div class="container ${templateClass}">
        <div style="display:flex;align-items:center;gap:10px;color:#fafafa;margin-bottom:24px;">
          <div style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,0.08);display:grid;place-items:center;font-size:18px;">✦</div>
          <div>
            <div style="font-weight:700;font-size:16px;font-family:'Space Grotesk','Inter',system-ui,sans-serif;">Astro Club INSAT</div>
            <div style="font-size:12px;color:#a1a1aa;">Community portal</div>
          </div>
        </div>
        <div class="hero">
          <h1>${heroTitle}</h1>
          <p>Stay up to date with the latest from the astronomy community</p>
        </div>
        <div class="card">
          <div class="section">${cleanedBody}</div>
          <div class="section footer">You are receiving this because you're subscribed to the Astro Club newsletter.</div>
        </div>
        <div style="text-align:center;padding:24px 0 8px;font-size:12px;color:#52525b;">
          Astro Club INSAT &bull; Community Portal
        </div>
      </div>
      </div>
    </body></html>`;
}

async function getNewsletterTemplate(key = 'greeting') {
  if (!NEWSLETTER_TEMPLATE_KEYS.includes(key)) key = 'greeting';
  const row = await dbGet('SELECT subject, body FROM newsletter_template WHERE template_key = ?', [key]);
  if (row) {
    return { subject: row.subject || DEFAULT_NEWSLETTER_TEMPLATES[key].subject, body: row.body || DEFAULT_NEWSLETTER_TEMPLATES[key].body };
  }
  return DEFAULT_NEWSLETTER_TEMPLATES[key];
}

async function saveNewsletterTemplate(key = 'greeting', subject, body) {
  if (!NEWSLETTER_TEMPLATE_KEYS.includes(key)) key = 'greeting';
  await dbRun(
    'INSERT INTO newsletter_template (template_key, subject, body) VALUES (?, ?, ?) ON CONFLICT (template_key) DO UPDATE SET subject = excluded.subject, body = excluded.body',
    [key, subject, body]
  );
}

async function sendNewsletterService(email, key = 'greeting') {
  if (!NEWSLETTER_TEMPLATE_KEYS.includes(key)) key = 'greeting';
  const template = await getNewsletterTemplate(key);
  const subject = template.subject || DEFAULT_NEWSLETTER_TEMPLATES[key].subject;
  const html = renderNewsletterHtml(key, template.body || DEFAULT_NEWSLETTER_TEMPLATES[key].body);

  if (SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_PORT) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject,
      html,
    });
    return;
  }

  if (RESEND_API_KEY) {
    await axios.post(
      'https://api.resend.com/emails',
      {
        from: RESEND_EMAIL_FROM,
        to: email,
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return;
  }

  if (SENDGRID_API_KEY && SENDGRID_LIST_ID) {
    const payload = {
      contacts: [{ email }],
      list_ids: [SENDGRID_LIST_ID],
    };
    await axios.put('https://api.sendgrid.com/v3/marketing/contacts', payload, {
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return;
  }

  if (MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID && MAILCHIMP_SERVER_PREFIX) {
    const crypto = require('crypto');
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`;
    await axios.put(url, {
      email_address: email,
      status_if_new: 'subscribed',
    }, {
      auth: { username: 'anyuser', password: MAILCHIMP_API_KEY },
    });
    return;
  }

  if (NEWSLETTER_WEBHOOK_URL) {
    await axios.post(NEWSLETTER_WEBHOOK_URL, { email, source: 'astro-club', subscribed_at: new Date().toISOString() });
    return;
  }

  throw new Error('No newsletter delivery method configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, or NEWSLETTER_WEBHOOK_URL.');
}

module.exports = {
  renderNewsletterHtml,
  getNewsletterTemplate,
  saveNewsletterTemplate,
  sendNewsletterService,
  DEFAULT_NEWSLETTER_TEMPLATES,
  NEWSLETTER_TEMPLATE_KEYS,
};