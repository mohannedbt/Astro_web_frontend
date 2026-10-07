import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Map,
  BookOpen,
  Gamepad2,
  Sparkles,
  ChevronDown,
  Users,
  Calendar,
  Layers,
  Star,
  LogIn,
} from 'lucide-react';
import { ACI_EVENTS } from '../services/api';
import './Landing.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getDateText = (ev) => {
  if (ev.dateConfirmed) {
    const d = new Date(ev.startAt || ev.date);
    if (!Number.isNaN(d.getTime())) return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  if (ev.season) return ev.season;
  const idx = typeof ev.month === 'number'
    ? ev.month - 1
    : MONTHS.findIndex((m) => ev.month && m.toLowerCase().startsWith(String(ev.month).trim().toLowerCase().slice(0, 3)));
  return idx >= 0 && idx < 12 ? `Date TBA · ${MONTHS[idx]}` : 'Exact date to be confirmed';
};

const AXES = [
  {
    icon: Compass,
    title: 'Talks & Masterclasses',
    text: 'Sessions exploring cosmological theories, astrophysics fundamentals, and live virtual talks with space sector researchers.',
  },
  {
    icon: Layers,
    title: 'Hands-On Builds & Astrolab',
    text: 'Building scale planetarium models, calibrating equatorial telescope mounts, and mastering analog long-exposure film photography.',
  },
  {
    icon: Star,
    title: 'Collaborative Research',
    text: 'Teams pick an astronomical topic, research deep-sky mechanics, and combine their findings into comprehensive community presentations.',
  },
  {
    icon: Users,
    title: 'Field Stargazing Vigils',
    text: 'Overnight expeditions away from urban light pollution to Bortle Class 2 ridges for deep-sky observation and astrophotography.',
  },
];

const PORTAL_TOOLS = [
  {
    id: 'skymap',
    title: 'Live Zenith Sky Map',
    desc: 'Real-time celestial projections based on your coordinates. Track constellations, visible planets, and stellar bodies.',
    badge: 'Interactive Telemetry',
    icon: Map,
    actionText: 'Open Sky Map',
  },
  {
    id: 'magazine',
    title: 'Cosmic Chronicle',
    desc: 'Curated real-time astrophysics telemetry and breaking discoveries sourced directly from NASA, ESA, and international observatories.',
    badge: 'Live Feed',
    icon: BookOpen,
    actionText: 'Read Magazine',
  },
  {
    id: 'astrogames',
    title: 'Astro Space Arcade',
    desc: 'Test your reflexes and astronomical knowledge in Meteor Dash, Orbit Match, and the timed Cosmic Quiz.',
    badge: 'Retro Arcade',
    icon: Gamepad2,
    actionText: 'Play Games',
  },
  {
    id: 'workshops',
    title: 'Workshops & Lab Slides',
    desc: 'Browse upcoming technical workshops, download instructor slide decks, and master planetary model engineering.',
    badge: 'Hands-On',
    icon: Layers,
    actionText: 'View Workshops',
  },
];

const FAQS = [
  {
    q: 'Do I need my own telescope or prior astronomy experience?',
    a: 'Not at all! ACI provides all observation equipment, including Dobsonian reflectors, equatorial trackers, binoviewers, and analog cameras. Beginners are guided from day one.',
  },
  {
    q: 'Who can join Astro Club INSAT?',
    a: 'Any university student with genuine curiosity about space! Whether you study computer science, electronics, software engineering, or preparatory sciences, there is a place for you.',
  },
  {
    q: 'How can I access the web portal if I am not a member yet?',
    a: 'Our web portal includes a full Observer Mode! You can immediately use the live Sky Map, read the Cosmic Chronicle, and play arcade games as a guest without creating an account.',
  },
  {
    q: 'How frequently do night observation vigils take place?',
    a: 'We host campus telescope observation stands during major celestial milestones (eclipses, planetary oppositions, meteor showers) and organize seasonal overnight camping trips away from city lights.',
  },
];

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const Landing = ({ setActivePage, user }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <button className="landing-brand" onClick={() => setActivePage('landing')} aria-label="Astro Club INSAT home">
          <span className="landing-brand-mark">
            <img src="/profile.png" alt="Astro Club INSAT logo" />
          </span>
          <span>
            <strong>ACI</strong>
            <small>Astro Club INSAT</small>
          </span>
        </button>

        <nav className="landing-nav" aria-label="Main navigation">
          <button className="landing-nav-link" onClick={() => scrollToId('landing-about')}>About</button>
          <button className="landing-nav-link" onClick={() => scrollToId('landing-portal')}>Features</button>
          <button className="landing-nav-link" onClick={() => setActivePage('events')}>Events</button>
          <button className="landing-nav-link" onClick={() => setActivePage('committee')}>Committee</button>
          
          <button
            className="landing-portal-link"
            onClick={() => setActivePage('dashboard')}
            title="Open the interactive club portal"
          >
            <Sparkles size={14} /> <span>Live Dashboard</span>
          </button>

          {!user ? (
            <button className="landing-sign-in" onClick={() => setActivePage('login')}>
              <span>Sign in</span> <LogIn size={14} />
            </button>
          ) : (
            <button className="landing-sign-in is-member" onClick={() => setActivePage('dashboard')}>
              <span>Portal</span> <ArrowUpRight size={14} />
            </button>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero" aria-labelledby="landing-title">
        <img
          className="landing-hero-image"
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=90"
          alt="Luminous celestial nebula in deep space"
        />
        <div className="landing-hero-shade" />

        <div className="landing-hero-copy">
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            <span>INSAT · Astronomical Observatory Station · 2026/27 Active</span>
          </div>

          <h1 id="landing-title">
            Look Up.<br />Explore Further.
          </h1>

          <p className="landing-intro">
            A community of engineering students exploring the cosmos through observational astronomy, astrophysics research,
            and space technology. Curious beginners and seasoned stargazers are equally welcome.
          </p>

          <div className="landing-actions">
            <button className="landing-primary-action" onClick={() => setActivePage('dashboard')}>
              <span>Launch Live Portal</span> <ArrowRight size={16} />
            </button>
            <button className="landing-secondary-action" onClick={() => setActivePage('events')}>
              <Calendar size={15} /> <span>Explore Events</span>
            </button>
            {!user && (
              <button className="landing-ghost-action" onClick={() => setActivePage('register')}>
                <span>Join Club</span>
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="landing-stats-bar" aria-label="Club metrics">
            <div className="landing-stat-item">
              <strong>120+</strong>
              <span>Active Stargazers</span>
            </div>
            <div className="landing-stat-separator" />
            <div className="landing-stat-item">
              <strong>15+</strong>
              <span>Annual Expeditions</span>
            </div>
            <div className="landing-stat-separator" />
            <div className="landing-stat-item">
              <strong>3</strong>
              <span>Signature Events</span>
            </div>
            <div className="landing-stat-separator" />
            <div className="landing-stat-item">
              <strong>Bortle 2</strong>
              <span>Dark Sky Access</span>
            </div>
          </div>
        </div>

        <button className="landing-scroll-cue" onClick={() => scrollToId('landing-about')} aria-label="Scroll to discover the club">
          <span>Explore ACI</span> <ArrowDown size={15} />
        </button>
      </section>

      {/* Live Portal Showcase */}
      <section className="landing-portal-preview" id="landing-portal" aria-labelledby="portal-tools-title">
        <div className="landing-portal-header">
          <span className="landing-section-kicker">INTERACTIVE PLATFORM</span>
          <h2 id="portal-tools-title" className="landing-section-title">
            The Digital Observatory
          </h2>
          <p className="landing-portal-desc">
            Explore live space tools developed for our members and public observers. No sign-in required to begin exploring.
          </p>
        </div>

        <div className="landing-tools-grid">
          {PORTAL_TOOLS.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <div className="landing-tool-card" key={tool.id}>
                <div className="landing-tool-top">
                  <div className="landing-tool-icon">
                    <IconComponent size={22} />
                  </div>
                  <span className="landing-tool-badge">{tool.badge}</span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
                <button
                  className="landing-tool-cta"
                  onClick={() => setActivePage(tool.id)}
                  aria-label={`Open ${tool.title}`}
                >
                  <span>{tool.actionText}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section className="landing-about" id="landing-about" aria-labelledby="landing-about-title">
        <div>
          <span className="landing-section-kicker">OUR MISSION</span>
          <h2 id="landing-about-title">Theory and practice, from distant stars to rockets.</h2>
        </div>
        <div className="landing-about-text">
          <p>
            ACI brings together students fascinated by astronomy, astrophysics, and aerospace technology. We deepen
            understanding of the universe by pairing academic curiosity with hands-on practice: telescope operations,
            darkroom film processing, and scientific challenges.
          </p>
          <p>
            It is a collaborative hub to learn, construct, and share in a welcoming atmosphere. Whether you are intrigued by
            orbital mechanics, stellar nucleosynthesis, or simply the beauty of a dark night sky, we guide you through your first steps.
          </p>
        </div>
      </section>

      {/* What we do */}
      <section className="landing-axes" aria-labelledby="landing-axes-title">
        <div className="landing-axes-header">
          <span className="landing-section-kicker">WHAT WE DO</span>
          <h2 id="landing-axes-title" className="landing-section-title">Club Pillars</h2>
        </div>
        <div className="landing-axes-grid">
          {AXES.map((axis) => {
            const IconComponent = axis.icon;
            return (
              <div key={axis.title} className="landing-axis-card">
                <div className="landing-axis-icon">
                  <IconComponent size={20} />
                </div>
                <h3>{axis.title}</h3>
                <p>{axis.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Events */}
      <section className="landing-events" id="landing-events" aria-labelledby="landing-events-title">
        <div className="landing-events-heading">
          <div>
            <span className="landing-section-kicker">ANNUAL HIGHLIGHTS</span>
            <h2 id="landing-events-title" className="landing-section-title">Gather under the stars</h2>
            <p className="landing-events-note">Season windows are listed now; exact event days are posted once confirmed.</p>
          </div>
          <button className="landing-all-events" onClick={() => setActivePage('events')}>
            View Full Timeline <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="landing-event-grid">
          {ACI_EVENTS.map((event, index) => {
            const dateText = getDateText(event);
            return (
              <div
                className="landing-event"
                key={event.id}
                onClick={() => setActivePage('events')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActivePage('events');
                }}
              >
                <div className="landing-event-image">
                  <img src={event.image} alt={event.title} loading={index === 0 ? 'eager' : 'lazy'} />
                  <span className="landing-event-cat-tag">{event.category}</span>
                </div>
                <div className="landing-event-body">
                  <div className="landing-event-meta">
                    <span className={!event.dateConfirmed ? 'is-tba' : ''}>{dateText}</span>
                    <span>• {event.location || 'INSAT Campus'}</span>
                  </div>
                  <strong>{event.title}</strong>
                  <p className="landing-event-brief">{event.description?.slice(0, 110)}...</p>
                  <div className="landing-event-footer">
                    <span>View details</span>
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="landing-faq-section" aria-labelledby="landing-faq-title">
        <div className="landing-faq-heading">
          <span className="landing-section-kicker">COMMUNITY & MEMBERSHIP</span>
          <h2 id="landing-faq-title" className="landing-section-title">Frequently Asked Questions</h2>
          <p>Everything you need to know about joining and taking part in ACI activities.</p>
        </div>

        <div className="landing-faq-list">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div className={`landing-faq-item ${isOpen ? 'is-open' : ''}`} key={index}>
                <button
                  className="landing-faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="landing-faq-chevron" />
                </button>
                {isOpen && (
                  <div className="landing-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="landing-closing" aria-labelledby="landing-closing-title">
        <div className="landing-closing-box">
          <span className="landing-section-kicker">READY TO LOOK UP?</span>
          <h2 id="landing-closing-title">
            A launch platform for exploration, curiosity, and scientific discovery.
          </h2>
          <p>
            Whether you want to stargaze through high-powered telescopes, publish astrophotos, or develop space
            software, your journey starts here.
          </p>
          <div className="landing-closing-actions">
            <button className="landing-primary-action" onClick={() => setActivePage('register')}>
              <span>Join Astro Club INSAT</span> <ArrowRight size={16} />
            </button>
            <button className="landing-secondary-action" onClick={() => setActivePage('dashboard')}>
              <span>Enter Observer Portal</span> <Sparkles size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <strong>ASTRO CLUB INSAT (ACI)</strong>
          <span>INSAT · National Institute of Applied Sciences and Technology · Université de Carthage</span>
        </div>
        <div className="landing-footer-motto">
          <span>Look up. Find your people.</span>
        </div>
      </footer>
    </main>
  );
};

export default Landing;