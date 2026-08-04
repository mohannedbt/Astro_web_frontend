// astronomyEvents.js
//
// All lunar phases, eclipses, planetary elongations, oppositions, and
// equinoxes/solstices below are CALCULATED, not looked up from a fixed
// table. We use `astronomy-engine` (https://github.com/cosinekitty/astronomy),
// an open-source library based on the VSOP87 / NOVAS models, accurate to
// about ±1 arcminute and cross-checked against JPL Horizons. Ask it for any
// year/month and it will do the actual orbital math for that date — so this
// keeps working correctly in 2027, 2030, etc. with zero data-entry.
//
//   npm install astronomy-engine
//
// The one exception is meteor showers: their peak dates come from the
// physical debris trail a comet left behind, not from clean orbital
// mechanics, and there's no free public API for that. Those still come from
// a small reference table sourced from the IMO/AMS annual meteor shower
// calendar (see METEOR_SHOWERS below) — but everything else is live math.

const Astronomy = require('astronomy-engine');
const logger = require('../utils/logger');

const EVENT_IMAGES_DB = {
  lunar: [
    'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
  ],
  eclipse: [
    'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1462332420958-a05d1e7413e3?w=400&h=400&fit=crop',
  ],
  planetary: [
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=400&fit=crop',
  ],
  meteor: [
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=400&h=400&fit=crop',
  ],
};

const RELIABLE_SOURCE_MAP = {
  lunar: 'https://science.nasa.gov/moon/lunar-phases-and-eclipses/',
  eclipse: 'https://science.nasa.gov/eclipses/',
  planetary: 'https://science.nasa.gov/solar-system/',
  meteor: 'https://science.nasa.gov/asteroids-comets-meteors/',
};

const PLANET_LINKS = {
  Mercury: 'https://science.nasa.gov/mercury/',
  Venus: 'https://science.nasa.gov/venus/',
  Mars: 'https://science.nasa.gov/mars/',
  Jupiter: 'https://science.nasa.gov/jupiter/',
  Saturn: 'https://science.nasa.gov/saturn/',
  Uranus: 'https://science.nasa.gov/uranus/',
  Neptune: 'https://science.nasa.gov/neptune/',
};

// Meteor showers: recurring debris-trail crossings, not orbital mechanics you
// can derive from scratch. month/day is the typical peak date; it can shift
// by up to a day or two year to year. Source: IMO / American Meteor Society
// annual calendars. zhr = zenithal hourly rate (typical meteors/hour).
const METEOR_SHOWERS = [
  { name: 'Quadrantids', month: 1, day: 3, zhr: 80 },
  { name: 'Lyrids', month: 4, day: 22, zhr: 18 },
  { name: 'Eta Aquariids', month: 5, day: 5, zhr: 40 },
  { name: 'Perseids', month: 8, day: 13, zhr: 100 },
  { name: 'Orionids', month: 10, day: 21, zhr: 20 },
  { name: 'Draconids', month: 10, day: 8, zhr: 10 },
  { name: 'Leonids', month: 11, day: 17, zhr: 15 },
  { name: 'Geminids', month: 12, day: 14, zhr: 120 },
  { name: 'Ursids', month: 12, day: 22, zhr: 10 },
];

const dateKey = (d) => d.toISOString().slice(0, 10);

const normalizeEvent = (event) => {
  const type = event.type;
  const link = PLANET_LINKS[event.body] || RELIABLE_SOURCE_MAP[type] || 'https://science.nasa.gov/';
  return {
    name: event.name,
    type,
    description: event.description,
    link,
    image: EVENT_IMAGES_DB[type]?.[event.imgIdx || 0] || '',
  };
};

// ---- computed event finders --------------------------------------------

function findMoonPhases(rangeStart, rangeEnd) {
  const out = [];
  let quarter = Astronomy.SearchMoonQuarter(Astronomy.MakeTime(new Date(rangeStart.getTime() - 32 * 86400000)));
  while (quarter.time.date <= rangeEnd) {
    if (quarter.time.date >= rangeStart && (quarter.quarter === 0 || quarter.quarter === 2)) {
      const isNew = quarter.quarter === 0;
      out.push({
        date: quarter.time.date,
        name: isNew ? 'New Moon' : 'Full Moon',
        type: 'lunar',
        description: isNew
          ? 'The Moon passes between Earth and the Sun and disappears from the night sky, starting a new lunar cycle.'
          : 'The Moon reaches peak illumination, appearing fully lit in the night sky.',
        imgIdx: isNew ? 1 : 0,
      });
    }
    quarter = Astronomy.NextMoonQuarter(quarter);
  }
  return out;
}

function findSolarEclipses(rangeStart, rangeEnd) {
  const out = [];
  let e = Astronomy.SearchGlobalSolarEclipse(Astronomy.MakeTime(new Date(rangeStart.getTime() - 200 * 86400000)));
  while (e.peak.date <= rangeEnd) {
    if (e.peak.date >= rangeStart) {
      const kindText = { total: 'total', annular: 'annular', partial: 'partial', hybrid: 'hybrid' }[e.kind] || e.kind;
      out.push({
        date: e.peak.date,
        name: `${kindText[0].toUpperCase()}${kindText.slice(1)} Solar Eclipse`,
        type: 'eclipse',
        description: `A ${kindText} solar eclipse occurs as the Moon passes in front of the Sun, with the path of greatest eclipse crossing part of Earth's surface.`,
        imgIdx: 0,
      });
    }
    e = Astronomy.NextGlobalSolarEclipse(e.peak);
  }
  return out;
}

function findLunarEclipses(rangeStart, rangeEnd) {
  const out = [];
  let e = Astronomy.SearchLunarEclipse(Astronomy.MakeTime(new Date(rangeStart.getTime() - 200 * 86400000)));
  while (e.peak.date <= rangeEnd) {
    if (e.peak.date >= rangeStart && e.kind !== 'penumbral') {
      const pct = Math.round(e.obscuration * 100);
      out.push({
        date: e.peak.date,
        name: `${e.kind === 'total' ? 'Total' : 'Partial'} Lunar Eclipse`,
        type: 'eclipse',
        description: e.kind === 'total'
          ? 'The Moon passes fully into Earth\'s shadow and takes on a reddish "blood moon" glow.'
          : `About ${pct}% of the Moon enters Earth's dark umbral shadow, visible wherever the Moon is above the horizon.`,
        imgIdx: 1,
      });
    }
    e = Astronomy.NextLunarEclipse(e.peak);
  }
  return out;
}

function findElongations(rangeStart, rangeEnd) {
  const out = [];
  for (const bodyName of ['Mercury', 'Venus']) {
    let t = Astronomy.MakeTime(new Date(rangeStart.getTime() - 130 * 86400000));
    for (let i = 0; i < 12; i++) {
      const ev = Astronomy.SearchMaxElongation(Astronomy.Body[bodyName], t);
      if (ev.time.date > rangeEnd) break;
      if (ev.time.date >= rangeStart) {
        const direction = ev.visibility === 'morning' ? 'Western' : 'Eastern';
        out.push({
          date: ev.time.date,
          name: `${bodyName} at Greatest ${direction} Elongation`,
          type: 'planetary',
          body: bodyName,
          description: `${bodyName} reaches its maximum apparent distance from the Sun (${ev.elongation.toFixed(1)}\u00b0), making this the best ${ev.visibility} apparition for viewing it.`,
          imgIdx: 1,
        });
      }
      t = Astronomy.MakeTime(new Date(ev.time.date.getTime() + 5 * 86400000));
    }
  }
  return out;
}

function findOppositions(rangeStart, rangeEnd) {
  const out = [];
  for (const bodyName of ['Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']) {
    let t = Astronomy.MakeTime(new Date(rangeStart.getTime() - 850 * 86400000));
    for (let i = 0; i < 10; i++) {
      const ev = Astronomy.SearchRelativeLongitude(Astronomy.Body[bodyName], 0, t);
      if (ev.date > rangeEnd) break;
      if (ev.date >= rangeStart) {
        out.push({
          date: ev.date,
          name: `${bodyName} at Opposition`,
          type: 'planetary',
          body: bodyName,
          description: `${bodyName} lies directly opposite the Sun as seen from Earth, at its closest and brightest for the year, and is visible all night.`,
          imgIdx: 0,
        });
      }
      t = Astronomy.MakeTime(new Date(ev.date.getTime() + 30 * 86400000));
    }
  }
  return out;
}

function findSeasonMarkers(rangeStart, rangeEnd) {
  const out = [];
  for (const year of new Set([rangeStart.getUTCFullYear(), rangeEnd.getUTCFullYear()])) {
    const s = Astronomy.Seasons(year);
    const markers = [
      { date: s.mar_equinox.date, name: 'March Equinox' },
      { date: s.jun_solstice.date, name: 'June Solstice' },
      { date: s.sep_equinox.date, name: 'September Equinox' },
      { date: s.dec_solstice.date, name: 'December Solstice' },
    ];
    for (const m of markers) {
      if (m.date >= rangeStart && m.date <= rangeEnd) {
        out.push({
          date: m.date,
          name: m.name,
          type: 'planetary',
          description: `Earth reaches the point in its orbit marking the ${m.name.toLowerCase()}, a change in the length of day and night.`,
          imgIdx: 0,
        });
      }
    }
  }
  return out;
}

function findMeteorShowers(rangeStart, rangeEnd) {
  const out = [];
  for (const year of new Set([rangeStart.getUTCFullYear(), rangeEnd.getUTCFullYear()])) {
    for (const shower of METEOR_SHOWERS) {
      const d = new Date(Date.UTC(year, shower.month - 1, shower.day));
      if (d >= rangeStart && d <= rangeEnd) {
        out.push({
          date: d,
          name: `${shower.name} Meteor Shower Peak`,
          type: 'meteor',
          description: `The ${shower.name} peak tonight, with up to ${shower.zhr} meteors per hour possible under dark skies away from city lights. Exact peak timing and moonlight conditions vary by year — check IMO/AMS for this year's forecast.`,
          imgIdx: shower.zhr >= 50 ? 0 : 1,
        });
      }
    }
  }
  return out;
}

// ---- assembling a month of events, with a per-year cache ---------------

const yearCache = new Map();

function computeYear(year) {
  if (yearCache.has(year)) return yearCache.get(year);

  const rangeStart = new Date(Date.UTC(year, 0, 1));
  const rangeEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const raw = [
    ...findMoonPhases(rangeStart, rangeEnd),
    ...findSolarEclipses(rangeStart, rangeEnd),
    ...findLunarEclipses(rangeStart, rangeEnd),
    ...findElongations(rangeStart, rangeEnd),
    ...findOppositions(rangeStart, rangeEnd),
    ...findSeasonMarkers(rangeStart, rangeEnd),
    ...findMeteorShowers(rangeStart, rangeEnd),
  ];

  const byDate = {};
  for (const ev of raw) {
    const key = dateKey(ev.date);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(normalizeEvent(ev));
  }

  yearCache.set(year, byDate);
  return byDate;
}

// ---- live astro news (Spaceflight News API / SNAPI) ----------------------
//
// Free, no API key, aggregates articles from 40+ real outlets (NASA,
// SpaceNews, NASASpaceflight, ESA, etc). Docs: https://api.spaceflightnewsapi.net/v4/docs/
// Requires Node 18+ (global fetch) or install `node-fetch` on older Node.

const SNAPI_BASE = 'https://api.spaceflightnewsapi.net/v4/articles/';

async function fetchAstroNews(query, limit = 5) {
  const url = `${SNAPI_BASE}?search=${encodeURIComponent(query)}&limit=${limit}&ordering=-published_at`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SNAPI request failed: ${res.status}`);
  const data = await res.json();
  return data.results.map((a) => ({
    title: a.title,
    summary: a.summary,
    url: a.url,
    image: a.image_url,
    source: a.news_site,
    publishedAt: a.published_at,
  }));
}

// ---- routes ---------------------------------------------------------------

function astronomyEventsRoutes(app) {
  app.get('/api/astronomy-events', async (req, res) => {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const month = Number(req.query.month);

      if (isNaN(month) || month < 0 || month > 11) {
        return res.status(400).json({ error: 'Invalid month. Must be 0-11.' });
      }

      const monthStr = String(month + 1).padStart(2, '0');
      const yearEvents = computeYear(year);
      const filteredEvents = {};
      Object.keys(yearEvents).forEach((key) => {
        if (key.startsWith(`${year}-${monthStr}`)) {
          filteredEvents[key] = yearEvents[key];
        }
      });

      return res.json({ year, month, events: filteredEvents });
    } catch (error) {
      logger.error('Error fetching astronomy events', { message: error.message, stack: error.stack, year, month: req.query.month });
      res.status(500).json({ error: 'Unable to fetch astronomy events' });
    }
  });

  app.get('/api/astronomy-events/date/:date', async (req, res) => {
    try {
      const { date } = req.params;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      const year = Number(date.slice(0, 4));
      const yearEvents = computeYear(year);
      return res.json({ date, events: yearEvents[date] || [] });
    } catch (error) {
      logger.error('Error fetching astronomy events for date', { message: error.message, stack: error.stack, date: req.params.date });
      res.status(500).json({ error: 'Unable to fetch events for this date' });
    }
  });

  app.get('/api/astronomy-events/types', async (req, res) => {
    return res.json({ types: Object.keys(EVENT_IMAGES_DB) });
  });

  app.get('/api/astronomy-events/type/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const year = Number(req.query.year) || new Date().getFullYear();
      const yearEvents = computeYear(year);
      const filteredEvents = {};
      Object.keys(yearEvents).forEach((key) => {
        const dayEvents = yearEvents[key].filter((e) => e.type === type);
        if (dayEvents.length > 0) filteredEvents[key] = dayEvents;
      });
      return res.json({ type, year, events: filteredEvents });
    } catch (error) {
      logger.error('Error filtering astronomy events by type', { message: error.message, stack: error.stack, type, year });
      res.status(500).json({ error: 'Unable to filter events by type' });
    }
  });

  // Live news, general: /api/astronomy-news?query=meteor+shower&limit=5
  app.get('/api/astronomy-news', async (req, res) => {
    try {
      const query = req.query.query || 'astronomy';
      const limit = Math.min(Number(req.query.limit) || 5, 20);
      const articles = await fetchAstroNews(query, limit);
      return res.json({ query, articles });
    } catch (error) {
      logger.error('Error fetching astronomy news', { message: error.message, stack: error.stack, query, limit });
      res.status(502).json({ error: 'Unable to fetch astronomy news' });
    }
  });

  // Live news tied to whatever's actually happening on a given date, e.g.
  // /api/astronomy-news/date/2026-08-12 pulls news for "New Moon",
  // "Total Solar Eclipse", etc. that land on that day.
  app.get('/api/astronomy-news/date/:date', async (req, res) => {
    try {
      const { date } = req.params;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      const year = Number(date.slice(0, 4));
      const events = computeYear(year)[date] || [];

      const withNews = await Promise.all(
        events.map(async (ev) => {
          try {
            const news = await fetchAstroNews(ev.name, 3);
            return { ...ev, news };
          } catch {
            return { ...ev, news: [] };
          }
        })
      );

      return res.json({ date, events: withNews });
    } catch (error) {
      logger.error('Error fetching astronomy event news', { message: error.message, stack: error.stack, date });
      res.status(500).json({ error: 'Unable to fetch news for this date' });
    }
  });
}

module.exports = { astronomyEventsRoutes };