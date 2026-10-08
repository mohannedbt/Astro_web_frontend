import { useState, useEffect } from 'react';
import {
  Newspaper,
  MapPin,
  User,
  Compass,
  Sparkles,
  Calendar,
  ArrowRight,
  Shield,
  Gamepad2,
  Lock,
  CheckCircle,
  Eye,
  LogIn,
  Layers,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { ACI_EVENTS, fetchNews, fetchEvents, fetchWorkshops } from '../services/api';

const getMoonPhase = (date = new Date()) => {
  const d = date.getTime() / 86400000 + 2440587.5;
  const daysSinceNew = ((d - 2451549.5) % 29.53058867 + 29.53058867) % 29.53058867;
  const phaseIndex = daysSinceNew / 29.53058867;
  const illumination = Math.round(((1 - Math.cos(phaseIndex * 2 * Math.PI)) / 2) * 100);

  let phaseName = 'New Moon';
  let emoji = '🌑';
  if (phaseIndex < 0.03 || phaseIndex > 0.97) {
    phaseName = 'New Moon';
    emoji = '🌑';
  } else if (phaseIndex < 0.22) {
    phaseName = 'Waxing Crescent';
    emoji = '🌒';
  } else if (phaseIndex < 0.28) {
    phaseName = 'First Quarter';
    emoji = '🌓';
  } else if (phaseIndex < 0.47) {
    phaseName = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (phaseIndex < 0.53) {
    phaseName = 'Full Moon';
    emoji = '🌕';
  } else if (phaseIndex < 0.72) {
    phaseName = 'Waning Gibbous';
    emoji = '🌖';
  } else if (phaseIndex < 0.78) {
    phaseName = 'Last Quarter';
    emoji = '🌗';
  } else {
    phaseName = 'Waning Crescent';
    emoji = '🌘';
  }

  return { phaseName, emoji, illumination };
};

const Dashboard = ({ setActivePage, user, token, profile }) => {
  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState(false);
  const [widgetEvents, setWidgetEvents] = useState([]);
  const [widgetWorkshops, setWidgetWorkshops] = useState([]);

  const moonInfo = getMoonPhase(new Date());

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
        setWidgetEvents(ev.slice ? ev.slice(0, 1) : []);
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

  const displayName = profile?.name || user?.name || (user?.email ? user.email.split('@')[0] : 'Explorer');

  return (
    <div className="page-content dashboard-page-root">
      {/* Dynamic Header: Auth (Member) vs Non-Auth (Observer Pass) */}
      {!user ? (
        <section className="dashboard-observer-banner" aria-labelledby="observer-title">
          <div className="observer-banner-glow" />
          <div className="observer-banner-content">
            <div className="observer-kicker-row">
              <span className="observer-kicker">
                <Eye size={14} /> PUBLIC OBSERVER PASS ACTIVE
              </span>
              <span className="observer-station-tag">PUBLIC OBSERVER ACCESS</span>
            </div>

            <h1 id="observer-title">Welcome to the Digital Observatory.</h1>
            <p className="observer-text">
              You are exploring Astro Club INSAT in guest observer mode. You have full access to our live Sky Map,
              deep-space telemetry news, and space arcade games. Join the club or sign in to register for field expeditions,
              reserve workshop seats, and record arcade high scores!
            </p>

            <div className="observer-actions">
              <button className="btn-join-primary" onClick={() => setActivePage('login')}>
                <LogIn size={16} /> <span>Sign In / Join ACI</span>
              </button>
              <button className="btn-observer-action" onClick={() => setActivePage('skymap')}>
                <Compass size={16} /> <span>Open Sky Map</span>
              </button>
              <button className="btn-observer-action" onClick={() => setActivePage('astrogames')}>
                <Gamepad2 size={16} /> <span>Space Arcade</span>
              </button>
              <button className="btn-observer-action" onClick={() => setActivePage('events')}>
                <Calendar size={16} /> <span>Club Events</span>
              </button>
            </div>

            {/* Perks Strip */}
            <div className="observer-perks-strip">
              <span className="perk-label">Access Telemetry:</span>
              <span className="perk-item is-unlocked"><CheckCircle size={13} /> Live Sky Map</span>
              <span className="perk-item is-unlocked"><CheckCircle size={13} /> Space Magazine</span>
              <span className="perk-item is-unlocked"><CheckCircle size={13} /> Arcade Demos</span>
              <span className="perk-item is-locked"><Lock size={13} /> Expedition RSVPs (Members)</span>
              <span className="perk-item is-locked"><Lock size={13} /> Darkroom Astrolab (Members)</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="dashboard-member-banner" aria-labelledby="member-title">
          <div className="member-banner-content">
            <div className="member-kicker-row">
              <span className="member-kicker">
                <Sparkles size={14} /> {user.is_admin ? 'ACI ADMINISTRATOR CONSOLE' : 'ACI VERIFIED STARGAZER'}
              </span>
              <span className="member-station-tag">Telemetry Synced</span>
            </div>

            <h1 id="member-title">
              Clear skies, {displayName}!
            </h1>
            <p className="member-text">
              Your member dashboard is ready. Check upcoming stargazing nights, download workshop materials, and
              explore celestial forecasts for this week.
            </p>

            <div className="member-quick-stats">
              <div className="member-stat-box" onClick={() => setActivePage('events')} role="button" tabIndex={0}>
                <Calendar size={20} className="member-stat-icon" />
                <div>
                  <strong>{widgetEvents.length > 0 ? 'Next Event' : 'No Events'}</strong>
                  <span>Club Expeditions</span>
                </div>
              </div>
              <div className="member-stat-box" onClick={() => setActivePage('workshops')} role="button" tabIndex={0}>
                <Layers size={20} className="member-stat-icon" />
                <div>
                  <strong>{widgetWorkshops.length} Active</strong>
                  <span>Hands-On Workshops</span>
                </div>
              </div>
              <div className="member-stat-box" onClick={() => setActivePage('astrogames')} role="button" tabIndex={0}>
                <Gamepad2 size={20} className="member-stat-icon" />
                <div>
                  <strong>3 Games</strong>
                  <span>Space Arcade</span>
                </div>
              </div>
              <div className="member-stat-box" onClick={() => setActivePage('account')} role="button" tabIndex={0}>
                <User size={20} className="member-stat-icon" />
                <div>
                  <strong>Profile</strong>
                  <span>Account Settings</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tonight's Celestial Snapshot & Sky Forecast */}
      <section className="dashboard-sky-snapshot" aria-labelledby="sky-snapshot-title">
        <div className="sky-snapshot-card">
          <div className="sky-snapshot-header">
            <div className="sky-snapshot-title-group">
              <Moon size={18} className="sky-icon" />
              <h2 id="sky-snapshot-title">Tonight's Celestial Snapshot</h2>
            </div>
            <span className="sky-live-badge">Local sky preview</span>
          </div>

          <div className="sky-snapshot-grid">
            <div className="sky-metric-item">
              <span className="sky-metric-emoji">{moonInfo.emoji}</span>
              <div>
                <strong>{moonInfo.phaseName}</strong>
                <span>{moonInfo.illumination}% Surface Illumination</span>
              </div>
            </div>

            <div className="sky-metric-separator" />

            <div className="sky-metric-item">
              <span className="sky-metric-label">Observation planning:</span>
              <div>
              <strong>Check the Sky Map</strong>
              <span>Conditions vary by date and location</span>
              </div>
            </div>

            <div className="sky-metric-separator" />

            <div className="sky-metric-item">
              <span className="sky-metric-label">Explore the sky:</span>
              <div className="sky-targets-list">
              <span className="target-pill">Planets</span>
              <span className="target-pill">Constellations</span>
              <span className="target-pill">Deep-sky objects</span>
              </div>
            </div>

            <div className="sky-metric-action">
              <button className="btn-sky-shortcut" onClick={() => setActivePage('skymap')}>
                <span>Live Sky Map</span> <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship ACI Events Showcase */}
      <section className="dashboard-aci-events" aria-labelledby="dashboard-aci-events-title">
        <div className="dashboard-aci-events-heading">
          <div>
            <span className="dashboard-club-kicker">SIGNATURE EXPERIENCES</span>
            <h2 id="dashboard-aci-events-title">Three ways to explore with ACI</h2>
          </div>
          <button className="dashboard-events-link" onClick={() => setActivePage('events')}>
            View Event Timeline <ArrowRight size={16} />
          </button>
        </div>
        <div className="dashboard-aci-event-grid">
          {ACI_EVENTS.map((event) => (
            <article className="dashboard-aci-event" key={event.id}>
              <div className="dashboard-aci-event-image">
                <img src={event.image} alt={event.title} loading="lazy" />
                <span className="event-badge">{event.category}</span>
              </div>
              <div className="dashboard-aci-event-copy">
                <h3>{event.title}</h3>
                <p>{event.description?.length > 100 ? `${event.description.slice(0, 100)}…` : event.description}</p>
                <button className="dashboard-event-detail" onClick={() => setActivePage('events')}>
                  Learn more <ArrowRight size={15} />
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
              <span style={{ width: '7px', height: '7px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
              Live Telemetry Feed
            </span>
          </div>

          <div className="magazine-grid">
            {loadingNews ? (
              <div className="loader" />
            ) : errorNews ? (
              <div className="news-error-box">
                <p style={{ color: 'var(--text-secondary)' }}>
                  Space telemetry news feed is syncing. Check back shortly.
                </p>
                <button className="btn-more" onClick={() => setActivePage('magazine')}>
                  Browse Magazine Archive →
                </button>
              </div>
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
                        <span>{item.news_site || 'Space Agency'}</span> • {formattedDate}
                      </div>
                      <h3 className="mag-title">{item.title}</h3>
                      <p className="mag-excerpt">
                        {item.summary || item.description || 'Discover the latest astronomy breakthrough...'}
                      </p>
                      <div className="mag-read-more">
                        <span>Read original dispatch</span>
                        <ExternalLink size={13} />
                      </div>
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
              <h3 className="widget-title" style={{ margin: 0 }}>Next Expedition</h3>
              <button
                className="btn-more"
                onClick={() => setActivePage('events')}
                style={{ fontSize: '12px', color: 'var(--accent)' }}
              >
                All Events →
              </button>
            </div>
            <div>
              {widgetEvents.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No events scheduled yet.</p>
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
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No workshops scheduled yet.</p>
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

          {/* Arcade Challenge Spotlight */}
          <div className="widget-box arcade-spotlight-box">
            <div className="arcade-spotlight-header">
              <Gamepad2 size={20} className="arcade-icon" />
              <div>
                <h3 className="widget-title" style={{ margin: 0 }}>Space Arcade</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Meteor Dash & Orbit Match</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '10px 0 14px' }}>
              Test your reaction time piloting a probe through the asteroid belt or race against the clock in planetary matching.
            </p>
            <button
              className="btn-arcade-play"
              onClick={() => setActivePage('astrogames')}
            >
              <Sparkles size={14} /> <span>Play in Arcade</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
