import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ACI_EVENTS } from '../services/api';
import './Landing.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* Show confirmed dates only when the club has verified the exact day. */
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
    title: 'Talks and trainings',
    text: 'Sessions on every corner of astronomy, with online talks from well-known names in the field when we can get them.',
  },
  {
    title: 'Build workshops',
    text: 'We make detailed models of planets and telescopes. They double as teaching tools that make complex cosmic phenomena easier to grasp.',
  },
  {
    title: 'Collective research',
    text: 'We pick a topic, dig deep, and each member shares what they found until the club has one complete presentation.',
  },
];

const EXTRAS = [
  { title: 'Screenings', text: 'Astronomy videos and documentaries, such as the TV series Cosmos.' },
  { title: 'Quizzes and games', text: 'Played around the stands in the hall, with prizes for the winners.' },
  { title: 'School visits', text: 'Interactive stands and simple explanations that introduce primary school children to astronomy.' },
  { title: 'Camping nights', text: 'Occasional trips away from the city lights for sky observation and training sessions.' },
];

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const Landing = ({ setActivePage }) => (
  <main className="landing-page">
    <header className="landing-header">
      <button className="landing-brand" onClick={() => setActivePage('landing')} aria-label="Astro Club INSAT home">
        <span className="landing-brand-mark"><img src="/profile.png" alt="Astro Club INSAT emblem" /></span>
        <span><strong>ACI</strong><small>Astro Club INSAT</small></span>
      </button>
      <nav className="landing-nav" aria-label="Main navigation">
        <button className="landing-nav-link" onClick={() => scrollToId('landing-about')}>About</button>
        <button className="landing-nav-link" onClick={() => setActivePage('events')}>Events</button>
        <button className="landing-nav-link" onClick={() => setActivePage('committee')}>Committee</button>
        <button className="landing-sign-in" onClick={() => setActivePage('login')}>Sign in <ArrowUpRight size={15} /></button>
      </nav>
    </header>

    {/* Hero */}
    <section className="landing-hero" aria-labelledby="landing-title">
      <img
        className="landing-hero-image"
        src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=90"
        alt="A luminous nebula in deep space"
      />
      <div className="landing-hero-shade" />
      <div className="landing-hero-copy">
        <p className="landing-overline">INSAT, University of Carthage</p>
        <h1 id="landing-title">Astro Club<br />INSAT</h1>
        <p className="landing-intro">
          Engineering students exploring the universe in every form, from cosmic phenomena to modern space technology.
          Curious beginners are welcome.
        </p>
        <div className="landing-actions">
          <button className="landing-primary-action" onClick={() => setActivePage('events')}>Explore events <ArrowRight size={16} /></button>
          <button className="landing-secondary-action" onClick={() => setActivePage('login')}>Join the club</button>
        </div>
      </div>
      <button className="landing-scroll-cue" onClick={() => scrollToId('landing-about')} aria-label="Scroll to learn about the club">
        <span>About the club</span><ArrowDown size={16} />
      </button>
    </section>

    {/* About */}
    <section className="landing-about" id="landing-about" aria-labelledby="landing-about-title">
      <h2 id="landing-about-title">Theory and practice, from the stars to the rockets.</h2>
      <div className="landing-about-text">
        <p>
          ACI brings together people passionate about astronomy, astrophysics and space technology. We deepen what we know
          about the universe by pairing theory with hands-on work.
        </p>
        <p>
          It is a place to learn, share and grow in a friendly, collaborative atmosphere. Whether you are fascinated by
          stars, the mysteries of astrophysics, or rockets and satellites, or you are simply curious, we will walk you
          through your first steps.
        </p>
      </div>
    </section>

    {/* What we do */}
    <section className="landing-axes" aria-labelledby="landing-axes-title">
      <h2 id="landing-axes-title" className="landing-section-title">What we do</h2>
      <ul className="landing-axes-list">
        {AXES.map((axis) => (
          <li key={axis.title} className="landing-axis">
            <h3>{axis.title}</h3>
            <p>{axis.text}</p>
          </li>
        ))}
      </ul>
    </section>

    {/* Events */}
    <section className="landing-events" id="landing-events" aria-labelledby="landing-events-title">
      <div className="landing-events-heading">
        <div>
          <h2 id="landing-events-title" className="landing-section-title">Gather under the stars</h2>
          <p className="landing-events-note">Season windows are listed now; exact event days will be posted once confirmed.</p>
        </div>
        <button className="landing-all-events" onClick={() => setActivePage('events')}>All events <ArrowUpRight size={16} /></button>
      </div>
      <div className="landing-event-grid">
        {ACI_EVENTS.map((event, index) => {
          const dateText = getDateText(event);
          return (
            <button className="landing-event" key={event.id} onClick={() => setActivePage('events')}>
              <span className="landing-event-image"><img src={event.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} /></span>
              <span className="landing-event-meta">
                <span className={!event.dateConfirmed ? 'is-tba' : ''}>{dateText}</span>
                {event.category && <><i /> {event.category}</>}
              </span>
              <strong>{event.title}</strong>
              <span className="landing-event-arrow"><ArrowUpRight size={17} /></span>
            </button>
          );
        })}
      </div>
    </section>

    {/* Beyond the main events */}
    <section className="landing-extras" aria-labelledby="landing-extras-title">
      <h2 id="landing-extras-title" className="landing-section-title">Between the big nights</h2>
      <dl className="landing-extras-list">
        {EXTRAS.map((item) => (
          <div key={item.title} className="landing-extra">
            <dt>{item.title}</dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
    </section>

    {/* Closing */}
    <section className="landing-closing" aria-labelledby="landing-closing-title">
      <h2 id="landing-closing-title">More than a club: a launch platform for exploration, creation and innovation.</h2>
      <p>We are looking forward to welcoming new members who want to explore the wonders of the universe with us.</p>
      <button className="landing-primary-action" onClick={() => setActivePage('login')}>Join the club <ArrowRight size={16} /></button>
    </section>

    <footer className="landing-footer"><span>ASTRO CLUB INSAT</span><span>Look up. Find your people.</span></footer>
  </main>
);

export default Landing;