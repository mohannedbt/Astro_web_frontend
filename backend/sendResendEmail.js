require('dotenv').config();
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const Database = require('better-sqlite3');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM || 'insatastroclub@gmail.com';
const TO = process.env.SMTP_TEST_TO || 'mohannedbentaleb8@gmail.com';
const DATABASE_URL = process.env.DATABASE_URL;
const TEMPLATE_KEY = process.env.NEWSLETTER_TEMPLATE_KEY || 'greeting';
const DEFAULT_SUBJECT = process.env.NEWSLETTER_SUBJECT || 'Astro Club Newsletter Test';
const DEFAULT_BODY = process.env.NEWSLETTER_BODY || 'Hello,\n\nThis is a test email using the current Astro newsletter template.\n\nIf this arrives, the SMTP connection and newsletter layout are working.\n\nBest,\nAstro Club';

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.error('Missing SMTP configuration in backend/.env. Fill SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
  process.exit(1);
}function renderNewsletterHtml(templateKey, bodyText) {
  const cleanedBody = String(bodyText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 14px;padding:0;">${line}</p>`)
    .join('');

  const heroTitle =
    templateKey === 'workshop' ? 'Workshop News' :
    templateKey === 'announcement' ? 'Club Announcement' :
    'Welcome to Astro Club';

  const heroSub =
    templateKey === 'workshop' ? 'A new hands-on session just opened up' :
    templateKey === 'announcement' ? 'The latest from the Astro Club community' :
    'Stay up to date with the latest from the astronomy community';

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Astro Club Newsletter</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${heroSub}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#09090b;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">

          <!-- Brand row -->
          <tr>
            <td style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:36px;height:36px;background-color:#fafafa;border-radius:8px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#09090b;">
                    &#10022;
                  </td>
                  <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;">
                    <div style="font-size:15px;font-weight:bold;color:#fafafa;">Astro Club INSAT</div>
                    <div style="font-size:12px;color:#a1a1aa;">Community portal</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background-color:#18181b;border:1px solid #2a2a2e;border-radius:16px;padding:32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:14px;">
                    <span style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;color:#a1a1aa;border:1px solid #2a2a2e;border-radius:20px;padding:5px 12px;">
                      Global Astronomy Network
                    </span>
                  </td>
                </tr>
              </table>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#fafafa;margin-bottom:8px;line-height:1.25;">
                ${heroTitle}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#a1a1aa;line-height:1.6;">
                ${heroSub}
              </div>
            </td>
          </tr>

          <tr><td style="height:20px;line-height:20px;font-size:0;">&nbsp;</td></tr>

          <!-- Body card -->
          <tr>
            <td style="background-color:#18181b;border:1px solid #2a2a2e;border-radius:16px;padding:28px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#c4c4c8;">
                ${cleanedBody}
              </div>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                <tr>
                  <td style="background-color:#fafafa;border-radius:24px;">
                    <a href="#" style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#09090b;text-decoration:none;">
                      Visit Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <div style="border-top:1px solid #2a2a2e;margin-top:24px;padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;">
                You are receiving this because you're subscribed to the Astro Club newsletter.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#52525b;">
              Astro Club INSAT &bull; Community Portal
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
async function ensureSqliteTemplateTable(db) {
  db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_key TEXT UNIQUE,
    subject TEXT,
    body TEXT
  )`).run();

  const exists = db.prepare('SELECT 1 FROM newsletter_template WHERE template_key = ?').get(TEMPLATE_KEY);
  if (!exists) {
    db.prepare('INSERT INTO newsletter_template (template_key, subject, body) VALUES (?, ?, ?)')
      .run(TEMPLATE_KEY, DEFAULT_SUBJECT, DEFAULT_BODY);
  }
}

async function loadNewsletterTemplate() {
  if (DATABASE_URL) {
    const pool = new Pool({ connectionString: DATABASE_URL });
    try {
      const result = await pool.query('SELECT subject, body FROM newsletter_template WHERE template_key = $1', [TEMPLATE_KEY]);
      if (result.rows.length > 0) {
        return {
          subject: result.rows[0].subject || DEFAULT_SUBJECT,
          body: result.rows[0].body || DEFAULT_BODY,
        };
      }
      return { subject: DEFAULT_SUBJECT, body: DEFAULT_BODY };
    } catch (error) {
      console.warn('Unable to load newsletter template from DB, using defaults:', error.message || error);
      return { subject: DEFAULT_SUBJECT, body: DEFAULT_BODY };
    } finally {
      await pool.end();
    }
  }

  const db = new Database(__dirname + '/data.db');
  try {
    await ensureSqliteTemplateTable(db);
    const row = db.prepare('SELECT subject, body FROM newsletter_template WHERE template_key = ?').get(TEMPLATE_KEY);
    if (row) {
      return { subject: row.subject || DEFAULT_SUBJECT, body: row.body || DEFAULT_BODY };
    }
    return { subject: DEFAULT_SUBJECT, body: DEFAULT_BODY };
  } finally {
    db.close();
  }
}

async function main() {
  console.log('SMTP Config:');
  console.log(`  Host: ${SMTP_HOST}`);
  console.log(`  Port: ${SMTP_PORT}`);
  console.log(`  Secure: ${SMTP_SECURE}`);
  console.log(`  User: ${SMTP_USER}`);
  console.log(`  Pass length: ${SMTP_PASS ? SMTP_PASS.length : 0} chars`);
  console.log(`  From: ${FROM}`);
  console.log(`  To: ${TO}`);
  console.log(`  Template key: ${TEMPLATE_KEY}`);

  const template = await loadNewsletterTemplate();
  console.log(`Using newsletter template subject: ${template.subject}`);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const html = renderNewsletterHtml(template.body || DEFAULT_BODY);

  const info = await transporter.sendMail({
    from: FROM,
    to: TO,
    subject: template.subject,
    html,
  });

  console.log('Email sent successfully:', info.messageId || info.response || info);
}

main().catch((error) => {
  console.error('Failed to send email:', error.response?.data || error.message || error);
  process.exit(1);
});
