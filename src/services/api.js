import escapeRoom1 from '../imges/escpe_room_1.jpg';
import escapeRoom2 from '../imges/escpe_room_2.jpg';
import escapeRoom3 from '../imges/escpe_room_3.jpg';
import sphere1 from '../imges/sphere_1.jpg';
import sphere2 from '../imges/sphere_2.jpg';
import sphere3 from '../imges/sphere_3.jpg';
import astroChallengeImage from '../imges/image.jpg';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export const reportClientLog = async (level = 'info', message = 'Client log', details = {}) => {
  try {
    await fetch(`${API_BASE}/api/logs/client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, details }),
    });
  } catch (error) {
    console.warn('Failed to report client log', error);
  }
};

async function safeFetch(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data && data.error ? data.error : res.statusText || 'Request failed';
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return data;
  } catch (e) {
    const details = {
      url,
      method: opts.method || 'GET',
      message: e.message,
      stack: e.stack,
    };
    reportClientLog('warn', 'frontend fetch failed', details);
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

export const register = async (email, password, username) => {
  return safeFetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, is_admin: false }),
  });
};

export const updateAuthProfile = async (token, profile) => safeFetch(`${API_BASE}/api/auth/profile`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
  body: JSON.stringify(profile),
});

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
        image: r.image_url || r.imageUrl || r.image || r.cover_image || '',
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

export const DEFAULT_EVENTS = [
  {
    id: 'evt-geminids-2026',
    title: 'Geminids Meteor Shower Expedition',
    date: '2026-12-14',
    startAt: '2026-12-14T21:00:00',
    time: '21:00 - 04:00',
    location: 'Zaghouan Mountain Ridge Observatory (Bortle Class 2)',
    description: 'An immersive night under peak zenithal hourly rate conditions. Observe up to 120 multicolored meteors per hour while capturing celestial fireballs on medium-format and 35mm film alongside our automated equatorial trackers.',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=85',
    category: 'Meteor Shower',
    capacity: 45,
    status: 'Upcoming',
    cameraSpecs: 'Leica M3 • 35mm f/1.4 • Ilford HP5+ pushed to 1600 • 30s exposure',
    gallery: [
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'evt-astrophoto-lab',
    title: 'Deep-Sky Astrophotography & Analog Darkroom',
    date: '2026-11-08',
    startAt: '2026-11-08T19:30:00',
    time: '19:30 - 23:30',
    location: 'INSAT Science Pavilion, Darkroom Annex',
    description: 'Master the timeless craft of long-exposure glass-plate and analog film astrophotography. We develop physical silver gelatin prints of the Great Orion Nebula (M42) and Pleiades open cluster under vintage amber safety lamps.',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=85',
    category: 'Workshop',
    capacity: 25,
    status: 'Upcoming',
    cameraSpecs: 'Hasselblad 500C/M • 80mm Planar • Kodak Tri-X 400 • Deep red safelight',
    gallery: [
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'evt-lunar-eclipse',
    title: 'Total Blood Moon Eclipse & Stargazer Vigil',
    date: '2026-10-28',
    startAt: '2026-10-28T20:00:00',
    time: '20:00 - 01:30',
    location: 'Sidi Bou Said Promontory Cliffs',
    description: 'Gather upon the historical Mediterranean headland as the Moon is cast into Earth’s deep umbral shadow, turning a majestic copper-red. Equipped with 8-inch Dobsonian reflectors, high-contrast binoviewers, and thermal celestial sensors.',
    image: 'https://images.unsplash.com/photo-1532693322450-2f6e1c8c9be6?auto=format&fit=crop&w=1920&q=85',
    category: 'Eclipse',
    capacity: 80,
    status: 'Registration Open',
    cameraSpecs: 'Nikon FM2 • Nikkor 300mm f/4.5 ED • Ektachrome 100 • Mirror locked',
    gallery: [
      'https://images.unsplash.com/photo-1532693322450-2f6e1c8c9be6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'evt-saturn-opposition',
    title: 'Saturn Ring Plane Crossing & Planetary Night',
    date: '2026-09-21',
    startAt: '2026-09-21T21:30:00',
    time: '21:30 - 02:00',
    location: 'Belvédère Historic Astronomical Dome',
    description: 'Observe Saturn at peak geometric opposition through the vintage brass 200mm Coudé refractor. Witness Cassini Division contrasts and the dance of Titan, Enceladus, and Rhea across the jewel-like gas giant.',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1920&q=85',
    category: 'Observation',
    capacity: 35,
    status: 'Upcoming',
    cameraSpecs: 'Vintage 200mm F/15 Refractor • Plössl 9mm ocular • Barlow 2x • Ortho filter',
    gallery: [
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'evt-cosmology-summit',
    title: 'Autumn Equinox & Milky Way Horizon Survey',
    date: '2026-09-22',
    startAt: '2026-09-22T19:00:00',
    time: '19:00 - 23:00',
    location: 'Oudhna Archeological Park Amphitheater',
    description: 'An open-air amphitheater symposium discussing primordial gravitational waves and dark matter halos, followed by wide-field laser star identification and astrophotographic long-exposures over the antique Roman arches.',
    image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1920&q=85',
    category: 'Lecture & Night',
    capacity: 60,
    status: 'Upcoming',
    cameraSpecs: 'Pentax 67 • 55mm f/4 • Fujichrome Velvia 50 • Sky-Watcher Star Adventurer',
    gallery: [
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

export const ACI_EVENTS = [
  {
    id: 'aci-astro-escape-room',
    title: 'Astro Escape Room',
    season: 'Fall 2026',
    dateConfirmed: false,
    time: '17:00 - 20:00',
    location: 'INSAT Campus',
    description: 'Enter an astronomy-themed escape room where your team must solve a series of puzzles to make your way out. Search for clues, connect the astronomy ideas hidden throughout the room, and work together against the clock. The experience is designed to be playful and welcoming, and teams that crack the puzzles can win prizes.',
    image: escapeRoom1,
    gallery: [escapeRoom1, escapeRoom2, escapeRoom3],
    category: 'Immersive experience',
    capacity: 40,
  },
  {
    id: 'aci-astrosphere',
    title: 'Astrosphère',
    season: 'Winter 2026/27',
    dateConfirmed: false,
    time: '18:00 - 23:00',
    location: 'INSAT Campus',
    description: 'Astrosphère is Astro Club INSAT’s flagship astronomy evening, inspired by the Nuit des Étoiles organized by AJST. The INSAT campus comes alive with decorations and interactive stands where ACI members, student clubs, and partner associations share engaging topics in astronomy, astrophysics, and space technology. Open to everyone, whatever their age or level of experience, the event is a friendly place to ask questions, discover something new, and enjoy astronomy together. When weather and sky conditions allow, visitors can take part in telescope observing. Quizzes and games, with small gifts for winners, bring a fun and welcoming energy to the whole evening.',
    image: sphere1,
    gallery: [sphere1, sphere2, sphere3],
    category: 'Flagship event',
    capacity: 120,
  },
  {
    id: 'aci-astrochallenge',
    title: 'AstroChallenge',
    season: 'Spring 2027',
    dateConfirmed: false,
    time: '09:00 - 18:00',
    location: 'INSAT Campus',
    description: 'AstroChallenge invites participants to explore a fascinating astronomy topic and present it to a jury of experts. The program begins with talks led by astronomy professionals, followed by accessible, intriguing presentations lasting 10 to 15 minutes. After each presentation, the jury offers constructive feedback to help participants develop their ideas and communication. A special prize recognizes the presentation that makes the strongest impression. The challenge celebrates curiosity, clear explanations, and sharing science with others.',
    image: astroChallengeImage,
    gallery: [
      astroChallengeImage,
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=85',
    ],
    category: 'Scientific challenge',
    capacity: 80,
  },
];

export const ACI_COMMITTEE = [
  { role: 'President', name: 'Ahmed Ksibi' },
  { role: 'Vice-president', name: 'Rihem Ammar' },
  { role: 'General secretary', name: 'Syryne Bouzayene' },
  { role: 'Human resources', name: 'Nouhe Jaidi' },
  { role: 'Media manager', name: 'Mariem Lakhel' },
  { role: 'Treasurer', name: 'Karima Boussetta' },
  { role: 'Logistics manager', name: 'Med Dhia Selmi' },
];

// No unverified historical events are shown when the events service is empty.
// Administrators can publish confirmed events through the admin panel.
export const CLUB_HISTORY_EVENTS = [];

const EVENTS_CACHE_KEY = 'astro_events_cache_v2';

const getStoredEvents = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const confirmed = parsed.filter((event) => (
          event
          && !String(event.id || '').startsWith('club-hackathon-')
          && !String(event.title || '').toLowerCase().includes('placeholder')
        ));
        if (confirmed.length > 0) return confirmed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached events', e);
  }
  return null;
};

const setStoredEvents = (events) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Failed to save cached events', e);
  }
};

export const fetchEvents = async (token = null) => {
  let backendList = [];
  if (token) {
    try {
      const res = await safeFetch(`${API_BASE}/api/events`, { headers: authHeaders(token) });
      if (Array.isArray(res) && res.length > 0) {
        backendList = res.map((e) => {
          const startDate = e.start_time ? new Date(e.start_time) : null;
          const date = startDate && !Number.isNaN(startDate.getTime())
            ? startDate.toISOString().split('T')[0]
            : e.date || '';
          const time = e.time || (startDate && !Number.isNaN(startDate.getTime())
            ? startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
            : '');
          const location = typeof e.location === 'object' ? e.location.name || 'TBA' : e.location || e.venue || 'TBA';
          const capacity = e.capacity || e.attending_count || 'Unlimited';
          const status = e.status || (startDate && startDate.getTime() > Date.now() ? 'Upcoming' : 'Past');
          let gallery = [];
          if (e.gallery) {
            try {
              gallery = typeof e.gallery === 'string' ? JSON.parse(e.gallery) : e.gallery;
            } catch {
              gallery = [e.gallery];
            }
          }
          return {
            id: e.id || e.source_id || e.id?.toString?.() || Math.random().toString(36).slice(2, 9),
            title: e.title || e.name || 'Untitled Event',
            date,
            startAt: e.start_time || e.startAt || date,
            time,
            location,
            description: e.description || '',
            image: e.image_url || e.image || e.cover?.source || '',
            category: e.category || 'Observation',
            capacity,
            status,
            gallery: Array.isArray(gallery) && gallery.length > 0 ? gallery : (e.image_url ? [e.image_url] : []),
          };
        });
      }
    } catch (err) {
      console.warn('Backend events fetch fallback to local cache:', err.message);
    }
  }

  const stored = getStoredEvents();
  if (backendList.length > 0) {
    // If backend returned events, merge or return them, saving to cache
    setStoredEvents(backendList);
    return backendList;
  }

  if (stored && stored.length > 0) {
    return stored;
  }

  // Initialize with our rich default events
  setStoredEvents(CLUB_HISTORY_EVENTS);
  return CLUB_HISTORY_EVENTS;
};

export const createAdminEvent = async (token, eventData) => {
  let created = null;
  try {
    created = await safeFetch(`${API_BASE}/api/admin/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(eventData),
    });
  } catch (e) {
    console.warn('Backend event creation failed, creating locally:', e.message);
  }

  const newEvent = {
    id: created?.id || `evt-${Date.now()}`,
    title: eventData.title,
    date: eventData.date || new Date().toISOString().split('T')[0],
    startAt: eventData.startAt || eventData.date || new Date().toISOString(),
    time: eventData.time || '20:00',
    location: eventData.location || 'Observatory Ground',
    description: eventData.description || '',
    image: eventData.image || eventData.image_url || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=85',
    category: eventData.category || 'Observation',
    capacity: Number(eventData.capacity) || 50,
    status: eventData.status || 'Upcoming',
    cameraSpecs: eventData.cameraSpecs || '35mm Film • 50mm f/1.8 • ISO 800',
    gallery: Array.isArray(eventData.gallery) ? eventData.gallery : [eventData.image],
  };

  const stored = getStoredEvents() || [...CLUB_HISTORY_EVENTS];
  const updated = [newEvent, ...stored];
  setStoredEvents(updated);
  return newEvent;
};

export const updateAdminEvent = async (token, id, eventData) => {
  let updatedFromBackend = null;
  try {
    updatedFromBackend = await safeFetch(`${API_BASE}/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(eventData),
    });
  } catch (e) {
    console.warn('Backend event update failed, updating locally:', e.message);
  }

  const stored = getStoredEvents() || [...CLUB_HISTORY_EVENTS];
  const next = stored.map((item) => {
    if (String(item.id) === String(id)) {
      return {
        ...item,
        ...eventData,
        image: eventData.image || eventData.image_url || item.image,
        gallery: Array.isArray(eventData.gallery) ? eventData.gallery : item.gallery,
      };
    }
    return item;
  });
  setStoredEvents(next);
  return updatedFromBackend || next.find((e) => String(e.id) === String(id));
};

export const deleteAdminEvent = async (token, id) => {
  try {
    await safeFetch(`${API_BASE}/api/admin/events/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders(token) },
    });
  } catch (e) {
    console.warn('Backend event deletion failed, deleting locally:', e.message);
  }

  const stored = getStoredEvents() || [...CLUB_HISTORY_EVENTS];
  const next = stored.filter((item) => String(item.id) !== String(id));
  setStoredEvents(next);
  return { success: true };
};

export const isSameWeek = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
};

export const getWeeklyResetTimeLeft = () => {
  const now = new Date();
  const nextReset = new Date(now);
  const day = nextReset.getDay();
  const diff = nextReset.getDate() - day + (day === 0 ? 1 : 8);
  nextReset.setDate(diff);
  nextReset.setHours(0, 0, 0, 0);

  const diffMs = nextReset - now;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, formatted: `${days}d ${hours}h ${minutes}m` };
};

export const getRankFromXP = (xp = 0) => {
  const numXp = Number(xp) || 0;
  if (numXp >= 35000) return { title: 'Cosmic Legend', tier: 'Mythic', icon: '👑', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', nextXp: null, minXp: 35000 };
  if (numXp >= 15000) return { title: 'Galactic Admiral', tier: 'Diamond', icon: '💫', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', nextXp: 35000, minXp: 15000 };
  if (numXp >= 6000) return { title: 'Astral Commander', tier: 'Platinum', icon: '⭐', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', nextXp: 15000, minXp: 6000 };
  if (numXp >= 2000) return { title: 'Cosmic Officer', tier: 'Gold', icon: '🚀', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', nextXp: 6000, minXp: 2000 };
  if (numXp >= 500) return { title: 'Orbital Explorer', tier: 'Silver', icon: '🛰️', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', nextXp: 2000, minXp: 500 };
  return { title: 'Stargazer', tier: 'Bronze', icon: '🌌', color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.15)', nextXp: 500, minXp: 0 };
};

const DEFAULT_SEED_RECORDS = [];

export const getStoredAstroRecords = () => {
  try {
    const raw = localStorage.getItem('astro_game_records');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((r) => r && r.id && !String(r.id).startsWith('seed-'));
      }
    }
  } catch (e) {}
  try {
    localStorage.setItem('astro_game_records', JSON.stringify([]));
  } catch (e) {}
  return [];
};

export const fetchAstrogameRecords = async ({ game, userId, userEmail, timeframe = 'all', difficulty = 'all' } = {}) => {
  let backendRecords = [];
  try {
    const params = new URLSearchParams();
    if (game && game !== 'all' && game !== 'global') params.set('game', game);
    // Global rankings must include every user. Identity filters are reserved for
    // callers explicitly requesting a personal history.
    if (game && game !== 'global' && userId) params.set('userId', userId);
    if (game && game !== 'global' && userEmail) params.set('userEmail', userEmail);
    const res = await safeFetch(`${API_BASE}/api/astrogames/leaderboard?${params}`);
    if (Array.isArray(res)) backendRecords = res;
  } catch (e) {
    console.warn('Leaderboard backend fetch failed, using local records:', e.message);
  }

  const localRecords = getStoredAstroRecords();
  
  const combinedMap = new Map();
  [...backendRecords, ...localRecords].forEach((rec) => {
    if (!rec || (rec.id && String(rec.id).startsWith('seed-'))) return;
    const key = rec.id || `${rec.name}-${rec.created_at || rec.createdAt}-${rec.score}`;
    if (!combinedMap.has(key)) {
      combinedMap.set(key, rec);
    }
  });

  let recordsList = Array.from(combinedMap.values());

  if (game && game !== 'all' && game !== 'global') {
    recordsList = recordsList.filter((r) => r.game === game);
  }

  if (difficulty && difficulty !== 'all') {
    recordsList = recordsList.filter((r) => (r.difficulty || 'easy').toLowerCase() === difficulty.toLowerCase());
  }

  if (timeframe === 'weekly') {
    recordsList = recordsList.filter((r) => isSameWeek(r.created_at || r.createdAt));
  }

  if (game === 'global') {
    const users = new Map();
    recordsList.forEach((record) => {
      const identity = record.user_id || record.userId || record.user_email || record.userEmail || record.user_name || record.userName || record.name;
      if (!identity) return;
      const key = String(identity).toLowerCase();
      const current = users.get(key) || {
        id: `user-${key}`,
        name: record.user_name || record.userName || record.name || 'Cadet Pilot',
        userId: record.user_id || record.userId || null,
        userEmail: record.user_email || record.userEmail || null,
        xp: 0,
        score: 0,
        gamesPlayed: 0,
        created_at: record.created_at || record.createdAt,
      };
      current.xp += Number(record.xp) || Math.round((Number(record.score) || 0) * 0.5 + (record.won ? 100 : 20));
      current.score += Number(record.score) || 0;
      current.gamesPlayed += 1;
      users.set(key, current);
    });
    recordsList = Array.from(users.values());
  }

  recordsList.sort((a, b) => {
    const bValue = game === 'global' ? Number(b.xp) || 0 : Number(b.score) || 0;
    const aValue = game === 'global' ? Number(a.xp) || 0 : Number(a.score) || 0;
    return bValue - aValue;
  });

  return recordsList;
};

export const claimDailyLoginXP = (userNameOrEmail = 'Cadet') => {
  const todayStr = new Date().toISOString().split('T')[0];
  const userKey = (userNameOrEmail || 'Cadet').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const todayKey = `astro_daily_login_${userKey}_${todayStr}`;
  try {
    const claimed = localStorage.getItem(todayKey);
    if (claimed) {
      return { claimed: false, xp: 0, message: 'Daily 100 XP already claimed today!' };
    }
    
    localStorage.setItem(todayKey, 'true');
    const xpKey = `astro_total_user_xp_${userNameOrEmail || 'guest'}`;
    const currentXp = Number(localStorage.getItem(xpKey)) || 0;
    const sanitizedCurrent = currentXp > 50000 ? 0 : currentXp;
    const newXp = sanitizedCurrent + 100;
    localStorage.setItem(xpKey, newXp);
    return { claimed: true, xp: 100, message: '🎉 Daily Login Reward Claimed: +100 XP!' };
  } catch (e) {
    return { claimed: false, xp: 0, message: 'Could not claim daily XP.' };
  }
};

export const saveAstrogameRecord = async (record) => {
  const nowIso = new Date().toISOString();
  const xpEarned = Number(record.xp) || Math.round((Number(record.score) || 0) * 0.5 + (record.won ? 100 : 20));
  
  const formattedRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: nowIso,
    createdAt: nowIso,
    xp: xpEarned,
    ...record,
    difficulty: record.difficulty || 'easy',
  };

  const current = getStoredAstroRecords();
  const updated = [formattedRecord, ...current].slice(0, 250);
  try {
    localStorage.setItem('astro_game_records', JSON.stringify(updated));
  } catch (e) {}

  try {
    const xpKey = `astro_total_user_xp_${record.userId || record.userEmail || record.userName || record.name || 'guest'}`;
    const currentXp = Number(localStorage.getItem(xpKey)) || 0;
    const sanitizedCurrent = currentXp > 50000 ? 0 : currentXp;
    localStorage.setItem(xpKey, sanitizedCurrent + xpEarned);
  } catch (e) {}

  try {
    await safeFetch(`${API_BASE}/api/astrogames/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedRecord),
    });
  } catch (e) {
    console.warn('Leaderboard remote save failed, saved locally.');
  }

  return formattedRecord;
};

export const getUserTotalXP = (userNameOrEmail = '') => {
  const records = getStoredAstroRecords();
  let userRecords = records;
  if (userNameOrEmail) {
    const search = userNameOrEmail.toLowerCase();
    userRecords = records.filter(
      (r) =>
        (r.name && r.name.toLowerCase() === search) ||
        (r.userEmail && r.userEmail.toLowerCase() === search) ||
        (r.userName && r.userName.toLowerCase() === search)
    );
  }
  
  const sumFromRecords = userRecords.reduce((acc, r) => acc + (Number(r.xp) || Math.round((Number(r.score) || 0) * 0.5)), 0);
  const userKey = userNameOrEmail || 'guest';
  const storedLocalXp = Number(localStorage.getItem(`astro_total_user_xp_${userKey}`)) || 0;
  let total = sumFromRecords > 0 ? sumFromRecords : storedLocalXp;
  if (storedLocalXp > 50000 || (storedLocalXp > sumFromRecords * 3 && sumFromRecords > 0)) {
    total = sumFromRecords;
    try {
      localStorage.setItem(`astro_total_user_xp_${userKey}`, total);
    } catch (e) {}
  }
  return total;
};

export const isExperimentalXpMarketEnabled = () => {
  try {
    return localStorage.getItem('astro_experimental_xp_market') === 'true';
  } catch (e) {
    return false;
  }
};

export const setExperimentalXpMarketEnabled = (enabled) => {
  try {
    localStorage.setItem('astro_experimental_xp_market', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('astro_experimental_xp_market_change'));
  } catch (e) {}
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
