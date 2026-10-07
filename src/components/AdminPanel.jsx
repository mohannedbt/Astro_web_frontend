import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Camera,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Check,
  UploadCloud,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sparkles,
  MapPin,
  Clock,
  Users,
  LayoutDashboard,
  Mail,
  Globe2,
} from 'lucide-react';
import {
  ACI_EVENTS,
  fetchAdminNewsletterSubscribers,
  fetchAdminStats,
  deleteNewsletterSubscriber,
  fetchNewsletterTemplate,
  saveNewsletterTemplate,
  broadcastNewsletter,
  fetchEvents,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
} from '../services/api';
import { optimizeImageFile } from '../utils/optimizeImage';

const initialWorkshopFormState = {
  topic: '',
  host: '',
  description: '',
  date: '',
  level: 'Beginner',
  status: 'upcoming',
  image_url: '',
  presentation_link: '',
};

const initialEventFormState = {
  title: '',
  category: 'Observation',
  date: '',
  time: '21:00 - 02:00',
  location: '',
  capacity: 40,
  status: 'Upcoming',
  description: '',
  image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=85',
  cameraSpecs: '35mm Film • 50mm f/1.4 • ISO 800',
  gallery: [],
};

const PRESET_EVENT_IMAGES = [
  {
    name: 'Meteor Fireball Over Mountains',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=85',
    category: 'Meteor Shower',
  },
  {
    name: 'Deep Orion Nebula Cloud',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=85',
    category: 'Astrophotography',
  },
  {
    name: 'Total Crimson Lunar Eclipse',
    url: 'https://images.unsplash.com/photo-1532693322450-2f6e1c8c9be6?auto=format&fit=crop&w=1920&q=85',
    category: 'Eclipse',
  },
  {
    name: 'Saturn & Gas Giant System',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1920&q=85',
    category: 'Observation',
  },
  {
    name: 'Milky Way Core Over Ruins',
    url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1920&q=85',
    category: 'Night Sky',
  },
  {
    name: 'Observatory Dome Under Aurora',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=85',
    category: 'Observatory',
  },
];

const AdminPanel = ({ token: initialToken = '' }) => {
  const [token, setToken] = useState(initialToken || localStorage.getItem('token') || '');
  const [activeSection, setActiveSection] = useState('overview');

  // Workshops & Subscribers State
  const [workshops, setWorkshops] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ users: 0, workshops: 0, events: 0, subscribers: 0 });
  const [workshopForm, setWorkshopForm] = useState(initialWorkshopFormState);
  const [editingWorkshopId, setEditingWorkshopId] = useState(null);

  // Events CMS State
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState(initialEventFormState);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventLivePreview, setEventLivePreview] = useState(true);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // ACI Flagship Event Dates (admin can set confirmed dates for the 3 fixed events)
  const [aciFlagshipDates, setAciFlagshipDates] = useState(() =>
    ACI_EVENTS.reduce((acc, ev) => {
      acc[ev.id] = { date: '', time: ev.time || '' };
      return acc;
    }, {})
  );
  const [flagshipSaveStatus, setFlagshipSaveStatus] = useState('');

  // Facebook & Newsletter State
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [newsletterTemplateKey, setNewsletterTemplateKey] = useState('greeting');
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterBody, setNewsletterBody] = useState('');
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      refreshAdminData();
    }
  }, [token]);

  const authHeaders = () => ({ Authorization: token ? `Bearer ${token}` : '' });

  const refreshAdminData = async () => {
    setError('');
    setStatusMessage('Loading admin data...');
    await Promise.all([fetchWorkshops(), fetchAdminEvents(), fetchStats(), fetchSubscribers()]);
    await loadNewsletterTemplate();
    setStatusMessage('');
  };

  const fetchWorkshops = async () => {
    try {
      const res = await fetch('/api/admin/workshops', { headers: authHeaders() });
      if (!res.ok) throw new Error('Unable to fetch workshops');
      const data = await res.json();
      setWorkshops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load workshops from API', err);
    }
  };

  const fetchAdminEvents = async () => {
    try {
      const evList = await fetchEvents(token);
      setEvents(Array.isArray(evList) ? evList : []);
    } catch (err) {
      console.warn('Could not load events', err);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const data = await fetchAdminNewsletterSubscribers(token);
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load newsletter subscribers', err);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await fetchAdminStats(token);
      setStats({
        users: data?.users || 0,
        workshops: data?.workshops || workshops.length || 0,
        events: data?.events || events.length || 5,
        subscribers: data?.subscribers || 0,
      });
    } catch (err) {
      console.warn('Could not load admin statistics', err);
      setStats((prev) => ({
        ...prev,
        events: events.length || 5,
      }));
    }
  };

  const loadNewsletterTemplate = async (templateKey = 'greeting') => {
    try {
      const data = await fetchNewsletterTemplate(token, templateKey);
      setNewsletterTemplateKey(data.templateKey || templateKey);
      setNewsletterSubject(data.subject || '');
      setNewsletterBody(data.body || '');
    } catch (err) {
      console.warn('Failed to load newsletter template', err);
    }
  };

  /* ================= EVENTS CMS HANDLERS ================= */
  const handleEventFormChange = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const optimizedImage = await optimizeImageFile(file, { maxDimension: 1600, quality: 0.84 });
      setEventForm((prev) => ({
        ...prev,
        image: optimizedImage,
        gallery: [optimizedImage, ...(prev.gallery || []).filter((url) => url !== optimizedImage)],
      }));
      setError('');
      setStatusMessage('Event photo ready. Save the event to publish it.');
    } catch (uploadError) {
      setError(`Could not upload event photo: ${uploadError.message}`);
    }
  };

  const handleWorkshopImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const optimizedImage = await optimizeImageFile(file, { maxDimension: 1200, quality: 0.84 });
      handleWorkshopFormChange('image_url', optimizedImage);
      setError('');
      setStatusMessage('Workshop photo ready. Save the workshop to publish it.');
    } catch (uploadError) {
      setError(`Could not upload workshop photo: ${uploadError.message}`);
    }
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    const url = newGalleryUrl.trim();
    setEventForm((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), url],
    }));
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index) => {
    setEventForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== index),
    }));
  };

  const handleMoveGalleryImage = (index, direction) => {
    const nextList = [...(eventForm.gallery || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setEventForm((prev) => ({
      ...prev,
      gallery: nextList,
      image: nextList[0] || prev.image,
    }));
  };

  const editEvent = (event) => {
    setEditingEventId(event.id);
    const dateFormatted = event.date || (event.startAt ? event.startAt.split('T')[0] : '');
    setEventForm({
      title: event.title || '',
      category: event.category || 'Observation',
      date: dateFormatted,
      time: event.time || '21:00 - 02:00',
      location: event.location || '',
      capacity: event.capacity || 40,
      status: event.status || 'Upcoming',
      description: event.description || '',
      image: event.image || event.image_url || '',
      cameraSpecs: event.cameraSpecs || '35mm Film • 50mm f/1.4',
      gallery: Array.isArray(event.gallery) ? event.gallery : [event.image].filter(Boolean),
    });
    setActiveSection('events');
    setStatusMessage(`Editing event: "${event.title}"`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetEventForm = () => {
    setEventForm(initialEventFormState);
    setEditingEventId(null);
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      setError('Event title is required');
      return;
    }
    setError('');
    setStatusMessage(editingEventId ? 'Updating event plate...' : 'Publishing new expedition...');

    const payload = {
      ...eventForm,
      startAt: eventForm.date ? `${eventForm.date}T20:00:00` : new Date().toISOString(),
      capacity: Number(eventForm.capacity) || 0,
      image_url: eventForm.image,
    };

    try {
      if (editingEventId) {
        await updateAdminEvent(token, editingEventId, payload);
        setStatusMessage('Event updated successfully in live archive.');
      } else {
        await createAdminEvent(token, payload);
        setStatusMessage('New expedition published to live calendar.');
      }
      await fetchAdminEvents();
      resetEventForm();
    } catch (err) {
      setError(`Failed to save event: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setError('');
    setStatusMessage('Deleting event...');
    try {
      await deleteAdminEvent(token, id);
      await fetchAdminEvents();
      setStatusMessage('Event deleted from archive.');
      if (editingEventId === id) resetEventForm();
    } catch (err) {
      setError(`Failed to delete event: ${err.message}`);
    }
  };

  /* ================= ACI FLAGSHIP DATE HANDLERS ================= */
  const handleFlagshipDateChange = (eventId, field, value) => {
    setAciFlagshipDates((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], [field]: value },
    }));
  };

  const saveFlagshipDate = async (aciEvent) => {
    const dateInfo = aciFlagshipDates[aciEvent.id];
    if (!dateInfo?.date) {
      setFlagshipSaveStatus(`Please select a date for "${aciEvent.title}".`);
      return;
    }
    setFlagshipSaveStatus(`Saving date for "${aciEvent.title}"...`);
    const payload = {
      title: aciEvent.title,
      category: aciEvent.category,
      date: dateInfo.date,
      time: dateInfo.time || aciEvent.time,
      startAt: `${dateInfo.date}T${(dateInfo.time || aciEvent.time || '20:00').split(' - ')[0]}:00`,
      location: aciEvent.location,
      capacity: aciEvent.capacity,
      status: 'Upcoming',
      description: aciEvent.description,
      image: typeof aciEvent.image === 'string' ? aciEvent.image : '',
      image_url: typeof aciEvent.image === 'string' ? aciEvent.image : '',
      dateConfirmed: true,
    };
    try {
      // Check if the event already exists in the backend
      const existing = events.find(
        (ev) => String(ev.id) === String(aciEvent.id) || (ev.title || '').toLowerCase() === (aciEvent.title || '').toLowerCase()
      );
      if (existing) {
        await updateAdminEvent(token, existing.id, payload);
      } else {
        await createAdminEvent(token, payload);
      }
      await fetchAdminEvents();
      setFlagshipSaveStatus(`Date confirmed for "${aciEvent.title}": ${dateInfo.date}`);
    } catch (err) {
      setFlagshipSaveStatus(`Failed to save date for "${aciEvent.title}": ${err.message}`);
    }
  };

  const clearFlagshipDate = async (aciEvent) => {
    const existing = events.find(
      (ev) => String(ev.id) === String(aciEvent.id) || (ev.title || '').toLowerCase() === (aciEvent.title || '').toLowerCase()
    );
    if (existing) {
      try {
        await updateAdminEvent(token, existing.id, { date: '', startAt: '', dateConfirmed: false });
        await fetchAdminEvents();
        setAciFlagshipDates((prev) => ({
          ...prev,
          [aciEvent.id]: { date: '', time: aciEvent.time || '' },
        }));
        setFlagshipSaveStatus(`Date cleared for "${aciEvent.title}".`);
      } catch (err) {
        setFlagshipSaveStatus(`Failed to clear date: ${err.message}`);
      }
    } else {
      setAciFlagshipDates((prev) => ({
        ...prev,
        [aciEvent.id]: { date: '', time: aciEvent.time || '' },
      }));
      setFlagshipSaveStatus(`Date cleared for "${aciEvent.title}".`);
    }
  };

  /* ================= WORKSHOP HANDLERS ================= */
  const handleWorkshopFormChange = (field, value) => {
    setWorkshopForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetWorkshopForm = () => {
    setWorkshopForm(initialWorkshopFormState);
    setEditingWorkshopId(null);
  };

  const submitWorkshop = async (event) => {
    event.preventDefault();
    setError('');
    setStatusMessage('Saving workshop...');
    try {
      const url = editingWorkshopId ? `/api/admin/workshops/${editingWorkshopId}` : '/api/admin/workshops';
      const method = editingWorkshopId ? 'PUT' : 'POST';
      const payload = {
        title: workshopForm.topic.trim(),
        topic: workshopForm.topic.trim(),
        host: workshopForm.host.trim(),
        description: workshopForm.description.trim(),
        summary: workshopForm.description.trim(),
        date: workshopForm.date,
        status: workshopForm.status,
        level: workshopForm.level,
        image_url: workshopForm.image_url.trim(),
        presentation_link: workshopForm.presentation_link.trim(),
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
      resetWorkshopForm();
      setStatusMessage(editingWorkshopId ? 'Workshop updated successfully.' : 'Workshop added successfully.');
    } catch (err) {
      setError(`Failed to save workshop: ${err.message}`);
    }
  };

  const editWorkshop = (workshop) => {
    setEditingWorkshopId(workshop.id);
    setWorkshopForm({
      topic: workshop.topic || workshop.title || '',
      host: workshop.host || workshop.instructor || '',
      description: workshop.description || '',
      date: workshop.date || '',
      level: workshop.level || 'Beginner',
      status: workshop.status || 'upcoming',
      image_url: workshop.image_url || workshop.image || '',
      presentation_link: workshop.presentation_link || workshop.presentationLink || '',
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
      setError(`Failed to delete workshop: ${err.message}`);
    }
  };

  /* ================= NEWSLETTER & FACEBOOK HANDLERS ================= */
  const saveNewsletterSettings = async () => {
    if (!newsletterSubject || !newsletterBody) {
      setError('Subject and body are required');
      return;
    }
    try {
      await saveNewsletterTemplate(token, newsletterTemplateKey, newsletterSubject, newsletterBody);
      setStatusMessage('Newsletter template saved successfully.');
    } catch (err) {
      setError(`Failed to save newsletter template: ${err.message}`);
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
      setError(`Failed to send newsletter: ${err.message}`);
      setSendingNewsletter(false);
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
      setError(`Failed to remove subscriber: ${err.message}`);
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
    setEvents([]);
    setSubscribers([]);
    setStats({ users: 0, workshops: 0, events: 0, subscribers: 0 });
    setStatusMessage('');
    setError('');
  };

  const sectionItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'workshops', label: 'Workshops', icon: Camera },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'facebook', label: 'Facebook sync', icon: Globe2 },
  ];

  const renderSection = () => {
    if (!token) {
      return (
        <div className="admin-card admin-card-empty">
          <h3>Admin Authentication</h3>
          <p>
            Paste your admin authorization token below or log in via the main authentication page to unlock
            expedition CMS, workshop curation, and newsletter dispatches.
          </p>
          <div className="admin-token-row">
            <input
              className="admin-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste Bearer Token"
            />
            <button className="btn btn-primary" onClick={refreshAdminData} disabled={!token}>
              Unlock Admin Portal
            </button>
          </div>
          <p className="admin-section-note">
            If you are an admin user, logging in through the sign-in modal will automatically store your key.
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <div className="admin-section-stack">
            <div className="admin-card">
              <h3>Observatory Mission Control</h3>
              <p className="admin-section-note">
                Live content management hub for astronomical events, analog photography archives, hands-on
                workshops, and community dispatches.
              </p>
              <div className="admin-summary-grid">
                {[
                  { key: 'users', label: 'Registered Observers', val: stats.users, icon: '👥' },
                  { key: 'events', label: 'Calendar Expeditions', val: events.length || stats.events, icon: '✨' },
                  { key: 'workshops', label: 'Active Workshops', val: workshops.length || stats.workshops, icon: '🔭' },
                  { key: 'subscribers', label: 'Newsletter Readers', val: subscribers.length || stats.subscribers, icon: '📬' },
                ].map((item) => (
                  <div key={item.key} className="admin-summary-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.label}</span>
                      <span>{item.icon}</span>
                    </div>
                    <div className="admin-summary-amount">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <h3>Fast Operations</h3>
              <div className="admin-action-row">
                <button className="btn btn-primary admin-btn-primary" onClick={() => setActiveSection('events')}>
                  <Sparkles size={15} /> Curate Events CMS
                </button>
                <button className="btn admin-btn" onClick={() => setActiveSection('workshops')}>
                  Manage Workshops
                </button>
                <button className="btn admin-btn" onClick={() => setActiveSection('newsletter')}>
                  Broadcast Dispatches
                </button>
                <button className="btn admin-btn" onClick={refreshAdminData}>
                  <RefreshCw size={14} /> Refresh Cache
                </button>
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="admin-section-stack">
            {/* Live Editor Form + Live Photographic Preview Split Panel */}
            <div className="admin-events-builder-grid">
              {/* Left Column: Form Editor */}
              <div className="admin-card admin-card-form">
                <div className="admin-editor-heading">
                  <div>
                    <h3>{editingEventId ? 'Edit event' : 'Create an event'}</h3>
                    <p className="admin-form-intro">Add the event details, choose an image, then save to publish.</p>
                  </div>
                  <div className="admin-editor-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEventLivePreview(!eventLivePreview)}
                    >
                      <Eye size={14} /> {eventLivePreview ? 'Hide preview' : 'Show preview'}
                    </button>
                    <button className="btn btn-primary" type="submit" form="admin-event-form">
                      <Check size={14} /> {editingEventId ? 'Save event' : 'Publish event'}
                    </button>
                  </div>
                </div>

                <form id="admin-event-form" onSubmit={submitEvent} className="admin-form">
                  <div className="admin-form-row-2">
                    <div>
                      <label className="admin-label">Expedition Title *</label>
                      <input
                        required
                        placeholder="e.g., Geminids Meteor Shower Expedition"
                        value={eventForm.title}
                        onChange={(e) => handleEventFormChange('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Category</label>
                      <select
                        value={eventForm.category}
                        onChange={(e) => handleEventFormChange('category', e.target.value)}
                      >
                        <option value="Meteor Shower">Meteor Shower</option>
                        <option value="Observation">Observation</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Eclipse">Eclipse</option>
                        <option value="Deep Sky">Deep Sky</option>
                        <option value="Lecture">Lecture & Summit</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-row-3">
                    <div>
                      <label className="admin-label">Observation Date</label>
                      <input
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => handleEventFormChange('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Time Window</label>
                      <input
                        placeholder="e.g. 21:00 - 03:00"
                        value={eventForm.time}
                        onChange={(e) => handleEventFormChange('time', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Status</label>
                      <select
                        value={eventForm.status}
                        onChange={(e) => handleEventFormChange('status', e.target.value)}
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Registration Open">Registration Open</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Sold Out">Sold Out</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-row-2">
                    <div>
                      <label className="admin-label">Observing Location / Coordinates</label>
                      <input
                        placeholder="e.g., Zaghouan Mountain Ridge Observatory"
                        value={eventForm.location}
                        onChange={(e) => handleEventFormChange('location', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Capacity (Observers)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g., 50"
                        value={eventForm.capacity}
                        onChange={(e) => handleEventFormChange('capacity', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Vintage Camera / Optical Tag</label>
                    <input
                      placeholder="e.g., Leica M3 • 35mm f/1.4 • Ilford HP5+ pushed to 1600"
                      value={eventForm.cameraSpecs}
                      onChange={(e) => handleEventFormChange('cameraSpecs', e.target.value)}
                    />
                  </div>

                  {/* Image Manager Section */}
                  <div className="admin-media-manager">
                    <label className="admin-label">Primary Vintage Photography Image</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        placeholder="Paste image URL (https://...)"
                        value={eventForm.image.startsWith('data:') ? '' : eventForm.image}
                        onChange={(e) => handleEventFormChange('image', e.target.value)}
                      />
                      <label className="btn btn-secondary admin-upload-button">
                        <UploadCloud size={16} />
                        <span>Upload photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleEventImageUpload}
                        />
                      </label>
                    </div>

                    {/* Presets Grid */}
                    <div style={{ marginTop: '10px' }}>
                      <div className="admin-media-hint">
                        Or choose a curated image:
                      </div>
                      <div className="admin-photo-preset-grid">
                        {PRESET_EVENT_IMAGES.map((preset, pIdx) => (
                          <button
                            type="button"
                            key={pIdx}
                            className={`preset-thumb-btn ${eventForm.image === preset.url ? 'selected' : ''}`}
                            onClick={() => {
                              handleEventFormChange('image', preset.url);
                              if (!eventForm.category || eventForm.category === 'Observation') {
                                handleEventFormChange('category', preset.category);
                              }
                            }}
                            title={preset.name}
                          >
                            <img src={preset.url} alt={preset.name} />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gallery Re-ordering & Extra Shots */}
                    <div style={{ marginTop: '16px' }}>
                      <label className="admin-label">Additional Gallery Plates (Archive Photos)</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          placeholder="Add supplementary photo URL to gallery"
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                        />
                        <button type="button" className="btn btn-secondary" onClick={handleAddGalleryImage}>
                          <Plus size={15} /> Add
                        </button>
                      </div>

                      {eventForm.gallery && eventForm.gallery.length > 0 && (
                        <div className="admin-gallery-reorder-list">
                          {eventForm.gallery.map((imgUrl, gIdx) => (
                            <div key={gIdx} className="admin-gallery-item-chip">
                              <img src={imgUrl} alt={`Plate ${gIdx + 1}`} />
                              <span className="chip-label">Plate #{gIdx + 1}</span>
                              <div className="chip-controls">
                                <button
                                  type="button"
                                  disabled={gIdx === 0}
                                  onClick={() => handleMoveGalleryImage(gIdx, -1)}
                                  title="Move Up"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={gIdx === eventForm.gallery.length - 1}
                                  onClick={() => handleMoveGalleryImage(gIdx, 1)}
                                  title="Move Down"
                                >
                                  <ArrowDown size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(gIdx)}
                                  title="Remove"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Expedition Story & Field Description</label>
                    <textarea
                      rows="4"
                      placeholder="Describe what observers will experience, celestial coordinates, telescope mounts, and mission objectives..."
                      value={eventForm.description}
                      onChange={(e) => handleEventFormChange('description', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-actions">
                    <button className="btn btn-primary" type="submit">
                      <Check size={15} /> {editingEventId ? 'Save event changes' : 'Publish event'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetEventForm}>
                      {editingEventId ? 'Cancel edit' : 'Clear form'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Instant Visual Preview */}
              {eventLivePreview && (
                <div className="admin-card admin-live-preview-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '15px' }}>Instant Visual Preview (Live Camera Plate)</h3>
                    <span className="live-preview-badge">LIVE SIMULATION</span>
                  </div>

                  <div className="preview-vintage-container">
                    <div className="preview-photo-wrap">
                      <img
                        src={
                          eventForm.image ||
                          'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=85'
                        }
                        alt="Preview"
                        className="preview-photo"
                      />
                      <div className="preview-duotone-layer" />
                      <div className="preview-grain-layer" />
                      <div className="preview-vignette-layer" />
                    </div>

                    <div className="preview-header-meta">
                      <div className="preview-film-tag">
                        <Camera size={12} />
                        <span>{eventForm.cameraSpecs || '35MM FILM • LEICA M'}</span>
                      </div>
                      <div className="preview-date-stamp">
                        {eventForm.date ? `'${eventForm.date.replace(/-/g, ' ')}` : "'26 10 24"}
                      </div>
                    </div>

                    <div className="preview-card-body">
                      <div className="preview-tags">
                        <span className="preview-cat-badge">{eventForm.category || 'Observation'}</span>
                        <span className="preview-status-badge">{eventForm.status || 'Upcoming'}</span>
                      </div>

                      <h4 className="preview-title">{eventForm.title || 'Untitled Expedition'}</h4>
                      <p className="preview-desc">
                        {eventForm.description ||
                          'An immersive night under peak sky conditions. Experience celestial wonders with our telescopes.'}
                      </p>

                      <div className="preview-info-row">
                        <span><MapPin size={11} /> {eventForm.location || 'Observatory Ground'}</span>
                        <span><Clock size={11} /> {eventForm.time || '21:00 UTC'}</span>
                        <span><Users size={11} /> {eventForm.capacity || '40'} Observers</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Library Table */}
            <div className="admin-card admin-card-table">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3>Published Events Library ({events.length})</h3>
                <button className="btn btn-secondary" style={{ fontSize: '13px' }} onClick={fetchAdminEvents}>
                  <RefreshCw size={13} /> Refresh List
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px' }}>Plate</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Capacity</th>
                      <th className="admin-table-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td>
                          <img
                            src={ev.image || ev.image_url}
                            alt=""
                            style={{
                              width: '44px',
                              height: '36px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: '1px solid var(--border)',
                            }}
                          />
                        </td>
                        <td>
                          <strong>{ev.title}</strong>
                        </td>
                        <td>
                          <span className="table-badge">{ev.category || 'Observation'}</span>
                        </td>
                        <td>{ev.date || (ev.startAt ? ev.startAt.split('T')[0] : 'TBA')}</td>
                        <td>{ev.location}</td>
                        <td>
                          <span
                            className={`table-status-pill ${(ev.status || 'upcoming').toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {ev.status || 'Upcoming'}
                          </span>
                        </td>
                        <td>{ev.capacity || 'Open'}</td>
                        <td className="admin-table-actions">
                          <button className="btn" onClick={() => editEvent(ev)} title="Edit Event Details">
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            title="Delete Event"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACI Flagship Event Date Manager */}
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3>🌟 Flagship Event Dates</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  3 Fixed ACI Events
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                Set confirmed dates for the three core ACI events below. Once a date is saved, it replaces the season
                placeholder on the public timeline.
              </p>

              {flagshipSaveStatus && (
                <div style={{
                  fontSize: '13px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  background: flagshipSaveStatus.includes('Failed') || flagshipSaveStatus.includes('Please')
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(34, 197, 94, 0.08)',
                  border: `1px solid ${flagshipSaveStatus.includes('Failed') || flagshipSaveStatus.includes('Please') ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
                  color: flagshipSaveStatus.includes('Failed') || flagshipSaveStatus.includes('Please') ? '#ef4444' : '#22c55e',
                }}>
                  {flagshipSaveStatus}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ACI_EVENTS.map((aciEv) => {
                  const dateInfo = aciFlagshipDates[aciEv.id] || {};
                  const existingRecord = events.find(
                    (ev) => String(ev.id) === String(aciEv.id) || (ev.title || '').toLowerCase() === (aciEv.title || '').toLowerCase()
                  );
                  const currentDate = dateInfo.date || existingRecord?.date || '';
                  return (
                    <div
                      key={aciEv.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto auto',
                        gap: '10px',
                        alignItems: 'center',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {aciEv.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {currentDate ? `Confirmed: ${currentDate}` : `Season: ${aciEv.season}`}
                        </div>
                      </div>
                      <input
                        type="date"
                        value={dateInfo.date || ''}
                        onChange={(e) => handleFlagshipDateChange(aciEv.id, 'date', e.target.value)}
                        style={{ maxWidth: '170px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '7px 14px', whiteSpace: 'nowrap' }}
                        onClick={() => saveFlagshipDate(aciEv)}
                      >
                        <Check size={13} /> Confirm Date
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '7px 14px', whiteSpace: 'nowrap' }}
                        onClick={() => clearFlagshipDate(aciEv)}
                      >
                        Clear
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'workshops':
        return (
          <div className="admin-section-stack">
            <div className="admin-card admin-card-form">
              <h3>{editingWorkshopId ? 'Edit Workshop' : 'Add Workshop'}</h3>
              <p className="admin-form-intro">
                {editingWorkshopId ? 'Update the workshop details below.' : 'Add a workshop to the club activity list.'}
              </p>
              <form onSubmit={submitWorkshop} className="admin-form">
                <label className="admin-label" htmlFor="workshop-topic">Workshop title</label>
                <input
                  id="workshop-topic"
                  required
                  aria-label="Workshop subject"
                  placeholder="Subject"
                  value={workshopForm.topic}
                  onChange={(e) => handleWorkshopFormChange('topic', e.target.value)}
                />
                <label className="admin-label" htmlFor="workshop-host">Instructor</label>
                <input
                  id="workshop-host"
                  required
                  aria-label="Instructor"
                  placeholder="Instructor"
                  value={workshopForm.host}
                  onChange={(e) => handleWorkshopFormChange('host', e.target.value)}
                />
                <label className="admin-label" htmlFor="workshop-description">Description</label>
                <textarea
                  id="workshop-description"
                  required
                  aria-label="Description"
                  placeholder="Description"
                  rows="5"
                  value={workshopForm.description}
                  onChange={(e) => handleWorkshopFormChange('description', e.target.value)}
                />
                <div className="admin-form-row-2">
                  <div>
                    <label className="admin-label" htmlFor="workshop-date">Date</label>
                  <input
                    id="workshop-date"
                    required
                    type="date"
                    aria-label="Workshop date"
                    value={workshopForm.date}
                    onChange={(e) => handleWorkshopFormChange('date', e.target.value)}
                  />
                  </div>
                  <div>
                    <label className="admin-label" htmlFor="workshop-status">Status</label>
                  <select
                    id="workshop-status"
                    aria-label="Workshop status"
                    value={workshopForm.status}
                    onChange={(e) => handleWorkshopFormChange('status', e.target.value)}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                  </div>
                </div>
                <label className="admin-label" htmlFor="workshop-level">Difficulty</label>
                <select
                  id="workshop-level"
                  aria-label="Difficulty"
                  value={workshopForm.level}
                  onChange={(e) => handleWorkshopFormChange('level', e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <label className="admin-label" htmlFor="workshop-image">Workshop image URL</label>
                <div className="admin-image-field">
                  <input
                    id="workshop-image"
                    required={!workshopForm.image_url.startsWith('data:')}
                    type={workshopForm.image_url.startsWith('data:') ? 'text' : 'url'}
                    aria-label="Workshop image URL"
                    placeholder="Paste a public image URL"
                    value={workshopForm.image_url.startsWith('data:') ? '' : workshopForm.image_url}
                    onChange={(e) => handleWorkshopFormChange('image_url', e.target.value)}
                  />
                  <label className="btn btn-secondary admin-upload-button">
                    <UploadCloud size={15} /> Upload photo
                    <input type="file" accept="image/*" onChange={handleWorkshopImageUpload} />
                  </label>
                </div>
                <p className="admin-workshop-image-hint">Upload an image up to 5 MB or paste a public image URL.</p>
                {workshopForm.image_url && (
                  <img className="admin-workshop-image-preview" src={workshopForm.image_url} alt="Workshop preview" referrerPolicy="no-referrer" />
                )}
                <label className="admin-label" htmlFor="workshop-presentation">Presentation link <span>(optional)</span></label>
                <input
                  id="workshop-presentation"
                  type="url"
                  aria-label="Presentation URL"
                  placeholder="Presentation URL (optional)"
                  value={workshopForm.presentation_link}
                  onChange={(e) => handleWorkshopFormChange('presentation_link', e.target.value)}
                />
                <div className="admin-form-actions">
                  <button className="btn btn-primary" type="submit">
                    <Check size={15} /> {editingWorkshopId ? 'Save workshop changes' : 'Create workshop'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetWorkshopForm}>
                    {editingWorkshopId ? 'Cancel edit' : 'Clear form'}
                  </button>
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
                      <th>Instructor</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Difficulty</th>
                      <th className="admin-table-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshops.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.host || item.instructor || 'TBA'}</td>
                        <td>{item.date || 'TBA'}</td>
                        <td>{item.status || 'upcoming'}</td>
                        <td>{item.level || 'Beginner'}</td>
                        <td className="admin-table-actions">
                          <button className="btn" onClick={() => editWorkshop(item)}>
                            Edit
                          </button>
                          <button className="btn" onClick={() => deleteWorkshop(item.id)}>
                            Delete
                          </button>
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
                Choose a design and enter the plain text body. The backend will render it using the Astro-style
                newsletter layout.
              </p>
              <div className="admin-form">
                <label className="admin-label" htmlFor="newsletter-template">Template design</label>
                <select
                  id="newsletter-template"
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
                <label className="admin-label" htmlFor="newsletter-subject">Subject line</label>
                <input
                  id="newsletter-subject"
                  className="admin-input"
                  placeholder="e.g., Astro Club Weekly Newsletter"
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                />
                <label className="admin-label" htmlFor="newsletter-body">Newsletter body</label>
                <textarea
                  id="newsletter-body"
                  className="admin-input"
                  placeholder="Write the newsletter body as plain text. Paragraphs will be rendered in the Astro newsletter layout."
                  rows="10"
                  value={newsletterBody}
                  onChange={(e) => setNewsletterBody(e.target.value)}
                />
                <div className="admin-form-actions" style={{ marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={saveNewsletterSettings}>
                    Save Template
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                </div>
              </div>
            </div>

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
                        <button className="btn" onClick={() => removeSubscriber(subscriber.id)}>
                          Remove
                        </button>
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
                <label className="admin-label" htmlFor="facebook-page-id">Facebook page ID</label>
                <input
                  id="facebook-page-id"
                  className="admin-input"
                  placeholder="Facebook Page ID"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                />
                <label className="admin-label" htmlFor="facebook-access-token">Facebook access token</label>
                <input
                  id="facebook-access-token"
                  className="admin-input"
                  placeholder="Facebook Access Token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <div className="admin-form-actions">
                  <button className="btn btn-primary" onClick={fetchFacebookEvents}>
                    Fetch Events
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setPageId('');
                      setAccessToken('');
                    }}
                  >
                    Clear
                  </button>
                </div>
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
          <h2>Observatory Administration</h2>
          <p className="admin-section-note">
            Full-spectrum control center: manage events with vintage photo styling, curate workshops, and broadcast
            astronomical dispatches.
          </p>
        </div>
        <div className="admin-header-actions">
          {token && (
            <button className="btn admin-btn" onClick={logout}>
              Log out
            </button>
          )}
          <button className="btn btn-primary admin-btn-primary" onClick={refreshAdminData}>
            <RefreshCw size={14} /> Refresh Cache
          </button>
        </div>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {statusMessage && <div className="admin-status">{statusMessage}</div>}

      <div className="admin-panel-grid">
        <aside className="admin-panel-sidebar">
          {sectionItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`btn admin-side-button ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <item.icon size={17} aria-hidden="true" />
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
