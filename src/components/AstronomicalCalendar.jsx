import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import '../styles/AstronomicalCalendar.css';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const getEventTypeColor = (type) => {
  switch (type) {
    case 'lunar':
      return '#c9a05c';
    case 'eclipse':
      return '#b5342e';
    case 'planetary':
      return '#6f8f9e';
    case 'comet':
      return '#8fae8b';
    case 'meteor':
      return '#d18a3f';
    default:
      return '#a37b3a';
  }
};

const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const day = first.getDay();
  return day === 0 ? 6 : day - 1;
};

const formatDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Use the existing ACI brand image in the calendar header so it stays
// visually consistent with the rest of the site.
const ClubBadge = () => (
  <div className="club-badge" aria-label="ACI logo">
    <img src="/profile.png" alt="ACI logo" />
  </div>
);

const SocialIcons = () => (
  <div className="social-row">
    <a href="#" aria-label="Facebook" className="social-icon">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.6h2.6l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3C16.3 4.2 15.4 4.1 14.3 4.1c-2.5 0-4.2 1.5-4.2 4.3v2H7.5v3h2.6V21h3.4z"/></svg>
    </a>
    <a href="#" aria-label="Instagram" className="social-icon">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c2.7 0 3 0 4.1.06 1.1.05 1.8.22 2.2.37.6.23 1 .5 1.4.9.4.4.67.8.9 1.4.15.4.32 1.1.37 2.2.06 1.1.06 1.4.06 4.1s0 3-.06 4.1c-.05 1.1-.22 1.8-.37 2.2-.23.6-.5 1-.9 1.4-.4.4-.8.67-1.4.9-.4.15-1.1.32-2.2.37-1.1.06-1.4.06-4.1.06s-3 0-4.1-.06c-1.1-.05-1.8-.22-2.2-.37-.6-.23-1-.5-1.4-.9-.4-.4-.67-.8-.9-1.4-.15-.4-.32-1.1-.37-2.2C2.2 15 2.2 14.7 2.2 12s0-3 .06-4.1c.05-1.1.22-1.8.37-2.2.23-.6.5-1 .9-1.4.4-.4.8-.67 1.4-.9.4-.15 1.1-.32 2.2-.37C9 2.2 9.3 2.2 12 2.2zm0 1.8c-2.65 0-2.96 0-4 .06-.97.04-1.5.2-1.85.34-.46.18-.8.4-1.15.75-.35.35-.57.69-.75 1.15-.14.35-.3.88-.34 1.85-.05 1.04-.06 1.35-.06 4s0 2.96.06 4c.04.97.2 1.5.34 1.85.18.46.4.8.75 1.15.35.35.69.57 1.15.75.35.14.88.3 1.85.34 1.04.05 1.35.06 4 .06s2.96 0 4-.06c.97-.04 1.5-.2 1.85-.34.46-.18.8-.4 1.15-.75.35-.35.57-.69.75-1.15.14-.35.3-.88.34-1.85.05-1.04.06-1.35.06-4s0-2.96-.06-4c-.04-.97-.2-1.5-.34-1.85a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.35-.14-.88-.3-1.85-.34-1.04-.06-1.35-.06-4-.06zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28zm5.13-1.98a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"/></svg>
    </a>
    <a href="#" aria-label="LinkedIn" className="social-icon">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.1 3.77-2.1 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9z"/></svg>
    </a>
    <a href="#" aria-label="TikTok" className="social-icon">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.36 2.2 1.7 3.65 3.9 3.8v2.9c-1.36.06-2.6-.36-3.9-1.14v6.4c0 3.2-2.6 5.5-5.6 5.5-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c.32 0 .63.03.93.08v2.98a2.7 2.7 0 0 0-.93-.16 2.7 2.7 0 1 0 2.7 2.7V3h2.9z"/></svg>
    </a>
  </div>
);

export default function AstronomicalCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthEvents, setMonthEvents] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const response = await fetch(`/api/astronomy-events?year=${year}&month=${month}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setMonthEvents(data.events || {});
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Unable to load astronomical events');
      } finally {
        setLoading(false);
      }
    };
    fetchMonthEvents();
  }, [currentDate]);

  useEffect(() => {
    if (selectedDate) {
      const key = formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const events = monthEvents[key] || [];
      setSelectedEvents(events);
    }
  }, [selectedDate, monthEvents]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const key = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    return monthEvents[key] || [];
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Flat list of this month's events, in date order, for the side panel —
  // mirrors the poster's "month at a glance" list rather than a single-day view.
  const monthEventEntries = Object.keys(monthEvents)
    .filter((key) => key.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`))
    .sort()
    .map((key) => ({ day: parseInt(key.split('-')[2], 10), events: monthEvents[key] }));

  return (
    <div className="astro-page">
      <div className="astro-starfield" aria-hidden="true" />

      <div className="page-content">
        <div className="astro-masthead">
          <h1 className="astro-month-script">{MONTH_NAMES[currentDate.getMonth()]}</h1>
          <div className="astro-masthead-right">
            <span className="astro-year">{currentDate.getFullYear()}</span>
            <ClubBadge />
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="astro-calendar-container">
          <div className="astro-calendar-main">
            <div className="calendar-header">
              <button className="nav-button" onClick={goToPreviousMonth} aria-label="Previous month">
                <ChevronLeft size={20} />
              </button>
              <span className="nav-label">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
              <button className="nav-button" onClick={goToNextMonth} aria-label="Next month">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="calendar-grid">
              {DAY_NAMES.map((day) => (
                <div key={day} className="weekday-header">{day}</div>
              ))}

              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const featured = dayEvents[0];

                return (
                  <div
                    key={index}
                    className={`calendar-day ${day ? 'active' : 'empty'} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
                    style={featured ? {
                      backgroundImage: `linear-gradient(180deg, rgba(10,17,40,0.05) 45%, rgba(10,17,40,0.85) 100%), url('${featured.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : undefined}
                    onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  >
                    {day && <div className="day-number">{day}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="event-details-panel">
            {loading ? (
              <div className="loading-state">
                <Loader2 size={28} className="spin" />
                <p>Loading events...</p>
              </div>
            ) : monthEventEntries.length === 0 ? (
              <div className="event-placeholder">
                <Sparkles size={40} />
                <p>No astronomical events this month</p>
              </div>
            ) : (
              <div className="events-list">
                {monthEventEntries.map(({ day, events }) => (
                  <div key={day} className="event-row">
                    <div className="event-row-date">
                      {MONTH_NAMES[currentDate.getMonth()].slice(0, 3)} {day}:
                    </div>
                    <ul className="event-row-list">
                      {events.map((event, idx) => (
                        <li key={idx} style={{ '--dot-color': getEventTypeColor(event.type) }}>
                          {event.name}
                          {event.link && (
                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link" aria-label="Learn more">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedDate && selectedEvents.length > 0 && (
          <div className="selected-day-strip">
            <h3>{MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}</h3>
            <div className="selected-day-cards">
              {selectedEvents.map((event, idx) => (
                <div key={idx} className="event-card">
                  {event.image && (
                    <div className="event-card-image" style={{ backgroundImage: `url('${event.image}')` }} />
                  )}
                  <div className="event-card-content">
                    <div className="event-type-badge" style={{ backgroundColor: getEventTypeColor(event.type) }}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </div>
                    <h4 className="event-name">{event.name}</h4>
                    <p className="event-description">{event.description}</p>
                    {event.link && (
                      <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link-full">
                        Learn More <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="astro-footer">
          <span className="astro-footer-name">AstroClubINSAT</span>
          <SocialIcons />
        </div>
      </div>
    </div>
  );
}