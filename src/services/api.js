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

export const CLUB_HISTORY_EVENTS = [
  {
    id: 'club-hackathon-01',
    title: 'Hackathon #1 · Annual Dev Hackathon',
    date: '2026-02-21',
    startAt: '2026-02-21T09:00:00',
    time: '09:00 - 09:00',
    location: 'INSAT Innovation Hub',
    description: 'The club opened its build season with a 24-hour team challenge: turn a rough idea into a working product, then present it to the community.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85',
    ],
    category: 'Hackathon',
    capacity: 80,
    status: 'Past event',
    highlights: ['24 hours of collaborative product building', 'Mentor office hours and rapid demos', 'Community-voted audience award'],
    winners: ['PLACEHOLDER · Team Orbit — Best Overall Project', 'PLACEHOLDER · Team Nova — Audience Choice'],
  },
  {
    id: 'club-hackathon-02',
    title: 'Hackathon #2 · AI / Innovation Sprint',
    date: '2026-04-25',
    startAt: '2026-04-25T10:00:00',
    time: '10:00 - 20:00',
    location: 'INSAT Research Lab',
    description: 'A focused sprint for practical AI ideas. Teams explored responsible machine learning, useful prototypes, and the small details that make a demo feel like a real product.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1920&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=85',
    ],
    category: 'Hackathon',
    capacity: 64,
    status: 'Past event',
    highlights: ['Responsible AI challenge tracks', 'Prototype reviews with invited mentors', 'Live demos and peer feedback'],
    winners: ['PLACEHOLDER · Team Deep Blue — Most Useful Prototype', 'PLACEHOLDER · Team Comet — Best Technical Experiment'],
  },
  {
    id: 'club-general-assembly',
    title: 'General Assembly · Community & Elections',
    date: '2026-06-20',
    startAt: '2026-06-20T14:00:00',
    time: '14:00 - 17:00',
    location: 'INSAT Main Auditorium',
    description: 'Members gathered to review the season, welcome new voices, share plans for the year ahead, and elect the next club board.',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1920&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=85',
    ],
    category: 'General Assembly',
    capacity: 120,
    status: 'Past event',
    highlights: ['Season recap and open member forum', 'Next-year roadmap and project sign-ups', 'Board elections and handover'],
    winners: ['Elected board roster · PLACEHOLDER until official names are added'],
  },
  {
    id: 'club-hackathon-03',
    title: 'Hackathon #3 · Grand Finale Hackathon',
    date: '2026-09-19',
    startAt: '2026-09-19T09:00:00',
    time: '09:00 - 21:00',
    location: 'INSAT Grand Hall',
    description: 'The season finale brought the strongest ideas to one stage. Teams polished their work, shared what they learned, and competed in a final community showcase.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1920&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85',
    ],
    category: 'Hackathon',
    capacity: 100,
    status: 'Past event',
    highlights: ['Final project showcase and live judging', 'Cross-team demos and community awards', 'Season-closing celebration'],
    winners: ['PLACEHOLDER · Team Polaris — Grand Finale', 'PLACEHOLDER · Team Signal — Best Presentation'],
  },
];

const EVENTS_CACHE_KEY = 'astro_events_cache_v2';

const getStoredEvents = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

export const fetchAstrogameRecords = async ({ game, userId, userEmail }) => {
  const params = new URLSearchParams({ game });
  if (userId) params.set('userId', userId);
  if (userEmail) params.set('userEmail', userEmail);
  return safeFetch(`${API_BASE}/api/astrogames/leaderboard?${params}`);
};

export const saveAstrogameRecord = async (record) => safeFetch(`${API_BASE}/api/astrogames/leaderboard`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(record),
});

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
