import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Gamepad2, Sparkles, Trophy, XCircle } from 'lucide-react';

const question = (text, answer, options) => ({ question: text, answer, options: [answer, ...options] });

// The bank is intentionally local and stable: every round uses one question
// from each tier, so a round always climbs from warm-up to expert.
const quizBank = {
  easy: [
    question('Which planet is known as the Red Planet?', 'Mars', ['Venus', 'Mercury', 'Jupiter']),
    question('What is the closest star to Earth?', 'The Sun', ['Sirius', 'Proxima Centauri', 'Alpha Centauri']),
    question('How many planets are in our solar system?', '8', ['7', '9', '10']),
    question('What galaxy do we live in?', 'The Milky Way', ['Andromeda', 'Triangulum', 'Whirlpool']),
    question('Which planet has the most prominent ring system?', 'Saturn', ['Jupiter', 'Uranus', 'Neptune']),
    question('Which planet is the largest in our solar system?', 'Jupiter', ['Saturn', 'Uranus', 'Neptune']),
    question("What is Earth's natural satellite?", 'The Moon', ['Titan', 'Europa', 'Phobos']),
    question('What is the brightest planet in the night sky?', 'Venus', ['Jupiter', 'Mars', 'Sirius']),
    question('What force keeps planets in orbit?', 'Gravity', ['Magnetism', 'Friction', 'Nuclear force']),
    question('What is the Sun made of mostly?', 'Hydrogen and helium', ['Oxygen and carbon', 'Iron and nickel', 'Methane and ammonia']),
    question('Which planet is smallest?', 'Mercury', ['Mars', 'Venus', 'Earth']),
    question('What type of galaxy is the Milky Way?', 'Spiral', ['Elliptical', 'Irregular', 'Ring']),
    question('Which planet is famous for its Great Red Spot?', 'Jupiter', ['Mars', 'Saturn', 'Neptune']),
    question('What do we call a rocky body orbiting the Sun?', 'Asteroid', ['Comet', 'Meteorite', 'Dwarf planet']),
    question('What is a shooting star actually?', 'A meteoroid burning in the atmosphere', ['A piece of a star', 'A comet fragment', 'Solar debris']),
    question('Which planet spins on its side?', 'Uranus', ['Saturn', 'Neptune', 'Jupiter']),
    question('What is Earth’s star called?', 'The Sun', ['Solara', 'Sirius', 'Helios']),
    question('Which planet is closest to the Sun?', 'Mercury', ['Venus', 'Earth', 'Mars']),
    question('What is a group of stars forming a pattern called?', 'Constellation', ['Galaxy', 'Nebula', 'Cluster']),
    question('Which planet is famous for its blue color?', 'Neptune', ['Mercury', 'Mars', 'Venus']),
    question('What is the name of our natural satellite?', 'The Moon', ['Luna II', 'Selene Prime', 'Titan']),
    question('What is a space rock that reaches the ground called?', 'Meteorite', ['Meteoroid', 'Meteor', 'Asteroid']),
    question('Which object is at the center of our solar system?', 'The Sun', ['Earth', 'Jupiter', 'The Moon']),
  ],
  medium: [
    question('Which moon of Saturn has a thick nitrogen atmosphere?', 'Titan', ['Enceladus', 'Mimas', 'Iapetus']),
    question('What is the point in an orbit closest to the Sun?', 'Perihelion', ['Aphelion', 'Zenith', 'Apogee']),
    question('Which mission first landed humans on the Moon?', 'Apollo 11', ['Apollo 8', 'Gemini 4', 'Voyager 1']),
    question('Which dwarf planet was reclassified in 2006?', 'Pluto', ['Ceres', 'Eris', 'Haumea']),
    question('What icy region lies beyond Neptune?', 'Kuiper Belt', ['Oort Cloud', 'Asteroid Belt', 'Heliosphere']),
    question('What is the Sun’s approximate surface temperature?', '5,500°C', ['1,000°C', '10,000°C', '50,000°C']),
    question("What is Mars's largest volcano?", 'Olympus Mons', ['Mauna Loa', 'Tharsis', 'Elysium Mons']),
    question('Which moon of Jupiter may have a subsurface ocean?', 'Europa', ['Io', 'Callisto', 'Ganymede']),
    question('What cloud of gas and dust forms new stars?', 'Nebula', ['Quasar', 'Pulsar', 'Nova']),
    question('How long does sunlight take to reach Earth?', 'About 8 minutes', ['About 8 seconds', 'About 8 hours', 'About 8 days']),
    question('What was the first artificial satellite?', 'Sputnik 1', ['Explorer 1', 'Vostok 1', 'Luna 1']),
    question('Which telescope launched in 1990 transformed astronomy?', 'Hubble Space Telescope', ['James Webb Telescope', 'Chandra X-ray', 'Spitzer Space Telescope']),
    question('What occurs when the Moon passes between Earth and the Sun?', 'Solar eclipse', ['Lunar eclipse', 'Transit', 'Occultation']),
    question('What is the asteroid belt mostly made of?', 'Rocky debris', ['Ice and frozen gases', 'Pure iron', 'Cometary dust']),
    question('What is the term for a planet’s path around a star?', 'Orbit', ['Axis', 'Rotation', 'Trajectory line']),
    question('Which planet has the fastest winds?', 'Neptune', ['Earth', 'Mars', 'Jupiter']),
    question('What is the name of the first human-made object in space?', 'V-2 rocket', ['Sputnik 1', 'Apollo 1', 'Hubble']),
    question('Which planet has a day longer than its year?', 'Venus', ['Mercury', 'Mars', 'Neptune']),
    question('What does a light-year measure?', 'Distance', ['Time', 'Brightness', 'Mass']),
    question('Which moon is the most volcanically active body?', 'Io', ['Europa', 'Titan', 'Triton']),
    question('What is the boundary around a black hole beyond which light cannot escape?', 'Event horizon', ['Singularity', 'Accretion ring', 'Roche limit']),
    question('Which planet has the most moons in the solar system?', 'Saturn', ['Jupiter', 'Uranus', 'Neptune']),
    question('What kind of object is Halley’s famous visitor?', 'Comet', ['Asteroid', 'Pulsar', 'Nebula']),
  ],
  hard: [
    question('What is the Chandrasekhar limit approximately?', '1.4 solar masses', ['3.2 solar masses', '0.8 solar masses', '5.6 solar masses']),
    question('Where do most long-period comets originate?', 'The Oort Cloud', ['The Kuiper Belt', 'The Asteroid Belt', 'The Heliosphere']),
    question('What is a star’s total energy output per second called?', 'Luminosity', ['Magnitude', 'Flux density', 'Albedo']),
    question('Which mission first soft-landed on a comet?', 'Rosetta/Philae', ['Stardust', 'Deep Impact', 'OSIRIS-REx']),
    question('How do stars fuse hydrogen into helium?', 'Nuclear fusion', ['Nuclear fission', 'Photodissociation', 'Radioactive decay']),
    question('What can form when a massive star collapses?', 'A neutron star or black hole', ['A white dwarf', 'A red giant', 'A planetary nebula']),
    question('What does the Hertzsprung-Russell diagram classify?', 'Stars by luminosity and temperature', ['Galaxies by size', 'Planets by mass', 'Nebulae by composition']),
    question('What does redshift usually indicate about a galaxy?', 'It is moving away from us', ['It is moving toward us', 'It spins faster', 'It contains more red stars']),
    question('Which planet rotates fastest?', 'Jupiter', ['Saturn', 'Neptune', 'Uranus']),
    question('What is a comet nucleus primarily made of?', 'Ice, dust, and rock', ['Iron and silicate', 'Liquid hydrogen', 'Carbon dioxide only']),
    question('What balances gravity inside a main-sequence star?', 'Pressure from nuclear energy', ['Magnetic force', 'Centrifugal force', 'Electromagnetic repulsion']),
    question('What was the first confirmed exoplanet around a Sun-like star?', '51 Pegasi b', ['Kepler-22b', 'HD 209458 b', 'Tau Boötis b']),
    question('Which observatory detects gravitational waves?', 'LIGO', ['Hubble', 'Chandra', 'James Webb']),
    question('What is another name for a star’s habitable zone?', 'Goldilocks zone', ['Life Belt', 'Frost Line', 'Roche Zone']),
    question('Which element was discovered in the Sun before Earth?', 'Helium', ['Hydrogen', 'Neon', 'Carbon']),
    question('What is the boundary where the solar wind slows sharply?', 'Termination shock', ['Magnetopause', 'Photon sphere', 'Accretion front']),
    question('What is a pulsar?', 'A rotating neutron star', ['A young planet', 'A quiet white dwarf', 'A type of nebula']),
    question('What does stellar parallax measure?', 'Distance to nearby stars', ['Star temperature', 'Galaxy age', 'Planet mass']),
    question('What is the main sequence on an H-R diagram?', 'The band where stars spend most of their lives', ['A galaxy type', 'A comet path', 'A telescope filter']),
    question('What is the Roche limit about?', 'Tidal disintegration of an orbiting body', ['Escape velocity', 'A planet’s climate', 'A moon’s rotation']),
    question('What is an accretion disk?', 'Hot matter spiraling onto a massive object', ['A ring of asteroids', 'A galaxy’s edge', 'A planet’s atmosphere']),
    question('What is the cosmic distance ladder used to estimate?', 'Distances across the universe', ['Star composition', 'Black hole spin', 'Solar wind speed']),
  ],
  expert: [
    question('What is the approximate mass of Sagittarius A*?', '4.3 million solar masses', ['4.3 thousand', '4.3 billion', '430 solar masses']),
    question('Which spacecraft first entered interstellar space?', 'Voyager 1', ['Voyager 2', 'Pioneer 10', 'New Horizons']),
    question('What causes pulsars to emit regular pulses?', 'Rapid rotation and a strong magnetic field', ['Core oscillation', 'Binary interaction', 'Accretion turbulence']),
    question('What is the Schwarzschild radius?', 'The radius at which an object becomes a black hole', ['Equatorial circumference', 'Roche distance', 'Event horizon temperature']),
    question('Which supernova occurs when a white dwarf reaches a critical mass?', 'Type Ia', ['Type II', 'Type Ib', 'Type Ic']),
    question('What is Jeans instability related to?', 'A gas cloud collapsing to form a star', ['A supernova explosion', 'A galaxy merger', 'A neutron star pulse']),
    question('The cosmic microwave background is a remnant of what?', 'The Big Bang', ['The first supernova', 'Quasar formation', 'A galaxy merger']),
    question('What is the approximate age of the universe?', '13.8 billion years', ['4.5 billion years', '100 billion years', '1 trillion years']),
    question('Which telescope launched in 2021 observes mainly in infrared?', 'James Webb Space Telescope', ['Hubble', 'Chandra', 'TESS']),
    question('What process converts four hydrogen nuclei into helium?', 'Proton-proton chain', ['CNO cycle', 'Triple-alpha process', 'Fission chain']),
    question('Which Neptune moon has a retrograde orbit?', 'Triton', ['Proteus', 'Nereid', 'Despina']),
    question('What does dark energy appear to cause?', 'Accelerating expansion of the universe', ['Galaxy formation', 'Black hole growth', 'Pulsar emissions']),
    question('What is frame dragging?', 'Spacetime being twisted by a rotating mass', ['Light bending in glass', 'A star losing mass', 'A comet tail effect']),
    question('What is a magnetar?', 'A neutron star with an extreme magnetic field', ['A magnetic planet', 'A star-forming nebula', 'A binary asteroid']),
    question('What is the cosmic neutrino background?', 'Relic neutrinos from the early universe', ['Neutrinos from the Sun only', 'A black hole wind', 'A supernova remnant']),
    question('What is baryon acoustic oscillation used to probe?', 'The expansion history of the universe', ['Planet interiors', 'Stellar rotation', 'Comet chemistry']),
    question('What is the Tolman-Oppenheimer-Volkoff limit about?', 'The maximum mass of a neutron star', ['A galaxy’s radius', 'A comet’s period', 'A star’s color']),
    question('What is gravitational lensing?', 'Mass bending the path of light', ['A telescope magnifying itself', 'A star emitting jets', 'A planet reflecting light']),
    question('What is the CNO cycle?', 'Hydrogen fusion catalyzed by carbon, nitrogen, and oxygen', ['A galaxy orbit', 'A black hole cycle', 'A comet’s ice cycle']),
    question('What is a quasar powered by?', 'An active supermassive black hole', ['A newborn planet', 'A white dwarf cooling', 'A dark nebula']),
    question('What is cosmic inflation?', 'A brief period of extremely rapid early expansion', ['A star swelling', 'A galaxy collision', 'A planet warming']),
    question('What is the event horizon of a rotating black hole called?', 'The Kerr horizon', ['The Hubble shell', 'The Roche surface', 'The Newton ring']),
  ],
};

const tiers = ['easy', 'medium', 'hard', 'expert'];
const QUIZ_QUESTION_COUNT = 5;
const QUIZ_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert', 'expert'];
const tierLabels = { easy: 'Warm-up', medium: 'Explorer', hard: 'Scientist', expert: 'Cosmologist' };
const tierColors = { easy: '#68d391', medium: '#63b3ed', hard: '#f6ad55', expert: '#fc8181' };

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const playerName = (user, profile) => profile?.name || profile?.username || user?.name || user?.email?.split('@')[0] || 'Astronaut';
const formatElapsed = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://astro-web-frontend.onrender.com');

const AstroGames = ({ user, profile, setActivePage }) => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState({ scores: [], winners: [] });
  const [saveState, setSaveState] = useState('idle');
  const [quizName, setQuizName] = useState(() => playerName(user, profile));

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/astrogames/quiz-results`);
      if (!response.ok) throw new Error('Leaderboard unavailable');
      const payload = await response.json();
      setLeaderboard({
        scores: Array.isArray(payload?.scores) ? payload.scores : [],
        winners: Array.isArray(payload?.winners) ? payload.winners : [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadLeaderboard(); }, []);

  const startQuiz = () => {
    if (!quizName.trim()) return;
    setQuestions(QUIZ_DIFFICULTIES.map((tier) => {
      const selected = shuffle(quizBank[tier])[0];
      return { ...selected, tier, options: shuffle(selected.options) };
    }));
    setCurrent(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setElapsedSeconds(0);
    setStartedAt(Date.now());
    setFinished(false);
    setSaveState('idle');
  };

  const result = useMemo(() => {
    const score = answers.reduce((sum, answer, index) => sum + (answer === questions[index]?.answer ? (index + 1) * 25 : 0), 0);
    return { score, correct: answers.filter((answer, index) => answer === questions[index]?.answer).length };
  }, [answers, questions]);

  useEffect(() => {
    if (!startedAt || finished) return undefined;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, finished]);

  const answerQuestion = (answer) => {
    if (finished || selectedAnswer || !questions[current]) return;
    setSelectedAnswer(answer);
    window.setTimeout(() => advanceQuestion(answer), 1500);
  };

  const advanceQuestion = async (answerOverride = null) => {
    const answerToSave = answerOverride || selectedAnswer;
    if (!answerToSave || !questions[current]) return;
    const nextAnswers = [...answers, answerToSave];
    setAnswers(nextAnswers);
    setSelectedAnswer(null);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      return;
    }
    setFinished(true);
    const correct = nextAnswers.filter((entry, index) => entry === questions[index].answer).length;
    const score = nextAnswers.reduce((sum, entry, index) => sum + (entry === questions[index].answer ? (index + 1) * 25 : 0), 0);
    setSaveState('saving');
    try {
      const response = await fetch(`${API_BASE}/api/astrogames/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: quizName.trim(), score, total: 375, correct, userId: user?.id, userEmail: user?.email || profile?.email }),
      });
      if (!response.ok) throw new Error('Could not save result');
      setSaveState('saved');
      await loadLeaderboard();
    } catch (error) {
      console.error(error);
      setSaveState('failed');
    }
  };

  const reset = () => { setQuestions([]); setAnswers([]); setSelectedAnswer(null); setCurrent(0); setFinished(false); setStartedAt(null); setElapsedSeconds(0); setSaveState('idle'); };
  const activeQuestion = questions[current];
  const displayScore = finished ? result.score : answers.reduce((sum, answer, index) => sum + (answer === questions[index]?.answer ? (index + 1) * 25 : 0), 0);

  return (
    <div className={`page-content astrogames-page ${questions.length && !finished ? 'quiz-active' : ''}`}>
      {!questions.length && <section className="hero astrogames-hero">
        <div className="hero-content">
          <div className="hero-tag"><Sparkles size={13} /> Astro Quiz</div>
          <h1 className="hero-title">Five questions. One flight path.</h1>
          <p className="hero-sub">A focused astronomy quiz that climbs from warm-up facts to cosmologist-level ideas. No countdowns. No waiting between answers.</p>
          <div className="hero-actions">
            {setActivePage && <button className="btn btn-secondary" onClick={() => setActivePage('dashboard')}><ArrowLeft size={15} /> Dashboard</button>}
            <button className="btn btn-primary" onClick={() => document.getElementById('astro-player-name')?.focus()}><Gamepad2 size={15} /> Enter your name</button>
          </div>
        </div>
        <div className="orbit-container"><div className="orbit-center" /><div className="orbit-ring ring-1" /><div className="orbit-ring ring-2" /><div className="orbit-ring ring-3" /></div>
      </section>}

      {!questions.length && (
        <section className="astro-quiz-intro">
          <div><span className="astro-kicker">90 questions in the bank</span><h2>A clean run through the cosmos</h2><p>Each round follows the same five-step difficulty path: Easy, Medium, Hard, Expert, Expert. A perfect run is worth 375 points and earns a place in the winners table.</p><label className="astro-name-field" htmlFor="astro-player-name"><span>Your name</span><input id="astro-player-name" value={quizName} onChange={(event) => setQuizName(event.target.value)} maxLength={80} placeholder="Enter your name" autoComplete="name" /></label><button className="btn btn-primary astro-start-button" onClick={startQuiz} disabled={!quizName.trim()}><Gamepad2 size={15} /> Start quiz</button></div>
          <div className="astro-tier-list">{QUIZ_DIFFICULTIES.map((tier, index) => <div className="astro-tier" key={`${tier}-${index}`}><span style={{ background: tierColors[tier] }}>{index + 1}</span><div><strong>Question {index + 1}: {tierLabels[tier]}</strong><small>{quizBank[tier].length} questions available</small></div></div>)}</div>
        </section>
      )}

      {activeQuestion && !finished && (
        <section className="astro-quiz-panel">
          <div className="astro-quiz-topline"><div><span className="astro-difficulty" style={{ color: tierColors[activeQuestion.tier], borderColor: tierColors[activeQuestion.tier] }}>{tierLabels[activeQuestion.tier]}</span><span className="astro-question-count">Question {current + 1} of {QUIZ_QUESTION_COUNT}</span></div><div className="astro-timer"><small>ELAPSED</small><strong>{formatElapsed(elapsedSeconds)}</strong></div><strong className="astro-live-score">{displayScore} pts</strong></div>
          <div className="astro-progress"><span style={{ width: `${((current + 1) / QUIZ_QUESTION_COUNT) * 100}%` }} /></div>
          <h2>{activeQuestion.question}</h2>
          <div className="astro-options">{activeQuestion.options.map((option, index) => { const isSelected = selectedAnswer === option; const isCorrect = option === activeQuestion.answer; const showResult = Boolean(selectedAnswer); return <button className={`astro-option ${showResult && isCorrect ? 'correct' : ''} ${showResult && isSelected && !isCorrect ? 'wrong' : ''} ${isSelected ? 'selected' : ''}`} key={option} onClick={() => answerQuestion(option)} disabled={Boolean(selectedAnswer)}><span>{String.fromCharCode(65 + index)}</span>{option}{showResult && isCorrect && <CheckCircle2 size={19} />}{showResult && isSelected && !isCorrect && <XCircle size={19} />}</button>; })}</div>
          {selectedAnswer && <div className={`astro-answer-review ${selectedAnswer === activeQuestion.answer ? 'is-correct' : 'is-wrong'}`}><div><small>Your choice</small><strong>{selectedAnswer === activeQuestion.answer ? 'Correct' : 'Wrong'}: {selectedAnswer}</strong></div><div><small>Actual solution</small><strong>{activeQuestion.answer}</strong></div><div className="astro-next-countdown">Next question in <strong>1.5 seconds</strong></div></div>}
          <button className="btn btn-secondary astro-exit" onClick={reset}><ArrowLeft size={15} /> Exit quiz</button>
        </section>
      )}

      {finished && (
        <section className="astro-result"><div className="astro-result-icon">{result.correct === QUIZ_QUESTION_COUNT ? <Trophy size={34} /> : <CheckCircle2 size={34} />}</div><span className="astro-kicker">{result.correct === QUIZ_QUESTION_COUNT ? 'Perfect flight' : 'Mission complete'}</span><h2>{result.score} <small>/ 375 points</small></h2><p>{result.correct}/{QUIZ_QUESTION_COUNT} correct. {result.correct === QUIZ_QUESTION_COUNT ? 'You are this round’s perfect-score winner.' : 'The next orbit is waiting.'}</p><div className="astro-save-status">{saveState === 'saving' ? 'Saving to the database...' : saveState === 'saved' ? 'Saved to the database' : saveState === 'failed' ? 'Could not reach the database' : ''}</div><button className="btn btn-primary" onClick={startQuiz}><Gamepad2 size={15} /> Play again</button></section>
      )}

      {(!questions.length || finished) && <section className="astro-leaderboards"><div><div className="astro-section-heading"><Trophy size={18} /><h2>High scores</h2></div>{leaderboard.scores.length ? leaderboard.scores.map((entry, index) => <div className="astro-score-row" key={entry.id || `${entry.name}-${index}`}><span>#{index + 1}</span><strong>{entry.name}</strong><b>{entry.score} pts</b></div>) : <p className="astro-empty">Your first run will appear here.</p>}</div><div><div className="astro-section-heading"><CheckCircle2 size={18} /><h2>Perfect-score winners</h2></div>{leaderboard.winners.length ? leaderboard.winners.map((entry, index) => <div className="astro-score-row" key={entry.id || `${entry.name}-${index}`}><span>#{index + 1}</span><strong>{entry.name}</strong><b>{entry.score} pts</b></div>) : <p className="astro-empty">A perfect 5/5 run earns this badge.</p>}</div></section>}
    </div>
  );
};

export default AstroGames;