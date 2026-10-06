import { useState, useEffect } from 'react';
import {
  Newspaper,
  MapPin,
  User,
  Compass,
  Sparkles,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { ACI_EVENTS, fetchNews, fetchEvents, fetchWorkshops } from '../services/api';

const Dashboard = ({ setActivePage, user, token }) => {
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
        const list = data && (data.articles || data.results || data) ? data.articles || data.results || data : [];
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
        const ev = await fetchEvents(token);
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
  }, [token]);

  return (
    <div className="page-content dashboard-page-root">
      <section className="dashboard-club-intro" aria-labelledby="dashboard-club-title">
        <div className="dashboard-club-copy">
          <span className="dashboard-club-kicker">ASTRO CLUB INSAT · UNIVERSITÉ DE CARTHAGE</span>
          <h1 id="dashboard-club-title">Curiosity grows when we explore together.</h1>
          <p>
            ACI brings INSAT engineering students together around astronomy, astrophysics, and space technology.
            Through learning, shared projects, and friendly collaboration, the club welcomes everyone from
            experienced enthusiasts to people who are simply curious about the night sky.
          </p>
          <div className="dashboard-club-actions">
            <button className="btn btn-primary" onClick={() => setActivePage('events')}>
              <Calendar size={16} /> Explore club events
            </button>
            <button className="btn btn-secondary" onClick={() => setActivePage('astrogames')}>
              <Sparkles size={16} /> Explore the space arcade
            </button>
            <button className="btn btn-secondary" onClick={() => setActivePage('skymap')}>
              <Compass size={16} /> Open the sky map
            </button>
          </div>
        </div>
        <div className="dashboard-club-pillars" aria-label="Club activities">
          <span>Learn</span>
          <span>Make</span>
          <span>Research together</span>
        </div>
      </section>

      <section className="dashboard-aci-events" aria-labelledby="dashboard-aci-events-title">
        <div className="dashboard-aci-events-heading">
          <div>
            <span className="dashboard-club-kicker">MEET ACI THROUGH ITS EVENTS</span>
            <h2 id="dashboard-aci-events-title">Three ways to explore the cosmos.</h2>
          </div>
          <button className="dashboard-events-link" onClick={() => setActivePage('events')}>
            Open the timeline <ArrowRight size={16} />
          </button>
        </div>
        <div className="dashboard-aci-event-grid">
          {ACI_EVENTS.map((event) => (
            <article className="dashboard-aci-event" key={event.id}>
              <div className="dashboard-aci-event-image">
                <img src={event.image} alt="" loading="lazy" />
              </div>
              <div className="dashboard-aci-event-copy">
                <span className="dashboard-aci-event-category">{event.category}</span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <button className="dashboard-event-detail" onClick={() => setActivePage('events')}>
                  Event details <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Main Content Grid: Space News & Observatory Widgets */}
      <div className="main-grid">
        {/* Space News Column */}
        <div>
          <div className="section-header">
            <h2 className="section-title">
              <Newspaper style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Space
              Magazine Briefs
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
              Live Astrophoto Feed
            </span>
          </div>

          <div className="magazine-grid">
            {loadingNews ? (
              <div className="loader" />
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
                          e.target.src =
                            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="mag-content">
                      <div className="mag-meta">
                        <span>{item.news_site || 'Astronomy News'}</span> • {formattedDate}
                      </div>
                      <h3 className="mag-title">{item.title}</h3>
                      <p className="mag-excerpt">
                        {item.summary || item.description || 'Discover the latest astronomy breakthrough...'}
                      </p>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>

        {/* Widgets Column */}
        <div className="widgets">
          {/* Upcoming Expeditions Widget */}
          <div className="widget-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="widget-title" style={{ margin: 0 }}>Upcoming Expeditions</h3>
              <button
                className="btn-more"
                onClick={() => setActivePage('events')}
                style={{ fontSize: '12px', color: 'var(--accent)' }}
              >
                Full Timeline →
              </button>
            </div>
            <div>
              {widgetEvents.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No events scheduled yet.</p>
              ) : (
                widgetEvents.map((ev, index) => (
                  <div
                    className="list-item"
                    key={index}
                    onClick={() => setActivePage('events')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="date-badge">
                      <div className="date-d">{new Date(ev.date || Date.now()).getDate()}</div>
                      <div className="date-m">
                        {new Date(ev.date || Date.now()).toLocaleString('en-US', { month: 'short' })}
                      </div>
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

          {/* Scheduled Workshops Widget */}
          <div className="widget-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="widget-title" style={{ margin: 0 }}>Hands-on Workshops</h3>
              <button
                className="btn-more"
                onClick={() => setActivePage('workshops')}
                style={{ fontSize: '12px', color: 'var(--accent)' }}
              >
                Enroll →
              </button>
            </div>
            <div>
              {widgetWorkshops.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No workshops scheduled yet.</p>
              ) : (
                widgetWorkshops.map((ws, index) => (
                  <div
                    className="list-item"
                    key={index}
                    onClick={() => setActivePage('workshops')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="date-badge">
                      <div className="date-d">{new Date(ws.date || Date.now()).getDate()}</div>
                      <div className="date-m">
                        {new Date(ws.date || Date.now()).toLocaleString('en-US', { month: 'short' })}
                      </div>
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
