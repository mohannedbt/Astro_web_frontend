import { ArrowLeft, ArrowRight, ArrowUpRight, Eye, LogIn } from 'lucide-react';
import { ACI_COMMITTEE } from '../services/api';
import './Committee.css';

const Committee = ({ setActivePage, user }) => (
  <main className="committee-page">
    <header className="committee-header">
      <button className="committee-brand" onClick={() => setActivePage('landing')} aria-label="Back to Astro Club INSAT home">
        <img src="/profile.png" alt="Astro Club INSAT emblem" />
        <span><strong>Astro Club INSAT</strong><small>The first club at INSAT dedicated to astronomy</small></span>
      </button>
      <nav aria-label="Committee page navigation">
        <button type="button" onClick={() => setActivePage('landing')}><ArrowLeft size={15} /> Home</button>
        <button type="button" onClick={() => setActivePage('events')}>Events <ArrowUpRight size={15} /></button>
        {!user ? (
        <button className="committee-sign-in" type="button" onClick={() => setActivePage('login')}>
            <LogIn size={14} /> Sign In
          </button>
        ) : (
        <button type="button" onClick={() => setActivePage('dashboard')}>Dashboard <ArrowUpRight size={15} /></button>
        )}
      </nav>
    </header>

    {!user && (
      <div style={{
        margin: '0 auto 24px',
        maxWidth: '1200px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: 'rgba(125, 211, 252, 0.08)',
        border: '1px solid rgba(125, 211, 252, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent)', background: 'rgba(125,211,252,0.14)', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
            <Eye size={14} /> Guest Observer Pass Active
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            You are browsing our executive board directory in public guest observer mode.
          </span>
        </div>
        <button
          onClick={() => setActivePage('register')}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '6px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Join Astro Club INSAT</span> <ArrowRight size={14} />
        </button>
      </div>
    )}

    <section className="committee-intro" aria-labelledby="committee-title">
      <div className="committee-intro-copy">
        <span className="committee-eyebrow">THE PEOPLE BEHIND ASTRO CLUB INSAT</span>
        <h1 id="committee-title">A club is made by the people who share it.</h1>
        <p>
          The Astro Club INSAT committee brings students together to make astronomy welcoming, collaborative, and
          hands-on. From organizing talks and workshops to supporting projects and events, each role helps the club
          learn, create, and explore as a community.
        </p>
      </div>
      <div className="committee-emblem-wrap">
        <img src="/profile.png" alt="Astro Club INSAT official emblem" />
        <span>INSAT · UNIVERSITY OF CARTHAGE</span>
      </div>
    </section>

    <section className="committee-roster-section" aria-labelledby="committee-roster-title">
      <div className="committee-roster-heading">
        <div>
          <span className="committee-eyebrow">01 / THE TEAM</span>
          <h2 id="committee-roster-title">Committee members</h2>
        </div>
        <p>One community, many ways to contribute.</p>
      </div>
      <ol className="committee-roster">
        {ACI_COMMITTEE.map((member, index) => (
          <li key={member.role}>
            <span className="committee-number">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <span className="committee-role">{member.role}</span>
              <h3>{member.name}</h3>
            </div>
            <span className="committee-row-mark" aria-hidden="true"><ArrowRight size={17} /></span>
          </li>
        ))}
      </ol>
    </section>

    <section className="committee-join">
      <span className="committee-eyebrow">CURIOUS ABOUT THE CLUB?</span>
      <p>There is room for new questions, fresh ideas, and your own way of exploring the universe.</p>
      <button onClick={() => setActivePage('register')}>Join the club <ArrowRight size={16} /></button>
    </section>

    <footer className="committee-footer"><span>ASTRO CLUB INSAT · THE FIRST ASTRONOMY CLUB AT INSAT</span><span>INSAT · University of Carthage</span></footer>
  </main>
);

export default Committee;