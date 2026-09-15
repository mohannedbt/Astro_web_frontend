import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Gamepad2, Trophy, XCircle } from 'lucide-react';

const question = (text, answer, options) => ({ question: text, answer, options: [answer, ...options] });

// Every question here is intentionally easy — general-knowledge space facts,
// no jargon, no niche astrophysics. Deduplicated, single tier.
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
    question('Which planet is smallest?', 'Mercury', ['Mars', 'Venus', 'Earth']),
    question('Which planet is famous for its Great Red Spot?', 'Jupiter', ['Mars', 'Saturn', 'Neptune']),
    question('What do we call a rocky body orbiting the Sun?', 'Asteroid', ['Comet', 'Meteorite', 'Dwarf planet']),
    question('What is a shooting star actually?', 'A meteoroid burning in the atmosphere', ['A piece of a star', 'A comet fragment', 'Solar debris']),
    question('Which planet spins on its side?', 'Uranus', ['Saturn', 'Neptune', 'Jupiter']),
    question('Which planet is closest to the Sun?', 'Mercury', ['Venus', 'Earth', 'Mars']),
    question('What is a group of stars forming a pattern called?', 'Constellation', ['Galaxy', 'Nebula', 'Cluster']),
    question('Which planet is famous for its blue color?', 'Neptune', ['Mercury', 'Mars', 'Venus']),
    question('What is a space rock that reaches the ground called?', 'Meteorite', ['Meteoroid', 'Meteor', 'Asteroid']),
    question('What is at the center of our solar system?', 'The Sun', ['Earth', 'Jupiter', 'The Moon']),
    question('What is the name of the space agency of the United States?', 'NASA', ['ESA', 'ROSCOSMOS', 'ISRO']),
    question('What do we call an icy object with a glowing tail?', 'Comet', ['Asteroid', 'Meteor', 'Satellite']),
    question('What is the vehicle that carries astronauts into space called?', 'Rocket', ['Glider', 'Submarine', 'Jet']),
    question('What protects astronauts when they are outside their spacecraft?', 'A space suit', ['A parachute', 'A wetsuit', 'A helmet only']),
    question('What is the name of the orbiting laboratory astronauts live on?', 'The International Space Station', ['The Mars Rover', 'The Hubble Telescope', 'Skylab 2']),
    question('What device do astronomers use to observe distant stars and planets?', 'A telescope', ['A microscope', 'A periscope', 'A compass']),
    question('What color does Earth mostly appear from space?', 'Blue', ['Green', 'Red', 'Yellow']),
    question('What do we call the Sun, planets, and moons together?', 'The Solar System', ['The Milky Way', 'The Universe', 'The Galaxy']),
    question('What is the term for one full spin of a planet on its axis?', 'A day', ['A year', 'An orbit', 'A season']),
    question('What is the term for one full trip a planet makes around the Sun?', 'A year', ['A day', 'A rotation', 'An eclipse']),
    question('What do astronauts float in while in orbit?', 'Zero gravity (weightlessness)', ['Thick fog', 'Strong wind', 'Deep water']),
  ],
};

const QUIZ_QUESTION_COUNT = 5;
const QUIZ_DIFFICULTIES = ['easy', 'easy', 'easy', 'easy', 'easy'];
const tierLabels = { easy: 'Easy' };
const tierColors = { easy: '#68d391' };

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const formatElapsed = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const timeDescription = (seconds) => {
  if (seconds <= 15) return 'Lightning fast';
  if (seconds <= 30) return 'Super speedy';
  if (seconds <= 60) return 'Nice pace';
  return 'Steady flight';
};
const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://astro-web-frontend.onrender.com');

const AstroGames = ({ user, profile, setActivePage }) => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const [quizName, setQuizName] = useState('');
  const [popup, setPopup] = useState(null); // { correct: bool, text: string }

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
    setPopup(null);
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
    const isCorrect = answer === questions[current].answer;
    setSelectedAnswer(answer);
    setPopup({ correct: isCorrect, text: isCorrect ? 'Correct!' : 'Missed it' });
    window.setTimeout(() => setPopup(null), 1100);
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
    } catch (error) {
      console.error(error);
      setSaveState('failed');
    }
  };

  const reset = () => {
    setQuestions([]);
    setAnswers([]);
    setSelectedAnswer(null);
    setCurrent(0);
    setFinished(false);
    setStartedAt(null);
    setElapsedSeconds(0);
    setSaveState('idle');
    setPopup(null);
  };

  const activeQuestion = questions[current];
  const displayCorrect = answers.filter((answer, index) => answer === questions[index]?.answer).length;
  const isWrongPick = selectedAnswer && activeQuestion && selectedAnswer !== activeQuestion.answer;

  return (
    <div className={`page-content astrogames-page ${!questions.length ? 'quiz-home' : ''} ${questions.length && !finished ? 'quiz-active' : ''}`}>
      {!questions.length && (
        <section className="astro-quiz-intro astro-quiz-start">
          <div className="astro-start-content">
            <span className="astro-kicker">Mission briefing</span>
            <h1 className="astro-hero-title">Astro Quiz</h1>
            <p>Five quick, easy questions about space. See how fast you can clear the round.</p>

            <label className="astro-name-field" htmlFor="astro-player-name">
              <span>Your name</span>
              <input
                id="astro-player-name"
                value={quizName}
                onChange={(event) => setQuizName(event.target.value)}
                maxLength={80}
                placeholder="Enter your name"
                autoComplete="name"
                onKeyDown={(event) => { if (event.key === 'Enter') startQuiz(); }}
              />
            </label>
            <button className="btn btn-primary astro-start-button" onClick={startQuiz} disabled={!quizName.trim()}>
              <Gamepad2 size={15} /> Start quiz
            </button>
            {setActivePage && (
              <button className="astro-back-link" onClick={() => setActivePage('dashboard')}>
                <ArrowLeft size={14} /> Back to dashboard
              </button>
            )}
          </div>

        </section>
      )}

      {activeQuestion && !finished && (
        <section className="astro-quiz-panel" key={current}>
          <div className="astro-quiz-topline">
            <div>
              <span className="astro-difficulty" style={{ color: tierColors[activeQuestion.tier], borderColor: tierColors[activeQuestion.tier] }}>
                {tierLabels[activeQuestion.tier]}
              </span>
              <span className="astro-question-count">Question {current + 1} of {QUIZ_QUESTION_COUNT}</span>
            </div>
            <div className="astro-timer">
              <small>ELAPSED</small>
              <strong>{formatElapsed(elapsedSeconds)}</strong>
            </div>
            <div className="astro-score-wrap">
              <strong className="astro-live-score">{displayCorrect}/{QUIZ_QUESTION_COUNT} right</strong>
              {popup && <span className={`quiz-pop ${popup.correct ? 'correct' : 'wrong'}`}>{popup.text}</span>}
            </div>
          </div>

          <div className="astro-progress">
            <span style={{ width: `${((current + 1) / QUIZ_QUESTION_COUNT) * 100}%` }} />
          </div>

          <h2>{activeQuestion.question}</h2>

          <div className={`astro-options ${isWrongPick ? 'quiz-shake' : ''}`}>
            {activeQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === activeQuestion.answer;
              const showResult = Boolean(selectedAnswer);
              return (
                <button
                  className={`astro-option ${showResult && isCorrect ? 'correct' : ''} ${showResult && isSelected && !isCorrect ? 'wrong' : ''} ${isSelected ? 'selected' : ''}`}
                  key={option}
                  onClick={() => answerQuestion(option)}
                  disabled={Boolean(selectedAnswer)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                  {showResult && isCorrect && <CheckCircle2 size={19} />}
                  {showResult && isSelected && !isCorrect && <XCircle size={19} />}
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <div className={`astro-answer-review ${selectedAnswer === activeQuestion.answer ? 'is-correct' : 'is-wrong'}`}>
              <div>
                <small>Your choice</small>
                <strong>{selectedAnswer === activeQuestion.answer ? 'Correct' : 'Wrong'}: {selectedAnswer}</strong>
              </div>
              <div>
                <small>Actual solution</small>
                <strong>{activeQuestion.answer}</strong>
              </div>
              <div className="astro-next-countdown">Next question in <strong>1.5 seconds</strong></div>
            </div>
          )}

          <button className="btn btn-secondary astro-exit" onClick={reset}>
            <ArrowLeft size={15} /> Exit quiz
          </button>
        </section>
      )}

      {finished && (
        <section className={`astro-result ${result.correct === QUIZ_QUESTION_COUNT ? 'astro-perfect-result' : ''}`}>
          <div className="astro-result-icon">
            {result.correct === QUIZ_QUESTION_COUNT ? <Trophy size={34} /> : <CheckCircle2 size={34} />}
          </div>
          <span className="astro-kicker">{result.correct === QUIZ_QUESTION_COUNT ? 'Perfect score!' : 'Mission complete'}</span>
          <h2 className="astro-score-result"><strong>{result.correct}</strong><small>/ {QUIZ_QUESTION_COUNT} right</small></h2>
          <div className="astro-time-result">
            <strong>{timeDescription(elapsedSeconds)}</strong>
            <span>You finished in {formatElapsed(elapsedSeconds)}</span>
          </div>
          <div className="astro-save-status">
            {saveState === 'saving' ? 'Saving to the database...' : saveState === 'saved' ? 'Saved to the database' : saveState === 'failed' ? 'Could not reach the database' : ''}
          </div>
          <button className="btn btn-primary" onClick={reset}>
            <Gamepad2 size={15} /> New game
          </button>
        </section>
      )}
    </div>
  );
};

export default AstroGames;