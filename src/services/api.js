const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function safeFetch(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data && data.error ? data.error : res.statusText || 'Request failed';
      throw new Error(message);
    }
    return data;
  } catch (e) {
    console.warn('fetch failed', url, e.message);
    throw e;
  }
}

export const login = async (email, password) => {
  return safeFetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (email, password, is_admin = false, name = '', username = '', bio = '', location = '') => {
  return safeFetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, is_admin, name, username, bio, location }),
  });
};

export const authHeaders = (token) => {
  if (!token) return {}; 
  return { Authorization: `Bearer ${token}` };
};

const parseList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

export const fetchWorkshops = async () => {
  const res = await safeFetch(`${API_BASE}/api/workshops`);
  if (Array.isArray(res)) {
    return res.map((r) => {
      const topic = r.topic || 'general';
      const status = r.status || 'upcoming';
      return {
        id: r.id || r.id?.toString?.() || Math.random().toString(36).slice(2, 9),
        title: r.title || r.name || 'Untitled Workshop',
        instructor: r.host || r.instructor || 'TBA',
        topic,
        topicLabel: r.topicLabel || topic.replace(/(^|\s)\S/g, (t) => t.toUpperCase()),
        status,
        statusLabel: r.statusLabel || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Upcoming'),
        date: r.date || r.start_time || '',
        time: r.time || '',
        duration: r.duration || '',
        level: r.level || 'Beginner',
        prerequisites: parseList(r.prerequisites),
        summary: r.summary || r.description || '',
        fullDetail: r.description || r.fullDetail || r.summary || '',
        agenda: parseList(r.agenda),
        presentationLink: r.presentation_link || r.presentationLink || null,
        capacity: r.capacity || 0,
        registeredCount: r.registered_count || r.registeredCount || 0,
      };
    });
  }
  return [];
};

export const fetchEvents = async () => {
  const res = await safeFetch(`${API_BASE}/api/events`);
  if (Array.isArray(res)) {
    return res.map((e) => {
      const startDate = e.start_time ? new Date(e.start_time) : null;
      const date = startDate
        ? startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
        : e.date || '';
      const time = startDate
        ? startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        : e.time || '';
      const location = typeof e.location === 'object' ? e.location.name || 'TBA' : e.location || e.venue || 'TBA';
      const capacity = e.capacity || e.attending_count || 'Unlimited';
      const status = e.status || (startDate && startDate.getTime() > Date.now() ? 'Open' : 'Past');
      return {
        id: e.id || e.source_id || e.id?.toString?.() || Math.random().toString(36).slice(2, 9),
        title: e.title || e.name || 'Untitled Event',
        date,
        time,
        location,
        description: e.description || '',
        capacity,
        status,
      };
    });
  }
  return [];
};

export const fetchNews = async () => {
  try {
    const res = await safeFetch(`${API_BASE}/api/news`);
    return res && (res.articles || res.results || res) ? res : { articles: [] };
  } catch (e) {
    return { articles: [] };
  }
};

export const subscribeNewsletter = async (email) => {
  return safeFetch(`${API_BASE}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
};

export const fetchAdminNewsletterSubscribers = async (token) => {
  return safeFetch(`${API_BASE}/api/admin/newsletter-subscribers`, {
    headers: { ...authHeaders(token) },
  });
};

export const deleteNewsletterSubscriber = async (token, id) => {
  return safeFetch(`${API_BASE}/api/admin/newsletter-subscribers/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
};

export const fetchAdminStats = async (token) => {
  return safeFetch(`${API_BASE}/api/admin/stats`, {
    headers: { ...authHeaders(token) },
  });
};

export const fetchMagazineNews = async (limit = 11) => {
  try {
    const res = await safeFetch(`${API_BASE}/api/news?limit=${limit}`);
    return res && (res.articles || res.results || res) ? res : { articles: [] };
  } catch (e) {
    return { articles: [] };
  }
};

export const fetchNewsletterTemplate = async (token, templateKey = 'greeting') => {
  return safeFetch(`${API_BASE}/api/admin/newsletter-template?template_key=${encodeURIComponent(templateKey)}`, {
    headers: { ...authHeaders(token) },
  });
};

export const saveNewsletterTemplate = async (token, templateKey, subject, body) => {
  return safeFetch(`${API_BASE}/api/admin/newsletter-template`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ templateKey, subject, body }),
  });
};

export const broadcastNewsletter = async (token, templateKey = 'greeting') => {
  return safeFetch(`${API_BASE}/api/admin/newsletter/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ templateKey }),
  });
};
