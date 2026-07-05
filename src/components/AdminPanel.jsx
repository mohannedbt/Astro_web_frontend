import React, { useEffect, useState } from 'react';
import { fetchAdminNewsletterSubscribers, fetchAdminStats, deleteNewsletterSubscriber, fetchNewsletterTemplate, saveNewsletterTemplate, broadcastNewsletter } from '../services/api';

const initialFormState = {
  title: '',
  summary: '',
  description: '',
  date: '',
  time: '',
  duration: '',
  location: '',
  host: '',
  topic: '',
  status: 'upcoming',
  level: 'Beginner',
  capacity: 0,
  presentationLink: '',
  prerequisites: '',
  agenda: '',
};

const AdminPanel = ({ token: initialToken = '' }) => {
  const [token, setToken] = useState(initialToken || localStorage.getItem('token') || '');
  const [activeSection, setActiveSection] = useState('overview');
  const [workshops, setWorkshops] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ users: 0, workshops: 0, subscribers: 0 });
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [newsletterTemplateKey, setNewsletterTemplateKey] = useState('greeting');
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterBody, setNewsletterBody] = useState('');
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
const renderNewsletterPreview = (templateKey, subject, body) => {
  const cleanedBody = String(body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 14px;padding:0;">${line}</p>`)
    .join('') || '<p style="color:#52525b;margin:0;">Your newsletter content will appear here...</p>';

  const heroTitle =
    templateKey === 'workshop' ? 'Workshop News' :
    templateKey === 'announcement' ? 'Club Announcement' :
    'Welcome to Astro Club';

  const heroSub =
    subject ||
    (templateKey === 'workshop' ? 'A new hands-on session just opened up' :
     templateKey === 'announcement' ? 'The latest from the Astro Club community' :
     'Stay up to date with the latest from the astronomy community');

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Astro Club Newsletter</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;">
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
};

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      refreshAdminData();
    }
  }, [token]);

  const authHeaders = () => ({ Authorization: token ? `Bearer ${token}` : '' });

  const loadNewsletterTemplate = async (templateKey = 'greeting') => {
    try {
      const data = await fetchNewsletterTemplate(token, templateKey);
      setNewsletterTemplateKey(data.templateKey || templateKey);
      setNewsletterSubject(data.subject || '');
      setNewsletterBody(data.body || '');
    } catch (err) {
      setError('Failed to load newsletter template');
    }
  };

  const saveNewsletterSettings = async () => {
    if (!newsletterSubject || !newsletterBody) {
      setError('Subject and body are required');
      return;
    }
    try {
      await saveNewsletterTemplate(token, newsletterTemplateKey, newsletterSubject, newsletterBody);
      setStatusMessage('Newsletter template saved successfully.');
    } catch (err) {
      setError('Failed to save newsletter template');
    }
  };

  const sendNewsletterBroadcast = async () => {
    if (!confirm(`Send newsletter to ${stats.subscribers} subscribers?`)) return;
    setSendingNewsletter(true);
    setStatusMessage('Sending newsletter...');
    try {
      const result = await broadcastNewsletter(token, newsletterTemplateKey);
      setStatusMessage(`Newsletter sent: ${result.sent} succeeded, ${result.failed} failed.`);
      setSendingNewsletter(false);
    } catch (err) {
      setError('Failed to send newsletter');
      setSendingNewsletter(false);
    }
  };

  const refreshAdminData = async () => {
    setError('');
    setStatusMessage('Loading admin data...');
    await Promise.all([fetchWorkshops(), fetchStats(), fetchSubscribers()]);
    await loadNewsletterTemplate();
    setStatusMessage('');
  };

  const fetchWorkshops = async () => {
    try {
      const res = await fetch('/api/admin/workshops', { headers: authHeaders() });
      if (!res.ok) throw new Error('Unable to fetch workshops');
      const data = await res.json();
      setWorkshops(data);
    } catch (err) {
      setError('Could not load workshops. Check admin token and backend.');
    }
  };

  const fetchSubscribers = async () => {
    try {
      const data = await fetchAdminNewsletterSubscribers(token);
      setSubscribers(data);
    } catch (err) {
      setError('Could not load newsletter subscribers.');
    }
  };

  const fetchStats = async () => {
    try {
      const data = await fetchAdminStats(token);
      setStats(data);
    } catch (err) {
      setError('Could not load admin stats.');
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitWorkshop = async (event) => {
    event.preventDefault();
    setError('');
    setStatusMessage('Saving workshop...');
    try {
      const url = editingId ? `/api/admin/workshops/${editingId}` : '/api/admin/workshops';
      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        ...form,
        capacity: Number(form.capacity) || 0,
        presentation_link: form.presentationLink,
        prerequisites: form.prerequisites,
        agenda: form.agenda,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Save failed');
      }
      await refreshAdminData();
      resetForm();
      setStatusMessage(editingId ? 'Workshop updated successfully.' : 'Workshop added successfully.');
    } catch (err) {
      setError(`Failed to save workshop: ${err.message}`);
    }
  };

  const editWorkshop = (workshop) => {
    setEditingId(workshop.id);
    setForm({
      title: workshop.title || '',
      summary: workshop.summary || '',
      description: workshop.description || '',
      date: workshop.date || '',
      time: workshop.time || '',
      duration: workshop.duration || '',
      location: workshop.location || '',
      host: workshop.host || '',
      topic: workshop.topic || '',
      status: workshop.status || 'upcoming',
      level: workshop.level || 'Beginner',
      capacity: workshop.capacity || 0,
      presentationLink: workshop.presentation_link || workshop.presentationLink || '',
      prerequisites: Array.isArray(workshop.prerequisites) ? workshop.prerequisites.join('\n') : workshop.prerequisites || '',
      agenda: Array.isArray(workshop.agenda) ? workshop.agenda.join('\n') : workshop.agenda || '',
    });
    setActiveSection('workshops');
    setStatusMessage('Editing workshop details.');
  };

  const deleteWorkshop = async (id) => {
    if (!confirm('Delete this workshop permanently?')) return;
    setError('');
    setStatusMessage('Deleting workshop...');
    try {
      const res = await fetch(`/api/admin/workshops/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      await refreshAdminData();
      setStatusMessage('Workshop deleted.');
    } catch (err) {
      setError('Failed to delete workshop.');
    }
  };

  const removeSubscriber = async (id) => {
    if (!confirm('Remove newsletter subscriber?')) return;
    setError('');
    setStatusMessage('Removing subscriber...');
    try {
      await deleteNewsletterSubscriber(token, id);
      await fetchSubscribers();
      setStatusMessage('Subscriber removed.');
    } catch (err) {
      setError('Failed to remove subscriber.');
    }
  };

  const fetchFacebookEvents = async () => {
    setError('');
    setStatusMessage('Fetching events from Facebook...');
    try {
      const res = await fetch('/api/admin/fetch-facebook-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ pageId, accessToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Fetch failed');
      setStatusMessage(`Facebook sync complete: ${data.fetched} events fetched.`);
    } catch (err) {
      setError(`Facebook sync failed: ${err.message}`);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setWorkshops([]);
    setSubscribers([]);
    setStats({ users: 0, workshops: 0, subscribers: 0 });
    setStatusMessage('');
    setError('');
  };

  const sectionItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'facebook', label: 'Facebook Events' },
  ];

  const renderSection = () => {
    if (!token) {
      return (
        <div className="admin-card admin-card-empty">
          <h3>Admin access</h3>
          <p>
            Paste an admin token below to manage workshops, newsletter subscribers, and Facebook event sync.
          </p>
          <div className="admin-token-row">
            <input
              className="admin-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Admin token"
            />
            <button className="btn btn-primary" onClick={refreshAdminData} disabled={!token}>
              Load admin data
            </button>
          </div>
          <p className="admin-section-note">
            If you are an admin, you can also log in through the public login page and the token will be stored automatically.
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <div className="admin-section-stack">
            <div className="admin-card">
              <h3>Admin Overview</h3>
              <p className="admin-section-note">
                Use the left submenu to manage workshops, sync Facebook events, and review newsletter subscribers.
              </p>
              <div className="admin-summary-grid">
                {['users', 'workshops', 'subscribers'].map((key) => (
                  <div key={key} className="admin-summary-item">
                    <div>{key}</div>
                    <div className="admin-summary-amount">{stats[key]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <h3>Quick Actions</h3>
              <div className="admin-action-row">
                <button className="btn btn-primary admin-btn-primary" onClick={refreshAdminData}>Refresh all</button>
                <button className="btn admin-btn" onClick={() => setActiveSection('workshops')}>Manage workshops</button>
                <button className="btn admin-btn" onClick={() => setActiveSection('newsletter')}>Newsletter subscribers</button>
                <button className="btn admin-btn" onClick={() => setActiveSection('facebook')}>Facebook sync</button>
              </div>
            </div>
          </div>
        );
      case 'workshops':
        return (
          <div className="admin-section-stack">
            <div className="admin-card admin-card-form">
              <h3>{editingId ? 'Edit Workshop' : 'Add Workshop'}</h3>
              <form onSubmit={submitWorkshop} className="admin-form">
                <div className="admin-form-row-2">
                  <input required placeholder="Title" value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} />
                  <input placeholder="Topic" value={form.topic} onChange={(e) => handleFormChange('topic', e.target.value)} />
                </div>
                <div className="admin-form-row-3">
                  <input required placeholder="Date" value={form.date} onChange={(e) => handleFormChange('date', e.target.value)} />
                  <input placeholder="Time" value={form.time} onChange={(e) => handleFormChange('time', e.target.value)} />
                  <input placeholder="Duration" value={form.duration} onChange={(e) => handleFormChange('duration', e.target.value)} />
                </div>
                <div className="admin-form-row-2">
                  <input placeholder="Host / Instructor" value={form.host} onChange={(e) => handleFormChange('host', e.target.value)} />
                  <input placeholder="Location" value={form.location} onChange={(e) => handleFormChange('location', e.target.value)} />
                </div>
                <div className="admin-form-row-3">
                  <select value={form.status} onChange={(e) => handleFormChange('status', e.target.value)}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select value={form.level} onChange={(e) => handleFormChange('level', e.target.value)}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <input type="number" min="0" placeholder="Capacity" value={form.capacity} onChange={(e) => handleFormChange('capacity', e.target.value)} />
                </div>
                <input placeholder="Presentation link" value={form.presentationLink} onChange={(e) => handleFormChange('presentationLink', e.target.value)} />
                <textarea placeholder="Summary" rows="2" value={form.summary} onChange={(e) => handleFormChange('summary', e.target.value)} />
                <textarea placeholder="Full description" rows="4" value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} />
                <textarea placeholder="Prerequisites (one per line)" rows="3" value={form.prerequisites} onChange={(e) => handleFormChange('prerequisites', e.target.value)} />
                <textarea placeholder="Agenda items (one per line)" rows="3" value={form.agenda} onChange={(e) => handleFormChange('agenda', e.target.value)} />
                <div className="admin-form-actions">
                  <button className="btn btn-primary" type="submit">{editingId ? 'Update workshop' : 'Create workshop'}</button>
                  <button type="button" className="btn" onClick={resetForm}>Clear</button>
                </div>
              </form>
            </div>

            <div className="admin-card admin-card-table">
              <h3>Workshop library</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Topic</th>
                      <th>Date</th>
                      <th>Host</th>
                      <th>Capacity</th>
                      <th className="admin-table-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshops.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.status || 'upcoming'}</td>
                        <td>{item.topic || 'General'}</td>
                        <td>{item.date}</td>
                        <td>{item.host || item.instructor || 'TBA'}</td>
                        <td>{item.capacity ?? '0'}</td>
                        <td className="admin-table-actions">
                          <button className="btn" onClick={() => editWorkshop(item)}>Edit</button>
                          <button className="btn" onClick={() => deleteWorkshop(item.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'newsletter':
        return (
          <div className="admin-section-stack">
            <div className="admin-card admin-card-form">
              <h3>Newsletter Content & Template</h3>
              <p className="admin-section-note">
                Choose a design and enter the plain text body. The backend will render it using the Astro-style newsletter layout.
              </p>
              <div className="admin-form">
                <label>Template Design</label>
                <select
                  className="admin-input"
                  value={newsletterTemplateKey}
                  onChange={(e) => {
                    const nextKey = e.target.value;
                    setNewsletterTemplateKey(nextKey);
                    loadNewsletterTemplate(nextKey);
                  }}
                >
                  <option value="greeting">Greeting Template</option>
                  <option value="workshop">Workshop Template</option>
                  <option value="announcement">Announcement Template</option>
                </select>
                <label style={{ marginTop: '20px' }}>Subject Line</label>
                <input
                  className="admin-input"
                  placeholder="e.g., Astro Club Weekly Newsletter"
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                />
                <label style={{ marginTop: '20px' }}>Newsletter Body (plain text)</label>
                <textarea
                  className="admin-input"
                  placeholder="Write the newsletter body as plain text. Paragraphs will be rendered in the Astro newsletter layout."
                  rows="12"
                  value={newsletterBody}
                  onChange={(e) => setNewsletterBody(e.target.value)}
                />
                <div className="admin-form-actions" style={{ marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={saveNewsletterSettings}>Save Template</button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                </div>
              </div>
            </div>

            {showPreview && (
              <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Newsletter Preview</h3>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => setShowPreview(false)}
                  >
                    Close
                  </button>
                </div>
                <iframe
                  title="Newsletter Preview"
                  srcDoc={renderNewsletterPreview(newsletterTemplateKey, newsletterSubject, newsletterBody)}
                  style={{
                    width: '100%',
                    height: '600px',
                    border: 'none',
                    background: '#09090b',
                  }}
                  sandbox="allow-same-origin"
                />
              </div>
            )}

            <div className="admin-card">
              <h3>Send Newsletter Broadcast</h3>
              <p className="admin-section-note">
                Send the newsletter template above to all {stats.subscribers} subscribers at once.
              </p>
              <div className="admin-action-row" style={{ marginTop: '16px' }}>
                <button
                  className="btn btn-primary"
                  onClick={sendNewsletterBroadcast}
                  disabled={sendingNewsletter || stats.subscribers === 0}
                >
                  {sendingNewsletter ? 'Sending...' : 'Broadcast to All'}
                </button>
              </div>
            </div>

            <div className="admin-card">
              <h3>Newsletter Subscribers</h3>
              <p>
                Manage email targets, remove invalid addresses, and keep your mailing list synced.
              </p>
              <div className="admin-action-row admin-card-row">
                <div>{stats.subscribers} subscribers currently stored.</div>
                <button className="btn btn-primary" onClick={fetchSubscribers}>Refresh list</button>
              </div>
            </div>

            <div className="admin-card admin-card-table admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Subscribed At</th>
                    <th className="admin-table-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td>{subscriber.email}</td>
                      <td>{new Date(subscriber.subscribed_at).toLocaleString()}</td>
                      <td className="admin-table-actions">
                        <button className="btn" onClick={() => removeSubscriber(subscriber.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'facebook':
        return (
          <div className="admin-section-stack">
            <div className="admin-card">
              <h3>Facebook Event Sync</h3>
              <p>
                Import events from a Facebook page so the public Events section stays updated automatically.
              </p>
              <div className="admin-form admin-form-stack">
                <input
                  className="admin-input"
                  placeholder="Facebook Page ID"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                />
                <input
                  className="admin-input"
                  placeholder="Facebook Access Token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <div className="admin-form-actions">
                  <button className="btn btn-primary" onClick={fetchFacebookEvents}>Fetch Events</button>
                  <button className="btn" onClick={() => { setPageId(''); setAccessToken(''); }}>Clear</button>
                </div>
                <small className="admin-section-note">
                  If environment variables are configured on the backend, this will use them automatically. Otherwise paste your page id and token here.
                </small>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-content admin-page">
      <div className="admin-panel-header">
        <div>
          <h2>Admin Panel</h2>
          <p className="admin-section-note">
            Organized admin sections let you manage workshops, sync Facebook events, and review newsletter subscribers in one place.
          </p>
        </div>
        <div className="admin-header-actions">
          {token && <button className="btn admin-btn" onClick={logout}>Log out</button>}
          <button className="btn btn-primary admin-btn-primary" onClick={refreshAdminData}>Refresh</button>
        </div>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {statusMessage && <div className="admin-status">{statusMessage}</div>}

      <div className="admin-panel-grid">
        <aside className="admin-panel-sidebar">
          {sectionItems.map((item) => (
            <button
              key={item.id}
              className={`btn admin-side-button ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <section>{renderSection()}</section>
      </div>
    </div>
  );
};

export default AdminPanel;
