import React, { useState, useEffect } from 'react';
import { Radio, Newspaper, MapPin, User } from 'lucide-react';
import { fetchNews, fetchEvents, fetchWorkshops } from '../services/api';

const Dashboard = ({ setActivePage, user }) => {
  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState(false);
  const [widgetEvents, setWidgetEvents] = useState([]);
  const [widgetWorkshops, setWidgetWorkshops] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoadingNews(true);
      setErrorNews(false);
      try {
        const data = await fetchNews();
        const list = data && (data.articles || data.results || data) ? (data.articles || data.results || data) : [];
        if (!list || list.length === 0) {
          setErrorNews(true);
          setArticles([]);
          return;
        }
        setArticles(list.slice ? list.slice(0, 3) : []);
      } catch (e) {
        console.error('news error', e);
        setErrorNews(true);
      } finally {
        setLoadingNews(false);
      }
    };

    load();
    (async () => {
      try {
        const ev = await fetchEvents();
        setWidgetEvents(ev.slice ? ev.slice(0, 3) : []);
      } catch (e) {
        setWidgetEvents([]);
      }
      try {
        const ws = await fetchWorkshops();
        setWidgetWorkshops(ws.slice ? ws.slice(0, 3) : []);
      } catch (e) {
        setWidgetWorkshops([]);
      }
    })();
  }, []);

  return (
    <div className="page-content">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-tag">
            <Radio size={12} style={{ marginRight: '6px' }} /> Global Astronomy Network
          </div>
          <h1 className="hero-title">
            Explore the Cosmos<br /><span>Together.</span>
          </h1>
          <p className="hero-sub">
            Welcome to <b>Astro Club INSAT</b>. Spread information, track our upcoming stargazing events, and dive into the latest astrophysical discoveries.
          </p>
          {!user && (
            <div className="status-indicator" style={{ marginBottom: '18px' }}>
              Observer mode enabled. <button className="btn-more" onClick={() => setActivePage('login')} style={{ color: 'var(--text-primary)' }}>Sign in for full access</button>
            </div>
          )}
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => setActivePage('workshops')}>
              Join Workshop
            </button>
            <button className="btn btn-secondary" onClick={() => setActivePage('skymap')}>
              View Sky Map
            </button>
          </div>
        </div>

        <div className="orbit-container">
          <div className="orbit-center"></div>
          <div className="orbit-ring ring-1"></div>
          <div className="orbit-ring ring-2"></div>
          <div className="orbit-ring ring-3"></div>
        </div>
      </section>

      <div className="main-grid">
        <div>
          <div className="section-header">
            <h2 className="section-title">
              <Newspaper style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Space Magazine Briefs
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span> Live Data
            </span>
          </div>

          <div className="magazine-grid">
            {loadingNews ? (
              <div className="loader"></div>
            ) : errorNews ? (
              <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
                Unable to connect to the Space News network at this time. Please try again later.
              </p>
            ) : (
              articles.map((item, index) => {
                const isFeatured = index === 0;
                const dateObj = new Date(item.published_at || item.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mag-card ${isFeatured ? 'featured' : ''}`}
                    key={item.id}
                  >
                    <div className="mag-img">
                      <img
                        src={item.image_url || item.image}
                        alt={item.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="mag-content">
                      <div className="mag-meta"><span>{item.news_site || 'Astronomy News'}</span> • {formattedDate}</div>
                      <h3 className="mag-title">{item.title}</h3>
                      <p className="mag-excerpt">{item.summary || item.description || 'Discover the latest astronomy breakthrough...'}</p>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>

        <div className="widgets">
          <div className="widget-box">
            <h3 className="widget-title">Upcoming Events</h3>
            <div>
              {widgetEvents.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No events scheduled yet.</p>
              ) : (
                widgetEvents.map((ev, index) => (
                  <div className="list-item" key={index}>
                    <div className="date-badge">
                      <div className="date-d">{new Date(ev.date || Date.now()).getDate()}</div>
                      <div className="date-m">{new Date(ev.date || Date.now()).toLocaleString('en-US', { month: 'short' })}</div>
                    </div>
                    <div className="item-info">
                      <h4>{ev.title}</h4>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {ev.location}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="widget-box">
            <h3 className="widget-title">Scheduled Workshops</h3>
            <div>
              {widgetWorkshops.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No workshops scheduled yet.</p>
              ) : (
                widgetWorkshops.map((ws, index) => (
                  <div className="list-item" key={index}>
                    <div className="date-badge">
                      <div className="date-d">{new Date(ws.date || Date.now()).getDate()}</div>
                      <div className="date-m">{new Date(ws.date || Date.now()).toLocaleString('en-US', { month: 'short' })}</div>
                    </div>
                    <div className="item-info">
                      <h4>{ws.title}</h4>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} /> by {ws.instructor}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
