import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Info, Clock, Search } from 'lucide-react';
import { fetchEvents } from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEvents();
      setEvents(data);
      setLoading(false);
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter((ev) => 
    ev.title.toLowerCase().includes(searchText.toLowerCase()) ||
    ev.location.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="page-title-area">
        <h1>Stargazing & Astronomy Events</h1>
        <p>Participate in our field operations, night sky watches, and telescope tracking syncs.</p>
      </div>

      <section className="filter-panel" style={{ marginBottom: '24px' }}>
        <div className="search-input-wrapper" style={{ maxWidth: '400px', width: '100%' }}>
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search events or locations..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </section>

      {loading ? (
        <div className="no-results">
          <h3>Loading Astro Events...</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredEvents.map((ev) => (
            <div 
              key={ev.id} 
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 3fr 1fr',
                gap: '24px',
                alignItems: 'center'
              }}
            >
              {/* Date Box */}
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '100px'
              }}>
                <Calendar size={24} style={{ margin: '0 auto 8px', color: 'var(--text-primary)' }} />
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {ev.date.split(',')[0]}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {ev.date.split(',')[1]}
                </div>
              </div>

              {/* Event Content */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  {ev.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                  {ev.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> {ev.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {ev.time}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> Capacity: {ev.capacity}
                  </span>
                </div>
              </div>

              {/* Status and Action */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: ev.status === 'Open' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: ev.status === 'Open' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${ev.status === 'Open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {ev.status}
                  </span>
                </div>
                <button 
                  className="btn-join"
                  disabled={ev.status !== 'Open'}
                  onClick={() => alert(`Successfully registered for: ${ev.title}`)}
                  style={{ margin: 0, width: '100%' }}
                >
                  {ev.status === 'Open' ? 'Register' : 'Filled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
