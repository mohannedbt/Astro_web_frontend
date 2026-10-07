import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  Gamepad2,
  RotateCcw,
  Satellite,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Shield,
  Zap,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { fetchAstrogameRecords, saveAstrogameRecord } from '../services/api';

const question = (text, answer, options) => ({ question: text, answer, options: [answer, ...options] });

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
const MEMORY_PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const MEMORY_SETTINGS = {
  easy: { pairs: 4, seconds: 60 },
  medium: { pairs: 6, seconds: 75 },
  hard: { pairs: 8, seconds: 90 },
};

const createMemoryResult = (won, matched, elapsed, moves, difficulty, player) => ({
  won,
  matched,
  elapsed,
  moves,
  difficulty,
  pairs: MEMORY_SETTINGS[difficulty].pairs,
  seconds: MEMORY_SETTINGS[difficulty].seconds,
  ...player,
});

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
  const [gameMode, setGameMode] = useState('arcade'); // 'arcade' | 'meteor' | 'memory' | 'memory-setup' | 'quiz' | 'records'
  
  // Orbit Match State
  const [memoryCards, setMemoryCards] = useState([]);
  const [memoryOpen, setMemoryOpen] = useState([]);
  const [memoryMatches, setMemoryMatches] = useState([]);
  const [memoryDifficulty, setMemoryDifficulty] = useState('easy');
  const [memorySeconds, setMemorySeconds] = useState(MEMORY_SETTINGS.easy.seconds);
  const [memoryActive, setMemoryActive] = useState(false);
  const [memoryStartedAt, setMemoryStartedAt] = useState(null);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryResult, setMemoryResult] = useState(null);
  const [memoryRecordState, setMemoryRecordState] = useState('idle');
  const [memoryPlayer, setMemoryPlayer] = useState(null);
  const [memoryRecords, setMemoryRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');

  // Meteor Dash State
  const [dashScore, setDashScore] = useState(0);
  const [dashDistance, setDashDistance] = useState(0);
  const [dashShields, setDashShields] = useState(100);
  const [dashEmpReady, setDashEmpReady] = useState(true);
  const [dashCombo, setDashCombo] = useState(0);
  const [dashGameOver, setDashGameOver] = useState(false);
  const [dashGameStarted, setDashGameStarted] = useState(false);
  const [dashCanvasSize, setDashCanvasSize] = useState(null);
  const [dashHighScore, setDashHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('astro_dash_highscore')) || 0;
    } catch {
      return 0;
    }
  });

  const canvasRef = useRef(null);
  const dashPanelRef = useRef(null);
  const dashHudRef = useRef(null);
  const dashControlsRef = useRef(null);
  const gameLoopRef = useRef(null);
  const gameStateRef = useRef({
    ship: { x: 250, y: 440, vx: 0, vy: 0, targetX: 250, targetY: 440, w: 32, h: 42, tilt: 0 },
    meteors: [],
    particles: [],
    stars: [],
    empBlast: null,
    score: 0,
    distance: 0,
    shields: 100,
    empReady: true,
    empCooldown: 0,
    combo: 0,
    speed: 3.5,
    frameCount: 0,
    keys: {},
    touchPointerId: null,
    touchTarget: null,
    gameOver: false,
  });

  // Astro Quiz State
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const [quizName, setQuizName] = useState('');
  const [popup, setPopup] = useState(null);

  const memorySettings = MEMORY_SETTINGS[memoryDifficulty];

  useEffect(() => {
    if (gameMode !== 'meteor') return undefined;
    const panel = dashPanelRef.current;
    if (!panel) return undefined;

    const resizeCanvas = () => {
      const hudHeight = dashHudRef.current?.getBoundingClientRect().height || 0;
      const controlsHeight = dashControlsRef.current?.getBoundingClientRect().height || 0;
      const availableHeight = Math.max(160, panel.clientHeight - hudHeight - controlsHeight - 16);
      const height = Math.min(640, availableHeight, panel.clientWidth * (640 / 520));
      const width = height * (520 / 640);
      setDashCanvasSize((current) => (
        current && Math.abs(current.width - width) < 1 && Math.abs(current.height - height) < 1
          ? current
          : { width, height }
      ));
    };

    const observer = new ResizeObserver(resizeCanvas);
    let resizeFrame = 0;
    const onWindowResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(resizeCanvas);
    };
    observer.observe(panel);
    if (dashHudRef.current) observer.observe(dashHudRef.current);
    if (dashControlsRef.current) observer.observe(dashControlsRef.current);
    window.addEventListener('resize', onWindowResize, { passive: true });
    resizeCanvas();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onWindowResize);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
    };
  }, [gameMode]);

  /* ================= METEOR DASH ENGINE ================= */
  const initMeteorDash = useCallback(() => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 500;
    const h = canvas ? canvas.height : 600;

    gameStateRef.current = {
      ship: { x: w / 2, y: h - 100, vx: 0, vy: 0, targetX: w / 2, targetY: h - 100, w: 34, h: 46, tilt: 0 },
      meteors: [],
      particles: [],
      stars: Array.from({ length: 80 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 1,
        color: ['#ffffff', '#7dd3fc', '#cbd5e1', '#fef08a'][Math.floor(Math.random() * 4)],
      })),
      empBlast: null,
      score: 0,
      distance: 0,
      shields: 100,
      empReady: true,
      empCooldown: 0,
      combo: 0,
      speed: 3.8,
      frameCount: 0,
      keys: {},
      touchPointerId: null,
      touchTarget: null,
      gameOver: false,
    };

    setDashScore(0);
    setDashDistance(0);
    setDashShields(100);
    setDashEmpReady(true);
    setDashCombo(0);
    setDashGameOver(false);
    setDashGameStarted(true);
  }, []);

  const triggerEmpPulse = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.empReady || state.gameOver) return;

    state.empReady = false;
    state.empCooldown = 300; // 5 seconds at 60fps
    setDashEmpReady(false);

    // Create expanding EMP shockwave
    state.empBlast = {
      x: state.ship.x,
      y: state.ship.y,
      radius: 10,
      maxRadius: 360,
      alpha: 1,
    };

    // Vaporize all on-screen meteors
    let vaporizedCount = 0;
    state.meteors.forEach((m) => {
      vaporizedCount++;
      for (let i = 0; i < 12; i++) {
        state.particles.push({
          x: m.x,
          y: m.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 1,
          size: Math.random() * 3 + 2,
          color: '#38bdf8',
        });
      }
    });

    state.meteors = [];
    state.score += vaporizedCount * 150;
    setDashScore(state.score);
  }, []);

  const updateTouchTarget = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const state = gameStateRef.current;
    state.touchTarget = {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  };

  useEffect(() => {
    if (gameMode !== 'meteor' || !dashGameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
      state.keys[key] = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        triggerEmpPulse();
      }
    };

    const handleKeyUp = (e) => {
      state.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (state.gameOver) {
        setDashGameOver(true);
        if (state.score > dashHighScore) {
          setDashHighScore(state.score);
          try {
            localStorage.setItem('astro_dash_highscore', state.score);
          } catch (e) {
            console.warn(e);
          }
        }
        return;
      }

      state.frameCount++;
      state.distance += Math.round(state.speed * 1.5);
      state.score += 1 + Math.floor(state.combo / 4);

      // Speed progression
      if (state.frameCount % 300 === 0) {
        state.speed = Math.min(10, state.speed + 0.5);
      }

      // EMP Cooldown tracking
      if (!state.empReady) {
        state.empCooldown--;
        if (state.empCooldown <= 0) {
          state.empReady = true;
          setDashEmpReady(true);
        }
      }

      // Ship Steering & Fluid Inertia
      const moveSpeed = 6.2;
      let targetVx = 0;
      let targetVy = 0;

      if (state.touchPointerId !== null && state.touchTarget) {
        targetVx = (state.touchTarget.x - state.ship.x) * 0.2;
        targetVy = (state.touchTarget.y - state.ship.y) * 0.2;
        state.ship.vx += (targetVx - state.ship.vx) * 0.55;
        state.ship.vy += (targetVy - state.ship.vy) * 0.55;
      } else {
        if (state.keys['arrowleft'] || state.keys['a']) targetVx -= moveSpeed;
        if (state.keys['arrowright'] || state.keys['d']) targetVx += moveSpeed;
        if (state.keys['arrowup'] || state.keys['w']) targetVy -= moveSpeed * 0.85;
        if (state.keys['arrowdown'] || state.keys['s']) targetVy += moveSpeed * 0.85;

        state.ship.vx += (targetVx - state.ship.vx) * 0.22;
        state.ship.vy += (targetVy - state.ship.vy) * 0.22;
      }
      state.ship.x += state.ship.vx;
      state.ship.y += state.ship.vy;
      state.ship.tilt = state.ship.vx * 0.05;

      // Canvas Clamping
      state.ship.x = Math.max(state.ship.w / 2 + 10, Math.min(canvas.width - state.ship.w / 2 - 10, state.ship.x));
      state.ship.y = Math.max(state.ship.h / 2 + 10, Math.min(canvas.height - state.ship.h / 2 - 10, state.ship.y));

      // Thruster trail particles
      if (state.frameCount % 2 === 0) {
        state.particles.push({
          x: state.ship.x + (Math.random() - 0.5) * 8,
          y: state.ship.y + state.ship.h / 2,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 3 + 4,
          life: 0.85,
          size: Math.random() * 3 + 2,
          color: Math.random() > 0.4 ? '#38bdf8' : '#f59e0b',
        });
      }

      // Spawn Meteors
      const spawnInterval = Math.max(12, 38 - Math.floor(state.distance / 700));
      if (state.frameCount % spawnInterval === 0) {
        const isRare = Math.random() < 0.12;
        const radius = isRare ? Math.random() * 8 + 14 : Math.random() * 18 + 14;
        state.meteors.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: -radius - 10,
          radius,
          speed: state.speed + Math.random() * 2.5 - 0.5,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.06,
          isEnergyShard: isRare,
          color: isRare ? '#38bdf8' : '#a1a1aa',
        });
      }

      // Update Meteors & Near Miss detection
      for (let i = state.meteors.length - 1; i >= 0; i--) {
        const m = state.meteors[i];
        m.y += m.speed;
        m.rotation += m.rotSpeed;

        // Collision Check
        const dist = Math.hypot(m.x - state.ship.x, m.y - state.ship.y);
        const hitDistance = m.radius + state.ship.w / 2;

        if (dist < hitDistance) {
          if (m.isEnergyShard) {
            // Power-up Shard restores shields
            state.shields = Math.min(100, state.shields + 35);
            state.score += 300;
            state.combo += 2;
            for (let p = 0; p < 14; p++) {
              state.particles.push({
                x: m.x,
                y: m.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                size: 3,
                color: '#38bdf8',
              });
            }
          } else {
            // Meteor Impact
            const damage = Math.round(m.radius * 1.5);
            state.shields -= damage;
            state.combo = 0;

            // Explosion sparks
            for (let p = 0; p < 20; p++) {
              state.particles.push({
                x: state.ship.x,
                y: state.ship.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                size: Math.random() * 4 + 2,
                color: ['#ef4444', '#f97316', '#eab308'][Math.floor(Math.random() * 3)],
              });
            }

            if (state.shields <= 0) {
              state.shields = 0;
              state.gameOver = true;
            }
          }
          state.meteors.splice(i, 1);
          continue;
        }

        // Close Call / Gravity Slingshot combo
        if (!m.passed && dist < hitDistance + 24 && m.y > state.ship.y) {
          m.passed = true;
          state.combo += 1;
          state.score += 50 * state.combo;
        }

        // Remove off-screen
        if (m.y > canvas.height + 60) {
          state.meteors.splice(i, 1);
        }
      }

      // Update Stars
      state.stars.forEach((s) => {
        s.y += s.speed * (state.speed / 3);
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });

      // Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.024;
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Update EMP Blast Wave
      if (state.empBlast) {
        state.empBlast.radius += 14;
        state.empBlast.alpha -= 0.038;
        if (state.empBlast.alpha <= 0) {
          state.empBlast = null;
        }
      }

      // Sync React HUD
      if (state.frameCount % 5 === 0) {
        setDashScore(state.score);
        setDashDistance(state.distance);
        setDashShields(state.shields);
        setDashCombo(state.combo);
      }

      /* ================= CANVAS RENDERING ================= */
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Parallax Stars
      state.stars.forEach((s) => {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // EMP Blast Wave
      if (state.empBlast) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(state.empBlast.x, state.empBlast.y, state.empBlast.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${state.empBlast.alpha})`;
        ctx.lineWidth = 4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();
      }

      // Particles
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Meteors
      state.meteors.forEach((m) => {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.rotation);

        if (m.isEnergyShard) {
          // Rare Energy Shard
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(0, -m.radius);
          ctx.lineTo(m.radius * 0.8, 0);
          ctx.lineTo(0, m.radius);
          ctx.lineTo(-m.radius * 0.8, 0);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, m.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Stony Asteroid Body
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
          ctx.fill();

          // Craters
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(m.radius * 0.25, -m.radius * 0.25, m.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(-m.radius * 0.3, m.radius * 0.3, m.radius * 0.25, 0, Math.PI * 2);
          ctx.fill();

          // Atmospheric friction fiery halo
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.45)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, m.radius + 2, 0, Math.PI);
          ctx.stroke();
        }

        ctx.restore();
      });

      // Spacecraft
      ctx.save();
      ctx.translate(state.ship.x, state.ship.y);
      ctx.rotate(state.ship.tilt);

      // Shield Aura
      if (state.shields > 0) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 + (state.shields / 100) * 0.35})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, state.ship.w * 0.85, state.ship.h * 0.75, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Hull
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -state.ship.h / 2);
      ctx.lineTo(state.ship.w / 2, state.ship.h / 2);
      ctx.lineTo(0, state.ship.h / 2 - 8);
      ctx.lineTo(-state.ship.w / 2, state.ship.h / 2);
      ctx.closePath();
      ctx.fill();

      // Wing Flares
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -state.ship.h / 2 + 6);
      ctx.lineTo(state.ship.w / 4, state.ship.h / 2 - 4);
      ctx.lineTo(-state.ship.w / 4, state.ship.h / 2 - 4);
      ctx.closePath();
      ctx.fill();

      // Cockpit Glow
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, -4, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dashGameStarted, gameMode, dashHighScore, triggerEmpPulse]);

  /* ================= MEMORY & QUIZ RUNNERS ================= */
  useEffect(() => {
    if (gameMode !== 'memory' || !memoryActive || !memoryStartedAt) return undefined;
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - memoryStartedAt) / 1000);
      const remaining = Math.max(0, memorySettings.seconds - elapsed);
      setMemorySeconds(remaining);
      if (remaining === 0) {
        setMemoryActive(false);
        setMemoryRecordState('saving');
        setMemoryResult((res) =>
          res || createMemoryResult(false, memoryMatches.length, memorySettings.seconds, memoryMoves, memoryDifficulty, memoryPlayer)
        );
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [gameMode, memoryActive, memoryStartedAt, memorySettings.seconds, memoryMatches.length, memoryMoves, memoryDifficulty, memoryPlayer]);

  useEffect(() => {
    if (!memoryResult) return undefined;
    let cancelled = false;
    saveAstrogameRecord({
      game: 'orbit-match',
      name: memoryResult.name,
      userName: memoryResult.name,
      userId: memoryResult.userId,
      userEmail: memoryResult.userEmail,
      score: memoryResult.matched * 100 + (memoryResult.won ? memoryResult.seconds - memoryResult.elapsed : 0),
      total: memoryResult.pairs * 100 + memoryResult.seconds,
      difficulty: memoryResult.difficulty,
      won: memoryResult.won,
      guesses: memoryResult.moves,
      timeSec: memoryResult.elapsed,
      pct: Math.round((memoryResult.matched / memoryResult.pairs) * 100),
    })
      .then(() => { if (!cancelled) setMemoryRecordState('saved'); })
      .catch(() => { if (!cancelled) setMemoryRecordState('failed'); });
    return () => { cancelled = true; };
  }, [memoryResult]);

  const startMemoryRun = () => {
    const planets = shuffle(MEMORY_PLANETS).slice(0, memorySettings.pairs);
    setMemoryCards(shuffle([...planets, ...planets]).map((planet, index) => ({ id: index, planet })));
    setMemoryOpen([]);
    setMemoryMatches([]);
    setMemoryMoves(0);
    setMemorySeconds(memorySettings.seconds);
    setMemoryStartedAt(Date.now());
    setMemoryResult(null);
    setMemoryRecordState('idle');
    setMemoryPlayer({
      name: profile?.username || profile?.name || user?.name || quizName.trim() || user?.email || profile?.email || 'Cadet',
      userId: user?.id || null,
      userEmail: user?.email || profile?.email || null,
    });
    setMemoryActive(true);
    setGameMode('memory');
  };

  const turnMemoryCard = (card) => {
    if (!memoryActive || memoryResult || memoryOpen.length === 2 || memoryOpen.includes(card.id) || memoryMatches.includes(card.planet)) return;
    const nextOpen = [...memoryOpen, card.id];
    setMemoryOpen(nextOpen);
    if (nextOpen.length === 2) {
      const moves = memoryMoves + 1;
      setMemoryMoves(moves);
      const [first, second] = nextOpen.map((id) => memoryCards[id]);
      if (first.planet === second.planet) {
        const matches = [...memoryMatches, first.planet];
        setMemoryMatches(matches);
        setMemoryOpen([]);
        if (matches.length === memorySettings.pairs) {
          const elapsed = Math.max(0, memorySettings.seconds - memorySeconds);
          setMemoryActive(false);
          setMemoryRecordState('saving');
          setMemoryResult(createMemoryResult(true, matches.length, elapsed, moves, memoryDifficulty, memoryPlayer));
        }
      } else {
        window.setTimeout(() => setMemoryOpen([]), 700);
      }
    }
  };

  const openMemoryRecords = async () => {
    setGameMode('records');
    setRecordsLoading(true);
    setRecordsError('');
    try {
      const records = await fetchAstrogameRecords({
        game: 'orbit-match',
        userId: user?.id,
        userEmail: user?.email || profile?.email,
      });
      setMemoryRecords(Array.isArray(records) ? records : []);
    } catch {
      setRecordsError('Records could not be loaded. Please try again.');
    } finally {
      setRecordsLoading(false);
    }
  };

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
    setGameMode('quiz');
  };

  const result = useMemo(() => {
    const score = answers.reduce((sum, ans, idx) => sum + (ans === questions[idx]?.answer ? (idx + 1) * 25 : 0), 0);
    return { score, correct: answers.filter((ans, idx) => ans === questions[idx]?.answer).length };
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
    setPopup({ correct: isCorrect, text: isCorrect ? 'Spot on!' : 'Off target' });
    window.setTimeout(() => setPopup(null), 1000);
    window.setTimeout(() => advanceQuestion(answer), 1400);
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
    setSaveState('saved');
  };

  const resetQuiz = () => {
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
  const displayCorrect = answers.filter((ans, idx) => ans === questions[idx]?.answer).length;
  const isWrongPick = selectedAnswer && activeQuestion && selectedAnswer !== activeQuestion.answer;

  return (
    <div className={`page-content astrogames-page ${gameMode === 'quiz' && !questions.length ? 'quiz-home' : ''} ${gameMode === 'meteor' ? 'meteor-page-active' : ''}`}>
      {/* ================= ARCADE LOBBY ================= */}
      {gameMode === 'arcade' && (
        <section className="arcade-lobby">
          <div className="arcade-lobby-heading">
            <div className="arcade-heading-row">
              <span className="arcade-kicker">
                <Sparkles size={14} /> Astro Club Space Arcade
              </span>
              <button className="arcade-records-link" onClick={openMemoryRecords}>
                <Database size={15} /> Records
              </button>
            </div>
            <h1>Cosmic Simulators</h1>
            <p>Engage in supersonic meteor evasion, planetary memory grids, and stellar astrophysics quizzes.</p>
          </div>

          <div className="arcade-game-grid">
            {/* Meteor Dash Card */}
            <article
              className="arcade-game-card arcade-meteor-card"
              onClick={() => {
                setGameMode('meteor');
                initMeteorDash();
              }}
            >
              <div className="arcade-card-icon">
                <Flame size={24} />
              </div>
              <span className="arcade-card-type">KINETIC FLIGHT // REFLEX ACTION</span>
              <strong>Meteor Dash</strong>
              <p className="arcade-card-description">
                Piloting through hyper-dense meteor streams. Dodge space debris, collect quantum shards, and trigger
                EMP shockwaves.
              </p>
              <div className="arcade-card-action">
                <span>Engage Thrusters</span>
                <ChevronRight size={16} />
              </div>
            </article>

            {/* Orbit Match Card */}
            <article className="arcade-game-card arcade-memory-card" onClick={() => setGameMode('memory-setup')}>
              <div className="arcade-card-icon">
                <Satellite size={24} />
              </div>
              <span className="arcade-card-type">COGNITIVE RADAR // ORBIT MATCH</span>
              <strong>Orbit Match</strong>
              <p className="arcade-card-description">
                Scan and pair celestial bodies across the planetary system before oxygen reserves deplete.
              </p>
              <div className="arcade-card-action">
                <span>Start Matching</span>
                <ChevronRight size={16} />
              </div>
            </article>

            {/* Astro Quiz Card */}
            <article className="arcade-game-card" onClick={() => setGameMode('quiz')}>
              <div className="arcade-card-icon">
                <Trophy size={24} />
              </div>
              <span className="arcade-card-type">ACADEMY BRIEF // KNOWLEDGE TEST</span>
              <strong>Astro Quiz</strong>
              <p className="arcade-card-description">
                5 rapid-fire astrophysical queries. Test your astronomy fundamentals and log your time in the academy
                roster.
              </p>
              <div className="arcade-card-action">
                <span>Take Exam</span>
                <ChevronRight size={16} />
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ================= METEOR DASH GAME SCREEN ================= */}
      {gameMode === 'meteor' && (
        <section className="meteor-dash-viewport-panel" ref={dashPanelRef}>
          {/* Header Bar */}
          <div className="meteor-dash-hud-header" ref={dashHudRef}>
            <button
              className="arcade-back-button"
              onClick={() => {
                setDashGameStarted(false);
                setGameMode('arcade');
              }}
            >
              <ArrowLeft size={16} /> Arcade Hub
            </button>

            <div className="hud-telemetry-strip">
              <div className="hud-item">
                <span className="hud-label">SHIELDS</span>
                <div className="hud-shield-bar-wrap">
                  <div
                    className="hud-shield-fill"
                    style={{
                      width: `${dashShields}%`,
                      background: dashShields > 40 ? '#38bdf8' : '#ef4444',
                    }}
                  />
                </div>
                <span className="hud-shield-num">{dashShields}%</span>
              </div>

              <div className="hud-item">
                <span className="hud-label">DISTANCE</span>
                <span className="hud-val">{dashDistance} km</span>
              </div>

              <div className="hud-item">
                <span className="hud-label">SCORE</span>
                <span className="hud-val highlight">{dashScore}</span>
              </div>

              {dashCombo > 1 && (
                <div className="hud-item combo-tag">
                  <span>{dashCombo}x SLINGSHOT!</span>
                </div>
              )}
            </div>

            <button
              className={`hud-emp-btn ${dashEmpReady ? 'emp-ready' : 'emp-cooling'}`}
              onClick={triggerEmpPulse}
              disabled={!dashEmpReady || dashGameOver}
              aria-label={dashEmpReady ? 'Trigger EMP blast' : 'EMP charging'}
              title={dashEmpReady ? 'Trigger EMP blast' : 'EMP charging'}
            >
              <Zap size={14} />
              <span>{dashEmpReady ? 'EMP BLAST [SPACE]' : 'EMP CHARGING...'}</span>
            </button>
          </div>

          {/* Interactive Game Canvas Container */}
          <div className="meteor-canvas-wrapper" style={dashCanvasSize ? { width: `${dashCanvasSize.width}px`, height: `${dashCanvasSize.height}px` } : undefined}>
            <canvas
              ref={canvasRef}
              width={520}
              height={640}
              className="meteor-game-canvas"
              aria-label="Meteor Dash play area. Touch and drag to steer the rocket."
              onPointerDown={(event) => {
                if (event.pointerType !== 'touch' && !window.matchMedia('(max-width: 768px)').matches) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                gameStateRef.current.touchPointerId = event.pointerId;
                updateTouchTarget(event);
              }}
              onPointerMove={(event) => {
                if (gameStateRef.current.touchPointerId !== event.pointerId) return;
                event.preventDefault();
                updateTouchTarget(event);
              }}
              onPointerUp={(event) => {
                if (gameStateRef.current.touchPointerId === event.pointerId) {
                  gameStateRef.current.touchPointerId = null;
                }
              }}
              onPointerCancel={() => {
                gameStateRef.current.touchPointerId = null;
              }}
              onLostPointerCapture={() => {
                gameStateRef.current.touchPointerId = null;
              }}
            />

            {/* Game Over Overlay */}
            {dashGameOver && (
              <div className="meteor-gameover-overlay">
                <div className="gameover-card">
                  <div className="gameover-icon">
                    <Flame size={38} />
                  </div>
                  <h2>Hull Breached</h2>
                  <p>Your recon vessel was crushed in the dense asteroid belt.</p>

                  <div className="gameover-stats-grid">
                    <div>
                      <small>FINAL SCORE</small>
                      <strong>{dashScore}</strong>
                    </div>
                    <div>
                      <small>TRAVELED</small>
                      <strong>{dashDistance} km</strong>
                    </div>
                    <div>
                      <small>ALL-TIME BEST</small>
                      <strong>{dashHighScore}</strong>
                    </div>
                  </div>

                  <div className="gameover-actions">
                    <button className="btn btn-primary" onClick={initMeteorDash}>
                      <RotateCcw size={15} /> Re-Launch Vessel
                    </button>
                    <button className="btn btn-secondary" onClick={() => setGameMode('arcade')}>
                      Exit to Arcade
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Touch Controls Overlay */}
          <div className="meteor-touch-controls" ref={dashControlsRef}>
            <div className="touch-steering-hint">
              <span className="touch-hint-mobile">Drag anywhere in the flight window to steer · EMP clears nearby meteors</span>
              <span className="touch-hint-desktop">Use arrows / WASD to steer · SPACE for EMP shockwave</span>
            </div>
            <div className="meteor-touch-action-row">
              <button
                className="touch-emp-button"
                type="button"
                onClick={triggerEmpPulse}
                disabled={!dashEmpReady || dashGameOver}
              >
                <Zap size={18} /> <span>TRIGGER EMP</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= ORBIT MATCH (PLANET MEMORY) ================= */}
      {gameMode === 'memory-setup' && (
        <section className="arcade-play-panel memory-setup-panel">
          <button className="arcade-back-button" onClick={() => setGameMode('arcade')}>
            <ArrowLeft size={16} /> All games
          </button>
          <div className="arcade-play-heading">
            <span className="arcade-kicker">PLANET MEMORY</span>
            <h1>Orbit Match Setup</h1>
            <p>Choose your scan difficulty and clear the planetary orbit before time expires.</p>
          </div>

          <div className="memory-difficulty-label">Select Scan Difficulty:</div>
          <div className="memory-difficulty-switch">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                className={memoryDifficulty === level ? 'active' : ''}
                onClick={() => setMemoryDifficulty(level)}
              >
                <strong>{level[0].toUpperCase() + level.slice(1)}</strong>
                <span>
                  {MEMORY_SETTINGS[level].pairs} pairs · {MEMORY_SETTINGS[level].seconds}s
                </span>
              </button>
            ))}
          </div>

          <button className="btn btn-primary memory-start-button" onClick={startMemoryRun}>
            Initiate Orbit Match
          </button>
        </section>
      )}

      {gameMode === 'memory' && (
        <section className="arcade-play-panel">
          <button className="arcade-back-button" onClick={() => setGameMode('arcade')}>
            <ArrowLeft size={16} /> All games
          </button>
          <div className="arcade-play-heading">
            <span className="arcade-kicker">PLANET MEMORY</span>
            <h1>Orbit Match</h1>
            <p>Match each planet pair before your life-support timer expires.</p>
          </div>

          <div className="memory-stats">
            <span>
              <Clock3 size={16} /> {formatElapsed(memorySeconds)} remaining
            </span>
            <span>{memoryMoves} moves</span>
            <span>
              {memoryMatches.length} / {memorySettings.pairs} pairs
            </span>
          </div>

          <div className="memory-board">
            {memoryCards.map((card) => {
              const revealed = memoryOpen.includes(card.id) || memoryMatches.includes(card.planet);
              return (
                <button
                  key={card.id}
                  className={`memory-card ${revealed ? 'revealed' : ''} ${memoryMatches.includes(card.planet) ? 'matched' : ''}`}
                  onClick={() => turnMemoryCard(card)}
                  aria-label={revealed ? card.planet : 'Reveal planet card'}
                >
                  {revealed ? (
                    <>
                      <span className={`planet-illustration planet-${card.planet.toLowerCase()}`} aria-hidden="true" />
                      <span className="planet-card-name">{card.planet}</span>
                    </>
                  ) : (
                    <span className="planet-card-back">ACI</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="arcade-play-footer">
            <span>
              {memoryRecordState === 'saved'
                ? 'Run saved to Records'
                : memoryRecordState === 'failed'
                ? 'Could not save this run'
                : memoryResult
                ? 'Saving run...'
                : `${memoryDifficulty[0].toUpperCase() + memoryDifficulty.slice(1)} flight`}
            </span>
            <button className="arcade-inline-button" onClick={startMemoryRun}>
              <RotateCcw size={15} /> Restart
            </button>
          </div>

          {memoryResult && (
            <div className="memory-result-panel">
              <strong>{memoryResult.won ? 'All planets verified!' : 'Time expired.'}</strong>
              <span>
                {memoryResult.matched} of {memoryResult.pairs} pairs · {memoryResult.moves} moves ·{' '}
                {formatElapsed(memoryResult.elapsed)}
              </span>
              <button className="arcade-inline-button" onClick={openMemoryRecords}>
                <Database size={15} /> View Records
              </button>
            </div>
          )}
        </section>
      )}

      {/* ================= RECORDS PANEL ================= */}
      {gameMode === 'records' && (
        <section className="arcade-play-panel records-panel">
          <button className="arcade-back-button" onClick={() => setGameMode('arcade')}>
            <ArrowLeft size={16} /> All games
          </button>
          <div className="arcade-play-heading">
            <span className="arcade-kicker">
              <Database size={14} /> ARCHIVED ROSTER
            </span>
            <h1>Records &amp; Scores</h1>
            <p>Verified Orbit Match runs logged into the Astro Club database.</p>
          </div>

          {recordsLoading ? (
            <div className="records-empty">Retrieving logs from database...</div>
          ) : recordsError ? (
            <div className="records-empty records-error">{recordsError}</div>
          ) : memoryRecords.length ? (
            <div className="memory-record-list">
              {memoryRecords.map((record) => (
                <article className="memory-record-row" key={record.id || `${record.name}-${record.created_at}`}>
                  <div className="memory-record-score">
                    <strong>{record.score}</strong>
                    <span>points</span>
                  </div>
                  <div className="memory-record-player">
                    <strong>{record.name}</strong>
                    <span>
                      {record.won ? 'Completed' : 'Time expired'} · {record.difficulty || 'Easy'}
                    </span>
                  </div>
                  <div className="memory-record-details">
                    <span>{formatElapsed(Number(record.time_sec) || 0)}</span>
                    <span>{record.guesses || 0} moves</span>
                  </div>
                  <time>{record.created_at ? new Date(record.created_at).toLocaleDateString() : ''}</time>
                </article>
              ))}
            </div>
          ) : (
            <div className="records-empty">
              <Trophy size={24} />
              <strong>No saved runs yet</strong>
              <span>Complete a flight in Orbit Match to record your callsign here.</span>
            </div>
          )}
        </section>
      )}

      {/* ================= ASTRO QUIZ ================= */}
      {gameMode === 'quiz' && !questions.length && (
        <section className="astro-quiz-intro astro-quiz-start">
          <div className="astro-start-content">
            <span className="astro-kicker">Academy Briefing</span>
            <h1 className="astro-hero-title">Astro Quiz</h1>
            <p>Five rapid-fire fundamental space science questions. Clock starts on question 1.</p>

            <label className="astro-name-field" htmlFor="astro-player-name">
              <span>Cadet Callsign</span>
              <input
                id="astro-player-name"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                maxLength={80}
                placeholder="Enter your name"
                autoComplete="name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') startQuiz();
                }}
              />
            </label>

            <button
              className="btn btn-primary astro-start-button"
              onClick={startQuiz}
              disabled={!quizName.trim()}
            >
              <Gamepad2 size={15} /> Begin Examination
            </button>

            <button className="astro-back-link" onClick={() => setGameMode('arcade')}>
              <ArrowLeft size={14} /> Return to Arcade
            </button>
          </div>
        </section>
      )}

      {gameMode === 'quiz' && activeQuestion && !finished && (
        <section className="astro-quiz-panel" key={current}>
          <div className="astro-quiz-topline">
            <div>
              <span
                className="astro-difficulty"
                style={{
                  color: tierColors[activeQuestion.tier],
                  borderColor: tierColors[activeQuestion.tier],
                }}
              >
                {tierLabels[activeQuestion.tier]}
              </span>
              <span className="astro-question-count">
                Question {current + 1} of {QUIZ_QUESTION_COUNT}
              </span>
            </div>
            <div className="astro-timer">
              <small>ELAPSED</small>
              <strong>{formatElapsed(elapsedSeconds)}</strong>
            </div>
            <div className="astro-score-wrap">
              <strong className="astro-live-score">
                {displayCorrect}/{QUIZ_QUESTION_COUNT} correct
              </strong>
              {popup && (
                <span className={`quiz-pop ${popup.correct ? 'correct' : 'wrong'}`}>{popup.text}</span>
              )}
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
            <div
              className={`astro-answer-review ${selectedAnswer === activeQuestion.answer ? 'is-correct' : 'is-wrong'}`}
            >
              <div>
                <small>Your Choice</small>
                <strong>
                  {selectedAnswer === activeQuestion.answer ? 'Correct' : 'Missed'}: {selectedAnswer}
                </strong>
              </div>
              <div>
                <small>Verified Solution</small>
                <strong>{activeQuestion.answer}</strong>
              </div>
            </div>
          )}

          <button className="btn btn-secondary astro-exit" onClick={resetQuiz}>
            <ArrowLeft size={15} /> Exit Quiz
          </button>
        </section>
      )}

      {gameMode === 'quiz' && finished && (
        <section className={`astro-result ${result.correct === QUIZ_QUESTION_COUNT ? 'astro-perfect-result' : ''}`}>
          <div className="astro-result-icon">
            {result.correct === QUIZ_QUESTION_COUNT ? <Trophy size={34} /> : <CheckCircle2 size={34} />}
          </div>
          <span className="astro-kicker">
            {result.correct === QUIZ_QUESTION_COUNT ? 'Perfect Score' : 'Exam Complete'}
          </span>
          <h2 className="astro-score-result">
            <strong>{result.correct}</strong>
            <small>/ {QUIZ_QUESTION_COUNT} correct</small>
          </h2>
          <div className="astro-time-result">
            <strong>{timeDescription(elapsedSeconds)}</strong>
            <span>Completed in {formatElapsed(elapsedSeconds)}</span>
          </div>
          <button className="btn btn-primary" onClick={resetQuiz}>
            <Gamepad2 size={15} /> New Exam
          </button>
        </section>
      )}
    </div>
  );
};

export default AstroGames;