const axios = require('axios');
const { dbAll, dbRun } = require('../middleware/database');

async function fetchFacebookEvents(pageId, accessToken) {
  if (!pageId || !accessToken) throw new Error('pageId and accessToken required');
  const url = `https://graph.facebook.com/v15.0/${pageId}/events?fields=id,name,description,start_time,place,cover,attending_count&access_token=${accessToken}`;
  const res = await axios.get(url);
  const events = res.data && res.data.data ? res.data.data : [];

  for (const ev of events) {
    const sid = ev.id;
    const title = ev.name || ev.title || 'Untitled Event';
    const start_time = ev.start_time || '';
    const description = ev.description || '';
    const location = (ev.place && ev.place.name) || 'TBA';
    const startDate = start_time ? new Date(start_time) : null;
    const time = startDate
      ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : '';
    const status = startDate && startDate.getTime() > Date.now() ? 'Open' : 'Past';
    const capacity = typeof ev.attending_count === 'number' ? ev.attending_count : 0;

    const existing = (await dbAll('SELECT id FROM events WHERE source_id = ?', [sid]))[0];
    if (existing) {
      await dbRun(
        'UPDATE events SET title = ?, start_time = ?, description = ?, location = ?, time = ?, status = ?, capacity = ? WHERE source_id = ?',
        [title, start_time, description, location, time, status, capacity, sid]
      );
    } else {
      await dbRun(
        'INSERT INTO events (source_id, title, start_time, description, location, time, status, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [sid, title, start_time, description, location, time, status, capacity]
      );
    }
  }
  return events.length;
}

module.exports = { fetchFacebookEvents };