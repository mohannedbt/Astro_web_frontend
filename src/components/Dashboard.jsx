import React, { useState, useEffect } from 'react';
import { Radio, Newspaper, MapPin, User } from 'lucide-react';

const mockEvents = [
  { day: '15', month: 'Jul', title: 'Perseid Meteor Shower Watch', location: 'Observatory Hill' },
  { day: '22', month: 'Jul', title: 'Lunar Eclipse Tracking', location: 'Online Sync' },
  { day: '05', month: 'Aug', title: 'Saturn Opposition', location: 'Main Campus' }
];

const mockWorkshops = [
  { day: '18', month: 'Jul', title: 'Astrophotography 101', instructor: 'Dr. Aris Thorne' },
  { day: '25', month: 'Jul', title: 'Telescope Calibration', instructor: 'Sarah Jenkins' }
];

const Dashboard = ({ setActivePage }) => {
  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState(false);

  useEffect(() => {
    const fetchDiscoveries = async () => {
      try {
        const response = await fetch('https://api.spaceflightnewsapi.net/v4/articles?limit=3');
        const data = await response.json();
        setArticles(data.results || []);
      } catch (error) {
        console.error('Failed to fetch live space news:', error);
        setErrorNews(true);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchDiscoveries();
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
                const dateObj = new Date(item.published_at);
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
                        src={item.image_url}
                        alt={item.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="mag-content">
                      <div className="mag-meta"><span>{item.news_site}</span> • {formattedDate}</div>
                      <h3 className="mag-title">{item.title}</h3>
                      <p className="mag-excerpt">{item.summary}</p>
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
              {mockEvents.map((ev, index) => (
                <div className="list-item" key={index}>
                  <div className="date-badge">
                    <div className="date-d">{ev.day}</div>
                    <div className="date-m">{ev.month}</div>
                  </div>
                  <div className="item-info">
                    <h4>{ev.title}</h4>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {ev.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="widget-box">
            <h3 className="widget-title">Scheduled Workshops</h3>
            <div>
              {mockWorkshops.map((ws, index) => (
                <div className="list-item" key={index}>
                  <div className="date-badge">
                    <div className="date-d">{ws.day}</div>
                    <div className="date-m">{ws.month}</div>
                  </div>
                  <div className="item-info">
                    <h4>{ws.title}</h4>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> by {ws.instructor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
