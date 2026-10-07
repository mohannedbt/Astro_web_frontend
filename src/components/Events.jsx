import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import { ACI_EVENTS, fetchEvents } from '../services/api';
import './Events.css';

/*
  DATES
  The dates are not fixed yet, so show the announced season rather than guessed days.
  Per event, the label is resolved like this:
    1. event.dateConfirmed === true  -> exact date (taken from startAt / date)
    2. event.season                  -> "Fall 2026"
    3. event.month (1-12 or a name)  -> "Date TBA · April"
    4. otherwise                     -> "Exact date to be confirmed"
  To publish an exact date, set `dateConfirmed: true` plus `startAt` on the event.
*/
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const monthIndexOf = (value) => {
  if (typeof value === 'number' && value >= 1 && value <= 12) return value - 1;
  if (typeof value === 'string' && value.trim()) {
    const idx = MONTHS.findIndex((m) => m.toLowerCase().startsWith(value.trim().toLowerCase().slice(0, 3)));
    return idx;
  }
  return -1;
};

const getDateLabel = (ev) => {
  if (ev.dateConfirmed) {
    const d = new Date(ev.startAt || ev.date);
    if (!Number.isNaN(d.getTime())) {
      return { kind: 'fixed', day: String(d.getDate()), month: MONTHS[d.getMonth()], iso: d.toISOString() };
    }
  }
  if (ev.season) return { kind: 'season', text: ev.season };
  const m = monthIndexOf(ev.month);
  if (m >= 0) return { kind: 'month', day: 'TBA', month: MONTHS[m] };
  return { kind: 'tba' };
};

const labelToText = (label) => {
  if (label.kind === 'season' || label.kind === 'tba') return label.text || 'Exact date to be confirmed';
  return `${label.day} ${label.month}`;
};

const DateBlock = ({ label }) => {
  if (label.kind === 'season') {
    return (
      <span className="tl-date tl-date--season">
        <span className="tl-date-season">{label.text}</span>
      </span>
    );
  }
  if (label.kind === 'tba') return <span className="tl-date tl-date--tba">Exact date to be confirmed</span>;
  return (
    <span className={`tl-date ${label.kind === 'month' ? 'tl-date--tba' : ''}`}>
      <span className="tl-date-big">{label.day}</span>
      <span className="tl-date-month">{label.month}</span>
    </span>
  );
};

const Events = ({ token }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [drawerEvent, setDrawerEvent] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const trackRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    let active = true;
    fetchEvents(token)
      .then((records) => {
        if (!active) return;
        const normalizeTitle = (title) => (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        const clubEvents = ACI_EVENTS.map((event) => {
          const record = (Array.isArray(records) ? records : []).find((candidate) => (
            String(candidate.id) === String(event.id)
            || normalizeTitle(candidate.title) === normalizeTitle(event.title)
          ));
          if (record) {
            // Admin can override date fields; everything else stays from ACI_EVENTS
            const merged = {
              ...event,
              ...record,
              id: event.id,
              title: event.title,
              description: event.description,
              image: event.image,
              gallery: event.gallery,
            };
            // If the backend record has a real date, mark it as confirmed
            if (record.date || record.startAt) {
              merged.date = record.date || (record.startAt ? record.startAt.split('T')[0] : event.date);
              merged.startAt = record.startAt || (record.date ? `${record.date}T${event.time?.split(' - ')[0] || '20:00'}:00` : event.startAt);
              merged.dateConfirmed = true;
              // Clear the season so the confirmed date takes priority
              delete merged.season;
            }
            return merged;
          }
          return event;
        });
        // Dates aren't fixed, so keep the order defined in ACI_EVENTS (or an explicit `order` field).
        setEvents(clubEvents.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      })
      .catch((error) => {
        console.error('Failed to load club events:', error);
        if (active) setLoadError(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload, token]);

  // Scroll-driven timeline: the spine fills down to the middle of the viewport,
  // events it has passed light up, and the closest one becomes the active backdrop.
  useEffect(() => {
    const track = trackRef.current;
    const list = listRef.current;
    if (loading || !track || !list || !events.length) return undefined;

    let raf = 0;
    let last = -1;

    const update = () => {
      raf = 0;
      const items = itemRefs.current.filter(Boolean);
      if (!items.length) return;

      const mid = track.scrollTop + track.clientHeight * 0.5;
      const listTop = list.offsetTop;
      const fill = Math.min(Math.max(mid - listTop, 0), list.offsetHeight);
      list.style.setProperty('--fill', `${fill.toFixed(1)}px`);

      let best = 0;
      let bestDist = Infinity;
      items.forEach((el, i) => {
        const top = listTop + el.offsetTop;
        const center = top + el.offsetHeight / 2;
        el.classList.toggle('is-passed', top + 64 <= mid);
        const dist = Math.abs(center - mid);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });

      if (best !== last) { last = best; setActiveIndex(best); }
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [loading, events.length]);

  const openDrawer = (event) => { setDrawerEvent(event); setGalleryIndex(0); };
  const closeDrawer = () => setDrawerEvent(null);

  useEffect(() => {
    if (!drawerEvent) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerEvent]);

  return (
    <div className="page-content events-page-root tl-root">
      {loading ? (
        <div className="tl-loading" role="status" aria-label="Loading events" />
      ) : loadError || events.length === 0 ? (
        <div className="tl-empty" role="status">
          <span className="tl-category">ASTRO CLUB INSAT</span>
          <h1>{loadError ? 'Club events are unavailable.' : 'No club events found.'}</h1>
          <p>{loadError ? 'The events service could not be reached. Check back in a moment.' : 'There are no club events to show right now.'}</p>
          <button className="tl-more" onClick={() => { setLoading(true); setLoadError(false); setReload((value) => value + 1); }}>Try again</button>
        </div>
      ) : (
        <>
          <h1 className="tl-title">Club events</h1>

          {/* Backdrop crossfades to the active event's photo */}
          <div className="tl-backdrop" aria-hidden="true">
            {events.map((ev, i) => (
              <img key={ev.id} src={ev.image} alt="" className={i === activeIndex ? 'on' : ''} />
            ))}
            <div className="tl-backdrop-shade" />
          </div>

          <div className="tl-track" ref={trackRef}>
            <ol className="tl-list" ref={listRef}>
              <li className="tl-spine" aria-hidden="true">
                <span className="tl-spine-fill" />
              </li>

              {events.map((event, index) => {
                const label = getDateLabel(event);
                const side = index % 2 === 0 ? 'is-left' : 'is-right';
                return (
                  <li
                    key={event.id}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    className={`tl-item ${side} ${index === activeIndex ? 'is-active' : ''}`}
                  >
                    <div className="tl-when">
                      {label.kind === 'fixed'
                        ? <time dateTime={label.iso}><DateBlock label={label} /></time>
                        : <DateBlock label={label} />}
                    </div>

                    <span className="tl-node" aria-hidden="true" />

                    <article className="tl-card">
                      <div className="tl-card-photo">
                        <img src={event.image} alt={event.title} loading={index < 2 ? 'eager' : 'lazy'} />
                      </div>
                      <div className="tl-card-body">
                        <h2 className="tl-card-title">{event.title}</h2>
                        {event.description && <p className="tl-card-desc">{event.description}</p>}
                        <button className="tl-more" onClick={() => openDrawer(event)} aria-haspopup="dialog">
                          <span>Know More</span>
                          <ExternalLink size={14} strokeWidth={1.6} />
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}

              <li className="tl-end">
                <span className="tl-node tl-node--end" aria-hidden="true" />
                <p>Additional events and confirmed dates will be added here.</p>
              </li>
            </ol>
          </div>
        </>
      )}

      {drawerEvent && createPortal((
        <div className="vintage-drawer-backdrop" onClick={closeDrawer}>
          <div
            className="vintage-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-event-title"
          >
            <div className="drawer-header">
              <div className="drawer-brand">
                <span className="drawer-filmtag">ASTRO CLUB INSAT</span>
              </div>
              <button className="drawer-close-btn" onClick={closeDrawer} aria-label="Close details">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-scroll-body">
              <div className="drawer-hero-image-box">
                <img
                  src={drawerEvent.gallery?.length > 0 ? drawerEvent.gallery[galleryIndex] : drawerEvent.image}
                  alt={drawerEvent.title}
                  className="drawer-hero-img"
                />
              </div>

              {drawerEvent.gallery?.length > 1 && (
                <div className="drawer-gallery-strip">
                  {drawerEvent.gallery.map((url, i) => (
                    <button
                      key={url}
                      className={`gallery-thumb ${galleryIndex === i ? 'active' : ''}`}
                      onClick={() => setGalleryIndex(i)}
                    >
                      <img src={url} alt={`Photo ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              <div className="drawer-content-section">
                <h2 id="drawer-event-title" className="drawer-title">{drawerEvent.title}</h2>
                <p className="tl-modal-date">{labelToText(getDateLabel(drawerEvent))}</p>
                <p className="story-paragraph">{drawerEvent.description}</p>
              </div>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
};

export default Events;