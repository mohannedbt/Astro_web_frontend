import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ACI_COMMITTEE } from '../services/api';
import './Committee.css';

const Committee = ({ setActivePage }) => (
  <main className="committee-page">
    <header className="committee-header">
      <button className="committee-brand" onClick={() => setActivePage('landing')} aria-label="Back to Astro Club INSAT home">
        <img src="/profile.png" alt="Astro Club INSAT emblem" />
        <span><strong>ACI</strong><small>Astro Club INSAT</small></span>
      </button>
      <nav aria-label="Committee page navigation">
        <button onClick={() => setActivePage('landing')}><ArrowLeft size={15} /> Home</button>
        <button onClick={() => setActivePage('events')}>Events <ArrowUpRight size={15} /></button>
      </nav>
    </header>

    <section className="committee-intro" aria-labelledby="committee-title">
      <div className="committee-intro-copy">
        <span className="committee-eyebrow">THE PEOPLE BEHIND ACI</span>
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

    <footer className="committee-footer"><span>ASTRO CLUB INSAT</span><span>INSAT · University of Carthage</span></footer>
  </main>
);

export default Committee;