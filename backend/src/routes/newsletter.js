const { dbAll, dbRun } = require('../middleware/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { sendNewsletterService, getNewsletterTemplate, saveNewsletterTemplate, renderNewsletterHtml, DEFAULT_NEWSLETTER_TEMPLATES, NEWSLETTER_TEMPLATE_KEYS } = require('../services/newsletter');

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'insatastroclub@gmail.com';
const nodemailer = require('nodemailer');

function logNewsletterServiceError(error, context) {
  console.error(`newsletter service integration failed [${context}]`, {
    message: error?.message,
    stack: error?.stack,
    code: error?.code,
    responseStatus: error?.response?.status,
    responseData: error?.response?.data,
    responseHeaders: error?.response?.headers,
    request: error?.request,
  });
}

function newsletterRoutes(app) {
  // Public: subscribe to newsletter
  app.post('/api/newsletter/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    const subscribed_at = new Date().toISOString();

    try {
      await dbRun(
        'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET subscribed_at = excluded.subscribed_at',
        [email, subscribed_at]
      );

      try {
        await sendNewsletterService(email);
      } catch (serviceError) {
        logNewsletterServiceError(serviceError, 'subscribe');
        const reason = serviceError?.message || 'Unknown newsletter error';
        return res.status(502).json({ error: 'Newsletter service integration failed', reason });
      }

      return res.json({ success: true });
    } catch (e) {
      console.error('newsletter subscribe error', e.message || e);
      return res.status(500).json({ error: 'Unable to subscribe' });
    }
  });

  // Admin: list subscribers
  app.get('/api/admin/newsletter-subscribers', authMiddleware, adminOnly, async (req, res) => {
    const rows = await dbAll('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
    res.json(rows);
  });

  // Admin: delete subscriber
  app.delete('/api/admin/newsletter-subscribers/:id', authMiddleware, adminOnly, async (req, res) => {
    const id = req.params.id;
    await dbRun('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
    res.json({ success: true });
  });

  // Admin: get newsletter template
  app.get('/api/admin/newsletter-template', authMiddleware, adminOnly, async (req, res) => {
    try {
      const key = req.query.template_key || 'greeting';
      const template = await getNewsletterTemplate(key);
      res.json({ templateKey: key, ...template });
    } catch (e) {
      res.status(500).json({ error: 'Unable to load newsletter template' });
    }
  });

  // Admin: save newsletter template
  app.put('/api/admin/newsletter-template', authMiddleware, adminOnly, async (req, res) => {
    const { templateKey = 'greeting', subject, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }
    try {
      await saveNewsletterTemplate(templateKey, subject, body);
      res.json({ success: true });
    } catch (e) {
      console.error('newsletter template save error', e.message || e);
      res.status(500).json({ error: 'Unable to save newsletter template' });
    }
  });

  // Admin: broadcast newsletter
  app.post('/api/admin/newsletter/broadcast', authMiddleware, adminOnly, async (req, res) => {
    try {
      const subscribers = await dbAll('SELECT email FROM newsletter_subscribers');
      if (subscribers.length === 0) {
        return res.json({ success: true, sent: 0, message: 'No subscribers to send to.' });
      }

      const templateKey = req.body.templateKey || 'greeting';
      const template = await getNewsletterTemplate(templateKey);
      const subject = template.subject || DEFAULT_NEWSLETTER_TEMPLATES[templateKey].subject;
      const html = renderNewsletterHtml(templateKey, template.body || DEFAULT_NEWSLETTER_TEMPLATES[templateKey].body);

      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_PORT) {
        return res.status(502).json({ error: 'SMTP not configured on backend' });
      }

      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      let sent = 0;
      let failed = 0;
      const errors = [];

      for (const sub of subscribers) {
        try {
          await transporter.sendMail({
            from: SMTP_FROM,
            to: sub.email,
            subject,
            html,
          });
          sent++;
        } catch (err) {
          failed++;
          errors.push({ email: sub.email, error: err.message });
          console.error(`Failed to send to ${sub.email}:`, err.message);
        }
      }

      res.json({
        success: true,
        sent,
        failed,
        total: subscribers.length,
        message: `Newsletter sent to ${sent}/${subscribers.length} subscribers.`,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (e) {
      console.error('newsletter broadcast error', e.message || e);
      res.status(500).json({ error: 'Newsletter broadcast failed' });
    }
  });
}

module.exports = { newsletterRoutes };