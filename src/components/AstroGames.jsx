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
  Crown,
  Medal,
  Calendar,
  Filter,
  TrendingUp,
  User,
  Star,
  ZapOff,
} from 'lucide-react';
import {
  fetchAstrogameRecords,
  saveAstrogameRecord,
  getRankFromXP,
  getWeeklyResetTimeLeft,
  isSameWeek,
  getUserTotalXP,
  claimDailyLoginXP,
  isExperimentalXpMarketEnabled,
} from '../services/api';

/* ================= GAME CONFIGURATIONS & DIFFICULTY SETTINGS ================= */

export const METEOR_DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: 'Easy · Cadet',
    speed: 1.8,
    maxSpeed: 3.5,
    speedAccel: 0.12,
    spawnIntervalBase: 70,
    minSpawnInterval: 42,
    shields: 150,
    empCooldown: 240, // 4 sec at 60fps
    multiplier: 0.25,
    color: '#34d399',
    desc: 'Gentle flight stream with slow asteroids. Easy mode yields minimal XP (0.25x) to prevent easy farming.',
  },
  medium: {
    id: 'medium',
    label: 'Medium · Officer',
    speed: 2.6,
    maxSpeed: 5.0,
    speedAccel: 0.2,
    spawnIntervalBase: 50,
    minSpawnInterval: 28,
    shields: 110,
    empCooldown: 300, // 5 sec
    multiplier: 1.4,
    color: '#38bdf8',
    desc: 'Moderate asteroid field with calm rock movement and standard shield specs.',
  },
  hard: {
    id: 'hard',
    label: 'Hard · Commander',
    speed: 4.0,
    maxSpeed: 7.5,
    speedAccel: 0.32,
    spawnIntervalBase: 30,
    minSpawnInterval: 18,
    shields: 90,
    empCooldown: 360, // 6 sec
    multiplier: 2.2,
    color: '#f59e0b',
    desc: 'Dense cosmic debris cluster requiring fast reflexes and sharp piloting.',
  },
  insane: {
    id: 'insane',
    label: 'Very Hard · Space Legend',
    speed: 5.6,
    maxSpeed: 9.5,
    speedAccel: 0.45,
    spawnIntervalBase: 20,
    minSpawnInterval: 10,
    shields: 70,
    empCooldown: 480, // 8 sec
    multiplier: 3.5,
    color: '#ef4444',
    desc: 'Relativistic asteroid storm! High speed & 3.5x XP point multiplier.',
  },
};

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
    question('What is a shooting star actually?', 'A meteoroid burning in atmosphere', ['A piece of a star', 'A comet fragment', 'Solar debris']),
    question('Which planet spins on its side?', 'Uranus', ['Saturn', 'Neptune', 'Jupiter']),
    question('Which planet is closest to the Sun?', 'Mercury', ['Venus', 'Earth', 'Mars']),
    question('What is the name of our planetary system?', 'The Solar System', ['The Milky Way', 'The Orion Arm', 'The Local Group']),
    question('Which planet is called the Blue Planet?', 'Earth', ['Neptune', 'Uranus', 'Venus']),
    question('What is the Moon mostly made of?', 'Rock and metal', ['Gas and ice', 'Liquid water', 'Hydrogen plasma']),
    question('Which object gives Earth most of its light and heat?', 'The Sun', ['The Moon', 'Jupiter', 'Sirius']),
    question('What is a comet nucleus mainly made of?', 'Ice and dust', ['Liquid iron', 'Pure hydrogen', 'Molten rock']),
    question('Which planet is famous for its tilted rings?', 'Saturn', ['Mars', 'Venus', 'Mercury']),
    question('What do astronauts wear outside a spacecraft?', 'A spacesuit', ['A pressure shield', 'A flight jacket', 'A thermal blanket']),
    question('What is a constellation?', 'A pattern of stars seen from Earth', ['A group of planets', 'A type of galaxy', 'A space station']),
    question('Which direction does the Sun appear to rise from?', 'East', ['West', 'North', 'South']),
    question('What is the name of the first artificial satellite?', 'Sputnik 1', ['Explorer 1', 'Apollo 1', 'Vostok 1']),
    question('Which planet is often called Earth’s sister planet?', 'Venus', ['Mars', 'Neptune', 'Saturn']),
    question('What is the path of an object around another object called?', 'An orbit', ['A rotation', 'A transit', 'A phase']),
    question('What is the visible surface of the Sun called?', 'The photosphere', ['The corona', 'The core', 'The chromosphere']),
    question('Which planet has a day longer than its year?', 'Venus', ['Mars', 'Jupiter', 'Earth']),
    question('What is the name of the galaxy containing our Solar System?', 'The Milky Way', ['Andromeda', 'Sombrero', 'Whirlpool']),
  ],
  medium: [
    question('Which moon in our solar system has a dense nitrogen atmosphere?', 'Titan', ['Europa', 'Ganymede', 'Io']),
    question('What distance does light travel in one Earth year?', 'A Light-Year', ['An Astronomical Unit', 'A Parsec', 'A Solar Radius']),
    question('Which space telescope was launched in 2021 to observe infrared light?', 'James Webb Space Telescope', ['Hubble Space Telescope', 'Spitzer Telescope', 'Chandra Observatory']),
    question('What is the boundary around a black hole beyond which light cannot escape?', 'Event Horizon', ['Singularity', 'Photon Sphere', 'Accretion Disk']),
    question('Which planet has the shortest day (fastest rotation) in our solar system?', 'Jupiter', ['Mercury', 'Earth', 'Saturn']),
    question('What type of galaxy is the Milky Way?', 'Barred Spiral', ['Elliptical', 'Irregular', 'Lenticular']),
    question('What is the largest moon in the Solar System?', 'Ganymede', ['Titan', 'Callisto', 'The Moon']),
    question('Which dwarf planet is located in the main asteroid belt?', 'Ceres', ['Pluto', 'Eris', 'Haumea']),
    question('What is the name of NASA’s rover that landed on Mars in 2021?', 'Perseverance', ['Curiosity', 'Opportunity', 'InSight']),
    question('What causes a solar eclipse on Earth?', 'The Moon passes between Sun and Earth', ['Earth passes between Sun and Moon', 'Sun passes between Earth and Moon', 'Venus blocks the Sun']),
    question('What is a parsec used to measure?', 'Astronomical distance', ['Star temperature', 'Planet mass', 'Light intensity']),
    question('Which planet has the strongest surface winds?', 'Neptune', ['Earth', 'Mars', 'Saturn']),
    question('What is an exoplanet?', 'A planet outside our Solar System', ['A planet without a moon', 'A failed star', 'A dwarf planet']),
    question('Why do stars appear to twinkle?', 'Atmospheric turbulence', ['Their rotation', 'Solar eclipses', 'Magnetic storms']),
    question('What is a nebula?', 'A cloud of gas and dust in space', ['A planet core', 'A comet tail', 'A black hole jet']),
    question('What is the main sequence?', 'A band where stars spend most of their lives', ['A galaxy arm', 'A comet path', 'A lunar phase']),
    question('Which planet has the Great Dark Spot-like storms?', 'Neptune', ['Venus', 'Mercury', 'Earth']),
    question('What is an astronomical unit based on?', 'The average Earth-Sun distance', ['The Earth-Moon distance', 'The Sun radius', 'The Milky Way diameter']),
    question('What is a light-year?', 'A distance light travels in one year', ['A unit of time', 'The age of a star', 'A telescope exposure']),
    question('Which rocket family launched many Apollo missions?', 'Saturn V', ['Falcon 9', 'Ariane 5', 'Atlas V']),
    question('What is a transit in astronomy?', 'An object passing across a larger object', ['A star explosion', 'A planet rotation', 'A galaxy merger']),
    question('Which moon is known for its subsurface ocean and icy crust?', 'Europa', ['Phobos', 'Titan', 'Triton']),
    question('What is solar wind?', 'A stream of charged particles from the Sun', ['A wave of sunlight', 'A lunar atmosphere', 'A comet tail']),
    question('What does a spectroscope separate?', 'Light by wavelength', ['Planets by size', 'Moons by orbit', 'Rockets by fuel']),
    question('Which launch vehicle is reusable and developed by SpaceX?', 'Falcon 9', ['Saturn V', 'Ariane 5', 'Soyuz-U']),
    question('What is the asteroid belt located between?', 'Mars and Jupiter', ['Earth and Mars', 'Jupiter and Saturn', 'Venus and Earth']),
    question('What is a red giant?', 'An expanded late-stage star', ['A young planet', 'A black hole jet', 'A comet nucleus']),
    question('What is a rover designed to do?', 'Travel across and study a planetary surface', ['Orbit a star', 'Measure only starlight', 'Launch rockets']),
    question('Which rocket carried humans to the Moon?', 'Saturn V', ['Falcon Heavy', 'Ariane 5', 'Electron']),
    question('What is a meteor?', 'A meteoroid glowing in an atmosphere', ['A moon fragment in orbit', 'A small star', 'A planet ring']),
    question('What is the Kuiper Belt?', 'A region of icy bodies beyond Neptune', ['A ring around Saturn', 'A cloud near the Sun', 'A belt between Earth and Mars']),
    question('Which planet has the fastest winds among the planets?', 'Neptune', ['Earth', 'Mars', 'Jupiter']),
    question('What is a telescope aperture?', 'The diameter of its light-collecting opening', ['Its focal length', 'Its weight', 'Its tracking speed']),
    question('What is a satellite?', 'An object that orbits another object', ['Only a human-made rocket', 'A star cluster', 'A comet tail']),
    question('What is an eclipse?', 'One body blocking light from another', ['A planet changing size', 'A star changing color', 'A rocket launch']),
    question('Which planet is the hottest on average?', 'Venus', ['Mercury', 'Mars', 'Jupiter']),
    question('What is a lunar phase?', 'The changing visible shape of the Moon', ['A Moon earthquake', 'A new crater', 'A solar flare']),
    question('What is a launch window?', 'A time period suitable for a mission launch', ['A rocket window', 'A telescope lens', 'A spacecraft hatch']),
  ],
  hard: [
    question('What is the maximum mass limit of a stable white dwarf star?', 'Chandrasekhar Limit (~1.4 M☉)', ['Tolman-Oppenheimer-Volkoff Limit', 'Eddington Limit', 'Hawking Mass']),
    question('What residual thermal radiation was created during the early Big Bang?', 'Cosmic Microwave Background (CMB)', ['Hawking Radiation', 'Synchrotron Glow', 'Zodiacal Light']),
    question('Which Lagrange point lies directly between Earth and the Sun?', 'L1', ['L2', 'L3', 'L4']),
    question('What thermonuclear explosion happens when a white dwarf accretes excess mass?', 'Type Ia Supernova', ['Core Collapse Supernova', 'Kilonova', 'Planetary Nebula']),
    question('Which quantum degeneracy force prevents neutron stars from collapsing?', 'Neutron Degeneracy Pressure', ['Electron Degeneracy Pressure', 'Thermal Radiation', 'Electromagnetic Force']),
    question('What phenomenon causes light from expanding cosmic space to stretch in wavelength?', 'Cosmological Redshift', ['Doppler Shift', 'Gravitational Redshift', 'Compton Effect']),
    question('What is the primary element synthesized during main-sequence stellar fusion?', 'Helium', ['Carbon', 'Oxygen', 'Iron']),
    question('What landmark observatory detected gravitational waves for the first time in 2015?', 'LIGO', ['VIRGO', 'Webb Telescope', 'Kepler Observatory']),
    question('What is the Schwarzschild radius associated with?', 'A black hole event horizon', ['A star spectrum', 'A galaxy orbit', 'A planet atmosphere']),
    question('What does the Hertzsprung-Russell diagram compare?', 'Stellar luminosity and temperature', ['Planet mass and radius', 'Galaxy age and distance', 'Orbit speed and tilt']),
    question('What is a neutron star primarily composed of?', 'Degenerate neutron matter', ['Liquid hydrogen', 'Silicate rock', 'Dark energy']),
    question('What process powers a main-sequence star?', 'Hydrogen fusion', ['Carbon fission', 'Gravitational collapse only', 'Chemical combustion']),
    question('What is gravitational lensing?', 'Light bending around massive objects', ['A telescope mirror defect', 'A stellar flare', 'A radio interference pattern']),
    question('What is the Chandrasekhar limit measured in?', 'Solar masses', ['Light-years', 'Kelvin', 'Parsecs']),
    question('What is a kilonova associated with?', 'A neutron-star merger', ['A lunar eclipse', 'A solar flare', 'A comet impact']),
    question('What is the Roche limit?', 'The distance where tidal forces can break apart an orbiting body', ['A star’s fusion limit', 'A galaxy’s edge', 'A planet’s atmosphere']),
    question('What is a protostar?', 'A forming star before sustained hydrogen fusion', ['A dead star', 'A small galaxy', 'A planet with rings']),
    question('What is the Oort Cloud?', 'A distant reservoir of icy bodies around the Solar System', ['A cloud inside Jupiter', 'A solar corona layer', 'A nebula near Earth']),
    question('What is a barycenter?', 'The common center of mass of orbiting bodies', ['A galaxy core', 'A star’s surface', 'A comet’s tail']),
    question('What is the Eddington limit?', 'A luminosity where radiation pressure balances gravity in accretion', ['A planet mass limit', 'A lunar distance', 'A telescope resolution']),
    question('What is stellar parallax used to measure?', 'Distances to nearby stars', ['Star composition only', 'Planet temperature', 'Galaxy rotation']),
    question('What is a planetary nebula?', 'Gas shed by a dying low- to intermediate-mass star', ['A planet atmosphere', 'A galaxy cluster', 'A comet cloud']),
    question('What is a brown dwarf?', 'An object too small to sustain ordinary hydrogen fusion', ['A red giant', 'A neutron star', 'A dark galaxy']),
    question('What is the event horizon?', 'The boundary beyond which light cannot escape a black hole', ['A star’s atmosphere', 'A galaxy edge', 'A planet’s orbit']),
    question('What does redshift usually indicate for a distant galaxy?', 'It is receding from us', ['It is getting hotter', 'It is rotating faster', 'It is closer']),
    question('What is a solar prominence?', 'A loop of cooler plasma above the Sun’s surface', ['A planet shadow', 'A comet fragment', 'A galaxy arm']),
    question('What is the main source of a pulsar’s regular pulses?', 'A rotating magnetized neutron star', ['A rotating planet', 'A binary asteroid', 'A solar flare']),
    question('What is a Lagrange point?', 'A location where gravitational and orbital effects balance', ['A black hole surface', 'A star formation zone', 'A lunar crater']),
    question('What is an impact crater?', 'A depression formed by a collision', ['A volcanic cloud', 'A galaxy void', 'A stellar remnant']),
    question('What is an absorption spectrum?', 'Dark lines formed when specific wavelengths are absorbed', ['A planet map', 'A radio pulse', 'A star orbit']),
    question('What is the Hill sphere?', 'The region where a body dominates satellite orbits', ['A star’s atmosphere', 'A galaxy’s halo', 'A comet’s coma']),
    question('What is a Roche lobe?', 'A region around a star in a close binary where its gravity dominates', ['A planet ring', 'A black hole jet', 'A lunar basin']),
    question('What is stellar nucleosynthesis?', 'The creation of elements inside stars', ['The motion of galaxies', 'The cooling of planets', 'The formation of craters']),
    question('What is a symbiotic binary?', 'A binary system with interacting stars of different evolutionary stages', ['Two colliding galaxies', 'Two orbiting planets', 'A double asteroid']),
    question('What is a cosmic ray?', 'A high-energy particle arriving from space', ['A visible light beam', 'A sound wave', 'A meteor trail']),
    question('What is the Chandrasekhar mass limit relevant to?', 'White dwarf stability', ['Planet formation', 'Galaxy rotation', 'Comet brightness']),
    question('What is an ultra-luminous X-ray source?', 'A very bright non-nuclear X-ray source outside a galaxy nucleus', ['A solar eclipse', 'A radio planet', 'A bright comet']),
  ],
  veryHard: [
    question('What is the Tolman-Oppenheimer-Volkoff limit?', 'The maximum mass of a neutron star', ['The age of the universe', 'A galaxy brightness limit', 'A planet density scale']),
    question('What is Hawking radiation caused by?', 'Quantum effects near a black hole horizon', ['Fusion in a star', 'Solar wind pressure', 'Dark matter collisions']),
    question('What is baryogenesis?', 'The origin of the matter-antimatter asymmetry', ['The birth of a galaxy', 'A planet formation process', 'A star cooling phase']),
    question('What is the inflation epoch?', 'A very rapid early expansion of the universe', ['A star expansion phase', 'A moon formation event', 'A galaxy collision']),
    question('What does the cosmological constant represent in standard cosmology?', 'Dark energy density', ['Neutron pressure', 'Stellar metallicity', 'Magnetic field strength']),
    question('What is a quasar powered by?', 'An accreting supermassive black hole', ['A giant comet', 'A neutron-star crust', 'A planetary core']),
    question('What is the Sachs-Wolfe effect?', 'CMB temperature shifts from gravitational potentials', ['A solar wind cycle', 'A planet transit', 'A stellar nucleosynthesis chain']),
    question('What is a Type II supernova progenitor?', 'A massive star with a collapsing core', ['A small asteroid', 'A white dwarf alone', 'A brown dwarf']),
    question('What is the cosmic neutrino background?', 'Relic neutrinos from the early universe', ['A solar wind stream', 'A galaxy gas cloud', 'A radio telescope artifact']),
    question('What does metallicity mean in stellar astronomy?', 'The abundance of elements heavier than helium', ['The star magnetic field', 'The star rotation speed', 'The planet iron core size']),
    question('What is an accretion disk?', 'A rotating disk of infalling matter', ['A galaxy ring of stars', 'A planet ring system', 'A lunar shadow']),
    question('What is the no-hair theorem about?', 'The limited observable properties of stationary black holes', ['The shape of comets', 'The color of stars', 'The structure of nebulae']),
    question('What is recombination in cosmology?', 'The era when electrons joined nuclei to form neutral atoms', ['A galaxy merger', 'A star explosion', 'A planet atmosphere loss']),
    question('What is the cosmic horizon?', 'The limit beyond which signals cannot reach us', ['The edge of a planet', 'A stellar surface', 'A telescope mirror']),
    question('What is a magnetar?', 'A neutron star with an extreme magnetic field', ['A magnetic planet', 'A young galaxy', 'A charged comet']),
    question('What is the Hubble tension?', 'A disagreement between measurements of the expansion rate', ['A telescope vibration', 'A planet orbit error', 'A star brightness cycle']),
    question('What is an active galactic nucleus?', 'A luminous central region powered by accretion onto a black hole', ['A newborn planet', 'A comet cloud', 'A stellar nursery only']),
    question('What is the Penrose process?', 'A way a rotating black hole can lose energy', ['A method of star formation', 'A lunar orbit', 'A rocket maneuver']),
    question('What is quark matter?', 'Matter composed of deconfined quarks under extreme conditions', ['Ordinary gas', 'Planet rock', 'Interstellar dust']),
    question('What is the cosmological redshift-distance relation used to study?', 'Expansion of the universe', ['Planet interiors', 'Solar flares', 'Comet chemistry']),
    question('What is a Population III star?', 'A hypothetical first generation of metal-free stars', ['A third planet', 'A neutron star class', 'A galaxy satellite']),
    question('What is the Jeans instability?', 'Gravitational collapse when pressure cannot support a gas cloud', ['A black hole evaporation', 'A planetary transit', 'A rocket failure']),
    question('What is a Type Ia supernova useful for?', 'Measuring cosmological distances', ['Finding exoplanet moons', 'Mapping asteroid surfaces', 'Timing eclipses only']),
    question('What is the Schwarzschild metric?', 'A solution describing spacetime outside a non-rotating spherical mass', ['A star catalog', 'A rocket equation', 'A planet map']),
    question('What is dark matter inferred from?', 'Its gravitational effects', ['Its visible glow', 'Its radio broadcasts', 'Its atmospheric pressure']),
    question('What is a gravitational wave?', 'A ripple in spacetime produced by accelerating massive objects', ['A solar wind gust', 'A sound wave in space', 'A telescope vibration']),
    question('What is the last scattering surface?', 'The region from which the CMB last scattered toward us', ['A star’s core', 'A comet surface', 'A galaxy boundary']),
    question('What is the virial theorem used for in astrophysics?', 'Relating kinetic and potential energies in bound systems', ['Naming planets', 'Measuring moon phases', 'Designing heat shields']),
    question('What is a white dwarf cooling sequence?', 'The progressive fading and cooling of stellar remnants', ['A planet migration path', 'A comet orbit class', 'A galaxy merger stage']),
    question('What is vacuum decay?', 'A hypothetical transition to a lower-energy vacuum state', ['A rocket fuel leak', 'A star wind', 'A moon collapse']),
  ],
};

export const QUIZ_DIFFICULTIES_CONFIG = {
  easy: {
    id: 'easy',
    label: 'Cadet Quiz',
    tierList: ['easy'],
    multiplier: 0.25,
    color: '#34d399',
    desc: '5 fundamental questions for recruits (0.25x XP multiplier).',
  },
  medium: {
    id: 'medium',
    label: 'Officer Exam',
    tierList: ['medium'],
    multiplier: 1.4,
    color: '#38bdf8',
    desc: '5 intermediate questions on solar physics & space probes.',
  },
  hard: {
    id: 'hard',
    label: 'Commander Challenge',
    tierList: ['hard'],
    multiplier: 2.2,
    color: '#f59e0b',
    desc: '5 hard astrophysics questions on black holes & relativity.',
  },
  master: {
    id: 'master',
    label: 'Very Hard · Cosmic Master',
    tierList: ['medium', 'hard', 'veryHard'],
    multiplier: 3.5,
    color: '#a855f7',
    desc: 'A demanding astrophysics gauntlet with no beginner questions.',
  },
};

const MEMORY_PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const MEMORY_SETTINGS = {
  easy: { id: 'easy', label: 'Easy · Cadet', pairs: 4, seconds: 90, multiplier: 0.25, color: '#34d399', desc: '4 planet pairs · 90s life support · 0.25x XP multiplier' },
  medium: { id: 'medium', label: 'Medium · Officer', pairs: 6, seconds: 75, multiplier: 1.4, color: '#38bdf8', desc: '6 planet pairs · 75s life support' },
  hard: { id: 'hard', label: 'Hard · Commander', pairs: 8, seconds: 60, multiplier: 2.2, color: '#f59e0b', desc: '8 planet pairs · 60s life support' },
  master: { id: 'master', label: 'Very Hard · Master', pairs: 8, seconds: 45, multiplier: 3.5, color: '#a855f7', desc: '8 planet pairs · 45s life support · 3.5x XP multiplier' },
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

const AstroGames = ({ user, profile, setActivePage }) => {
  // Modes: 'arcade' | 'meteor-setup' | 'meteor' | 'memory-setup' | 'memory' | 'quiz-setup' | 'quiz' | 'records'
  const [gameMode, setGameMode] = useState('arcade');

  // Player Rank & Total XP State
  const playerName = profile?.username || profile?.name || user?.name || user?.email || 'Cadet Pilot';
  const [totalXp, setTotalXp] = useState(() => getUserTotalXP(playerName));
  const rankInfo = useMemo(() => getRankFromXP(totalXp), [totalXp]);

  // Daily Login Bonus State & XP System Guide
  const [dailyBonusMsg, setDailyBonusMsg] = useState('');
  const [showXpGuide, setShowXpGuide] = useState(false);

  useEffect(() => {
    const claimRes = claimDailyLoginXP(playerName);
    if (claimRes.claimed) {
      setDailyBonusMsg(claimRes.message);
      setTotalXp(getUserTotalXP(playerName));
      const t = setTimeout(() => setDailyBonusMsg(''), 7000);
      return () => clearTimeout(t);
    }
  }, [playerName]);

  useEffect(() => {
    if (!showXpGuide) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowXpGuide(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showXpGuide]);

  useEffect(() => {
    let cancelled = false;
    fetchAstrogameRecords({ game: 'global', timeframe: 'all' })
      .then((records) => {
        if (cancelled) return;
        const identity = String(user?.id || user?.email || profile?.email || playerName).toLowerCase();
        const current = records.find((record) => (
          String(record.userId || record.userEmail || record.name || '').toLowerCase() === identity
          || String(record.name || '').toLowerCase() === String(playerName).toLowerCase()
        ));
        if (current) setTotalXp(Math.max(getUserTotalXP(playerName), Number(current.xp) || 0));
      })
      .catch(() => {
        // Local XP remains available when the backend is offline.
      });
    return () => {
      cancelled = true;
    };
  }, [playerName, profile?.email, user?.email, user?.id]);

  // Weekly Reset Timer
  const [weeklyTime, setWeeklyTime] = useState(getWeeklyResetTimeLeft());
  useEffect(() => {
    const interval = setInterval(() => setWeeklyTime(getWeeklyResetTimeLeft()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Meteor Dash State
  const [dashDifficulty, setDashDifficulty] = useState('medium');
  const [dashScore, setDashScore] = useState(0);
  const [dashDistance, setDashDistance] = useState(0);
  const [dashShields, setDashShields] = useState(100);
  const [dashMaxShields, setDashMaxShields] = useState(100);
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
    maxShields: 100,
    empReady: true,
    empCooldown: 0,
    maxEmpCooldown: 300,
    combo: 0,
    speed: 3.8,
    multiplier: 1.5,
    difficulty: 'medium',
    frameCount: 0,
    keys: {},
    touchPointerId: null,
    touchTarget: null,
    gameOver: false,
    recordSaved: false,
  });

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

  // Astro Quiz State
  const [quizDifficulty, setQuizDifficulty] = useState('easy');
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const [quizFullscreen, setQuizFullscreen] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const [quizName, setQuizName] = useState(playerName);
  const [popup, setPopup] = useState(null);
  const quizPanelRef = useRef(null);
  const quizTimeoutsRef = useRef([]);

  // Records & Leaderboard State
  const [recordsList, setRecordsList] = useState([]);
  const [leaderboardSection, setLeaderboardSection] = useState('xp');
  const [recordsTab, setRecordsTab] = useState('global'); // 'global' | 'meteor-dash' | 'orbit-match' | 'astro-quiz'
  const [recordsTimeframe, setRecordsTimeframe] = useState('weekly'); // 'weekly' | 'all'
  const [recordsDifficultyFilter, setRecordsDifficultyFilter] = useState('all');
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');

  const memorySettings = MEMORY_SETTINGS[memoryDifficulty];

  // Canvas Resize Effect for Meteor Dash
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
      setDashCanvasSize((curr) => (
        curr && Math.abs(curr.width - width) < 1 && Math.abs(curr.height - height) < 1
          ? curr
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
  const initMeteorDash = useCallback((diffKey = dashDifficulty) => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 520;
    const h = canvas ? canvas.height : 640;
    const diffConfig = METEOR_DIFFICULTIES[diffKey] || METEOR_DIFFICULTIES.medium;

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
      shields: diffConfig.shields,
      maxShields: diffConfig.shields,
      empReady: true,
      empCooldown: 0,
      maxEmpCooldown: diffConfig.empCooldown,
      combo: 0,
      speed: diffConfig.speed,
      baseSpeed: diffConfig.speed,
      maxSpeed: diffConfig.maxSpeed || 8,
      speedAccel: diffConfig.speedAccel || 0.2,
      spawnIntervalBase: diffConfig.spawnIntervalBase,
      minSpawnInterval: diffConfig.minSpawnInterval || 15,
      multiplier: diffConfig.multiplier,
      difficulty: diffKey,
      frameCount: 0,
      keys: {},
      touchPointerId: null,
      touchTarget: null,
      gameOver: false,
      recordSaved: false,
    };

    setDashScore(0);
    setDashDistance(0);
    setDashShields(diffConfig.shields);
    setDashMaxShields(diffConfig.shields);
    setDashEmpReady(true);
    setDashCombo(0);
    setDashGameOver(false);
    setDashGameStarted(true);
    setGameMode('meteor');
  }, [dashDifficulty]);

  const triggerEmpPulse = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.empReady || state.gameOver) return;

    state.empReady = false;
    state.empCooldown = state.maxEmpCooldown;
    setDashEmpReady(false);

    state.empBlast = {
      x: state.ship.x,
      y: state.ship.y,
      radius: 10,
      maxRadius: 360,
      alpha: 1,
    };

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
    state.score += Math.round(vaporizedCount * 25 * state.multiplier);
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
    if (gameMode !== 'meteor' || !dashGameStarted) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    let cancelled = false;

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
      if (cancelled) return;
      if (state.gameOver) {
        if (!state.recordSaved) {
          state.recordSaved = true;
          setDashGameOver(true);

          let xpEarned = Math.round(state.score * 0.5 + state.distance * 0.1);
          if (state.difficulty === 'easy') xpEarned = Math.min(35, xpEarned);
          const pName = profile?.username || profile?.name || user?.name || user?.email || 'Cadet Pilot';

          saveAstrogameRecord({
            game: 'meteor-dash',
            name: pName,
            userName: pName,
            userId: user?.id || null,
            userEmail: user?.email || profile?.email || null,
            score: state.score,
            distance: state.distance,
            difficulty: state.difficulty,
            xp: xpEarned,
            won: false,
          }).then(() => {
            setTotalXp(getUserTotalXP(pName));
          });

          if (state.score > dashHighScore) {
            setDashHighScore(state.score);
            try {
              localStorage.setItem('astro_dash_highscore', state.score);
            } catch (e) {
              console.warn(e);
            }
          }
        }
        return;
      }

      state.frameCount++;
      state.distance += Math.round(state.speed * 0.3);
      if (state.frameCount % 15 === 0) {
        state.score += Math.round((1 + Math.floor(state.combo / 4)) * state.multiplier);
      }

      // Speed progression over time
      if (state.frameCount % 360 === 0) {
        state.speed = Math.min(state.maxSpeed, state.speed + state.speedAccel);
      }

      // EMP Cooldown tracking
      if (!state.empReady) {
        state.empCooldown--;
        if (state.empCooldown <= 0) {
          state.empReady = true;
          setDashEmpReady(true);
        }
      }

      // Ship Steering & Inertia
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

      // Thruster Trail Particles
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

      // Meteor Spawning
      const spawnInterval = Math.max(
        state.minSpawnInterval,
        state.spawnIntervalBase - Math.floor(state.distance / 400)
      );
      if (state.frameCount % spawnInterval === 0) {
        const isRare = Math.random() < 0.12;
        const radius = isRare ? Math.random() * 8 + 14 : Math.random() * 18 + 14;
        const varFactor = state.difficulty === 'easy' ? 0.4 : state.difficulty === 'medium' ? 0.8 : 1.8;
        state.meteors.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: -radius - 10,
          radius,
          speed: state.speed + (Math.random() - 0.3) * varFactor,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          isEnergyShard: isRare,
          color: isRare ? '#38bdf8' : '#a1a1aa',
        });
      }

      // Meteor Updates & Collisions
      for (let i = state.meteors.length - 1; i >= 0; i--) {
        const m = state.meteors[i];
        m.y += m.speed;
        m.rotation += m.rotSpeed;

        const dist = Math.hypot(m.x - state.ship.x, m.y - state.ship.y);
        const hitDistance = m.radius + state.ship.w / 2;

        if (dist < hitDistance) {
          if (m.isEnergyShard) {
            state.shields = Math.min(state.maxShields, state.shields + 35);
            state.score += Math.round(50 * state.multiplier);
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
            const damage = Math.round(m.radius * 1.4);
            state.shields -= damage;
            state.combo = 0;

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

        if (!m.passed && dist < hitDistance + 24 && m.y > state.ship.y) {
          m.passed = true;
          state.combo += 1;
          state.score += Math.round(8 * Math.min(state.combo, 5) * state.multiplier);
        }

        if (m.y > canvas.height + 60) {
          state.meteors.splice(i, 1);
        }
      }

      // Parallax Stars
      state.stars.forEach((s) => {
        s.y += s.speed * (state.speed / 3);
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });

      // Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.024;
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // EMP Blast Wave
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

      /* ================= CANVAS DRAWING ================= */
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      state.stars.forEach((s) => {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // EMP Wave
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
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(m.radius * 0.25, -m.radius * 0.25, m.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(-m.radius * 0.3, m.radius * 0.3, m.radius * 0.25, 0, Math.PI * 2);
          ctx.fill();

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

      if (state.shields > 0) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 + (state.shields / state.maxShields) * 0.35})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, state.ship.w * 0.85, state.ship.h * 0.75, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = METEOR_DIFFICULTIES[dashDifficulty]?.color || '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -state.ship.h / 2);
      ctx.lineTo(state.ship.w / 2, state.ship.h / 2);
      ctx.lineTo(0, state.ship.h / 2 - 8);
      ctx.lineTo(-state.ship.w / 2, state.ship.h / 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -state.ship.h / 2 + 6);
      ctx.lineTo(state.ship.w / 4, state.ship.h / 2 - 4);
      ctx.lineTo(-state.ship.w / 4, state.ship.h / 2 - 4);
      ctx.closePath();
      ctx.fill();

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
      cancelled = true;
      state.gameOver = true;
      cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dashGameStarted, gameMode, dashHighScore, triggerEmpPulse, dashDifficulty, user, profile]);

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
    const configMult = memoryDifficulty === 'hard' ? 2.2 : memoryDifficulty === 'medium' ? 1.4 : 0.25;
    const score = Math.round((memoryResult.matched * 120 + (memoryResult.won ? (memoryResult.seconds - memoryResult.elapsed) * 15 : 0)) * configMult);
    let xpEarned = Math.round(score * 0.85);
    if (memoryDifficulty === 'easy') xpEarned = Math.min(35, xpEarned);

    saveAstrogameRecord({
      game: 'orbit-match',
      name: memoryResult.name,
      userName: memoryResult.name,
      userId: memoryResult.userId,
      userEmail: memoryResult.userEmail,
      score: score,
      total: memoryResult.pairs * 120,
      difficulty: memoryResult.difficulty,
      won: memoryResult.won,
      guesses: memoryResult.moves,
      timeSec: memoryResult.elapsed,
      pct: Math.round((memoryResult.matched / memoryResult.pairs) * 100),
      xp: xpEarned,
    })
      .then(() => {
        if (!cancelled) {
          setMemoryRecordState('saved');
          setTotalXp(getUserTotalXP(memoryResult.name));
        }
      })
      .catch(() => { if (!cancelled) setMemoryRecordState('failed'); });
    return () => { cancelled = true; };
  }, [memoryResult, memoryDifficulty]);

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
      name: playerName,
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

  const loadLeaderboards = async () => {
    setRecordsLoading(true);
    setRecordsError('');
    try {
      const records = await fetchAstrogameRecords({
        game: recordsTab,
        timeframe: recordsTimeframe,
        difficulty: recordsDifficultyFilter,
      });
      setRecordsList(Array.isArray(records) ? records : []);
    } catch {
      setRecordsError('Leaderboard entries could not be fetched. Displaying local cached logs.');
    } finally {
      setRecordsLoading(false);
    }
  };

  const openLeaderboard = (tab = 'global') => {
    setRecordsTab(tab);
    setLeaderboardSection(tab === 'global' ? 'xp' : 'games');
    setGameMode('records');
  };

  useEffect(() => {
    if (gameMode === 'records') {
      loadLeaderboards();
    }
  }, [gameMode, recordsTab, recordsTimeframe, recordsDifficultyFilter]);

  const startQuiz = () => {
    const pName = quizName.trim() || playerName;
    if (!pName) return;

    const config = QUIZ_DIFFICULTIES_CONFIG[quizDifficulty] || QUIZ_DIFFICULTIES_CONFIG.easy;

    const tiers = config.tierList.length === 1
      ? Array.from({ length: quizQuestionCount }, () => config.tierList[0])
      : Array.from({ length: quizQuestionCount }, (_, index) => config.tierList[index % config.tierList.length]);
    const usedQuestions = new Set();
    const preparedQuestions = tiers.map((tier) => {
      const available = quizBank[tier].filter((item) => !usedQuestions.has(item.question));
      const selected = shuffle(available.length ? available : quizBank[tier])[0];
      usedQuestions.add(selected.question);
      return { ...selected, tier, options: shuffle(selected.options) };
    });

    setQuestions(preparedQuestions);
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
    quizTimeoutsRef.current.push(
      window.setTimeout(() => setPopup(null), 1000),
      window.setTimeout(() => advanceQuestion(answer), 1400),
    );
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

    const correctCount = nextAnswers.filter((ans, idx) => ans === questions[idx]?.answer).length;
    const config = QUIZ_DIFFICULTIES_CONFIG[quizDifficulty] || QUIZ_DIFFICULTIES_CONFIG.easy;
    const elapsed = Math.floor((Date.now() - (startedAt || Date.now())) / 1000);
    const speedBonus = Math.max(0, 60 - elapsed) * 5;
    const finalScore = Math.round((correctCount * 200 + speedBonus) * config.multiplier);
    let xpEarned = Math.round(finalScore * 0.5);
    if (quizDifficulty === 'easy') xpEarned = Math.min(35, xpEarned);
    const pName = quizName.trim() || playerName;

    setFinished(true);
    setSaveState('saving');

    saveAstrogameRecord({
      game: 'astro-quiz',
      name: pName,
      userName: pName,
      userId: user?.id || null,
      userEmail: user?.email || profile?.email || null,
      score: finalScore,
      total: questions.length * 200,
      difficulty: quizDifficulty,
      won: correctCount >= Math.ceil(questions.length * 0.6),
      correct: correctCount,
      timeSec: elapsed,
      xp: xpEarned,
    })
      .then(() => {
        setSaveState('saved');
        setTotalXp(getUserTotalXP(pName));
      })
      .catch(() => setSaveState('failed'));
  };

  const resetQuiz = (nextMode = 'arcade') => {
    quizTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    quizTimeoutsRef.current = [];
    setQuestions([]);
    setAnswers([]);
    setSelectedAnswer(null);
    setCurrent(0);
    setFinished(false);
    setStartedAt(null);
    setElapsedSeconds(0);
    setSaveState('idle');
    setPopup(null);
    if (document.fullscreenElement) document.exitFullscreen?.();
    setQuizFullscreen(false);
    setGameMode(nextMode);
  };

  const toggleQuizFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (quizPanelRef.current?.requestFullscreen) {
        await quizPanelRef.current.requestFullscreen();
      }
    } catch {
      setQuizFullscreen((value) => !value);
    }
  };

  useEffect(() => {
    const syncFullscreen = () => setQuizFullscreen(document.fullscreenElement === quizPanelRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const activeQuestion = questions[current];
  const displayCorrect = answers.filter((ans, idx) => ans === questions[idx]?.answer).length;
  const isWrongPick = selectedAnswer && activeQuestion && selectedAnswer !== activeQuestion.answer;

  return (
    <div className={`page-content astrogames-page ${gameMode === 'quiz' ? 'quiz-active' : ''} ${gameMode === 'quiz' && !questions.length ? 'quiz-home' : ''} ${gameMode === 'meteor' ? 'meteor-page-active' : ''}`}>
      
      {/* ================= ARCADE LOBBY ================= */}
      {gameMode === 'arcade' && (
        <section className="arcade-lobby">
          {/* User Rank & Callsign Profile Header */}
          <div className="arcade-pilot-card">
            <div className="arcade-pilot-info">
              <div className="arcade-pilot-badge" style={{ backgroundColor: rankInfo.bg, borderColor: rankInfo.color }}>
                <span className="pilot-rank-icon">{rankInfo.icon}</span>
              </div>
              <div>
                <div className="arcade-pilot-row">
                  <strong className="arcade-pilot-name">{playerName}</strong>
                  <span className="arcade-pilot-rank" style={{ color: rankInfo.color, borderColor: rankInfo.color }}>
                    {rankInfo.tier} · {rankInfo.title}
                  </span>
                </div>
                <div className="arcade-xp-bar-wrap">
                  <div className="arcade-xp-bar-track">
                    <div
                      className="arcade-xp-bar-fill"
                      style={{
                        width: `${rankInfo.nextXp ? Math.min(100, Math.max(5, ((totalXp - rankInfo.minXp) / (rankInfo.nextXp - rankInfo.minXp)) * 100)) : 100}%`,
                        backgroundColor: rankInfo.color,
                      }}
                    />
                  </div>
                  <span className="arcade-xp-text">
                    <strong>{totalXp} XP</strong> {rankInfo.nextXp ? `/ ${rankInfo.nextXp} XP to next rank` : '· Max Rank Tier'}
                  </span>
                </div>
              </div>
            </div>

            <div className="arcade-weekly-reset-pill">
              <Clock3 size={14} />
              <div>
                <small>WEEKLY RESET</small>
                <strong>{weeklyTime.formatted}</strong>
              </div>
            </div>
          </div>

          {/* Daily Login Reward Toast Banner */}
          {dailyBonusMsg && (
            <div className="admin-status" style={{ background: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399', color: '#34d399', marginBottom: '16px' }}>
              {dailyBonusMsg}
            </div>
          )}

          <div className="arcade-lobby-heading">
            <div className="arcade-heading-row">
              <span className="arcade-kicker">
                <Sparkles size={14} /> Astro Club Space Arcade
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isExperimentalXpMarketEnabled() && (
                  <button className="arcade-records-link" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }} onClick={() => setShowXpGuide(true)}>
                    <Sparkles size={14} /> XP &amp; Market Guide
                  </button>
                )}
                <button className="arcade-records-link" onClick={() => openLeaderboard('global')}>
                  <Trophy size={15} /> Global Leaderboards
                </button>
              </div>
            </div>
            <h1>Cosmic Simulators</h1>
            <p>Engage in supersonic meteor evasion, planetary memory grids, and astrophysical academy exams with dynamic difficulty modes and verified global rankings.</p>
          </div>

          {/* XP Academy & Market Guide Modal */}
          {showXpGuide && (
            <div
              className="xp-guide-overlay"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setShowXpGuide(false);
              }}
            >
              <div className="xp-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="xp-guide-title">
                <div className="xp-guide-header">
                  <div>
                    <span className="xp-guide-kicker">AstroGames progression</span>
                    <h2 id="xp-guide-title">XP guide</h2>
                  </div>
                  <button className="xp-guide-close" aria-label="Close XP guide" onClick={() => setShowXpGuide(false)}>Close</button>
                </div>
                <p className="xp-guide-intro">A quick overview of how experience, ranks, and cosmetics work.</p>
                <div className="xp-guide-content">
                  <div className="xp-guide-item">
                    <strong>Daily login reward</strong>
                    <p>Sign in once per day to receive 100 XP.</p>
                  </div>
                  <div className="xp-guide-item">
                    <strong>Difficulty rewards</strong>
                    <p>Easy mode gives reduced XP and is capped at 35 XP. Higher difficulties provide larger rewards.</p>
                  </div>
                  <div className="xp-guide-item">
                    <strong>Rank thresholds</strong>
                    <div className="xp-rank-list">
                      <span>Bronze · 0 XP</span><span>Silver · 500 XP</span>
                      <span>Gold · 2,000 XP</span><span>Platinum · 6,000 XP</span>
                      <span>Diamond · 15,000 XP</span><span>Mythic · 35,000 XP</span>
                    </div>
                  </div>
                  <div className="xp-guide-item">
                    <strong>Profile and cosmetics</strong>
                    <p>XP is included in your public profile and XP rankings. Cosmetic previews and experimental effects are managed by administrators.</p>
                  </div>
                </div>
                <div className="xp-guide-footer"><button className="btn btn-primary" onClick={() => setShowXpGuide(false)}>Done</button></div>
              </div>
            </div>
          )}

          <div className="arcade-game-grid">
            {/* Meteor Dash Card */}
            <article className="arcade-game-card arcade-meteor-card" onClick={() => setGameMode('meteor-setup')}>
              <div className="arcade-card-icon">
                <Flame size={24} />
              </div>
              <span className="arcade-card-type">KINETIC FLIGHT // ROCKET DASH</span>
              <strong>Meteor Dash</strong>
              <p className="arcade-card-description">
                Piloting through hyper-dense asteroid streams. Choose your pilot difficulty, dodge space debris, collect quantum shards, and blast EMP shockwaves.
              </p>
              <div className="arcade-card-action">
                <span>Select Difficulty &amp; Launch</span>
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
                Scan and pair planetary systems under strict life-support timers.                 Easy, Medium, Hard, and Very Hard scanner options.
              </p>
              <div className="arcade-card-action">
                <span>Start Scanner</span>
                <ChevronRight size={16} />
              </div>
            </article>

            {/* Astro Quiz Card */}
            <article className="arcade-game-card" onClick={() => setGameMode('quiz-setup')}>
              <div className="arcade-card-icon">
                <Trophy size={24} />
              </div>
              <span className="arcade-card-type">ACADEMY BRIEF // ASTRO QUIZ</span>
              <strong>Astro Quiz</strong>
              <p className="arcade-card-description">
                Test your space science, astrophysics, and space exploration mastery. Cadet, Officer, Commander, and Cosmic Master difficulties.
              </p>
              <div className="arcade-card-action">
                <span>Take Exam</span>
                <ChevronRight size={16} />
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ================= METEOR DASH SETUP ================= */}
      {gameMode === 'meteor-setup' && (
        <section className="arcade-play-panel setup-panel">
          <button className="arcade-back-button" onClick={() => setGameMode('arcade')}>
            <ArrowLeft size={16} /> Arcade Hub
          </button>
          <div className="arcade-play-heading">
            <span className="arcade-kicker">KINETIC FLIGHT SETUP</span>
            <h1>Rocket Game Difficulty</h1>
            <p>Select your flight stream difficulty level before launching your recon vessel into the asteroid belt.</p>
          </div>

          <div className="setup-difficulty-grid">
            {Object.entries(METEOR_DIFFICULTIES).map(([key, cfg]) => (
              <button
                key={key}
                className={`setup-diff-card ${dashDifficulty === key ? 'active' : ''}`}
                style={{ '--diff-color': cfg.color }}
                onClick={() => setDashDifficulty(key)}
              >
                <div className="diff-card-header">
                  <strong>{cfg.label}</strong>
                  <span className="diff-multiplier">{cfg.multiplier}x Points &amp; XP</span>
                </div>
                <p className="diff-desc">{cfg.desc}</p>
                <div className="diff-specs">
                  <span>Shields: {cfg.shields}%</span>
                  <span>EMP: {cfg.empCooldown / 60}s</span>
                </div>
              </button>
            ))}
          </div>

          <button className="btn btn-primary setup-launch-button" onClick={() => initMeteorDash(dashDifficulty)}>
            <Flame size={18} /> Launch Rocket ({METEOR_DIFFICULTIES[dashDifficulty]?.label})
          </button>
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
                <span className="hud-label">DIFFICULTY</span>
                <span className="hud-diff-tag" style={{ color: METEOR_DIFFICULTIES[dashDifficulty]?.color }}>
                  {METEOR_DIFFICULTIES[dashDifficulty]?.label} ({METEOR_DIFFICULTIES[dashDifficulty]?.multiplier}x)
                </span>
              </div>

              <div className="hud-item">
                <span className="hud-label">SHIELDS</span>
                <div className="hud-shield-bar-wrap">
                  <div
                    className="hud-shield-fill"
                    style={{
                      width: `${(dashShields / dashMaxShields) * 100}%`,
                      background: dashShields > 40 ? METEOR_DIFFICULTIES[dashDifficulty]?.color : '#ef4444',
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
                  <p>Your vessel was destroyed in the {METEOR_DIFFICULTIES[dashDifficulty]?.label} asteroid stream.</p>

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
                      <small>XP EARNED</small>
                      <strong>+{Math.round(dashScore * 0.5 + dashDistance * 0.1)} XP</strong>
                    </div>
                  </div>

                  <div className="gameover-actions">
                    <button className="btn btn-primary" onClick={() => initMeteorDash(dashDifficulty)}>
                      <RotateCcw size={15} /> Re-Launch Vessel
                    </button>
                    <button className="btn btn-secondary" onClick={() => setGameMode('meteor-setup')}>
                      Change Difficulty
                    </button>
                    <button className="btn btn-secondary" onClick={() => openLeaderboard('meteor-dash')}>
                      View Leaderboards
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Touch Controls Overlay */}
          <div className="meteor-touch-controls" ref={dashControlsRef}>
            <div className="touch-steering-hint">
              <span className="touch-hint-mobile">Drag anywhere in flight window to steer · EMP clears nearby meteors</span>
              <span className="touch-hint-desktop">Use Arrow Keys / WASD to steer · SPACE for EMP shockwave</span>
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

      {/* ================= ORBIT MATCH SETUP ================= */}
      {gameMode === 'memory-setup' && (
        <section className="arcade-play-panel setup-panel">
          <button className="arcade-back-button" onClick={() => setGameMode('arcade')}>
            <ArrowLeft size={16} /> Arcade Hub
          </button>
          <div className="arcade-play-heading">
            <span className="arcade-kicker">COGNITIVE SCANNER SETUP</span>
            <h1>Orbit Match Difficulty</h1>
            <p>Select an Easy, Medium, Hard, or Very Hard scanner run before oxygen runs out.</p>
          </div>

          <div className="setup-difficulty-grid">
            {Object.entries(MEMORY_SETTINGS).map(([key, cfg]) => (
              <button
                key={key}
                className={`setup-diff-card ${memoryDifficulty === key ? 'active' : ''}`}
                style={{ '--diff-color': cfg.color }}
                onClick={() => setMemoryDifficulty(key)}
              >
                <div className="diff-card-header">
                  <strong>{cfg.label} Scanner</strong>
                  <span className="diff-multiplier">{cfg.multiplier}x Points &amp; XP</span>
                </div>
                <p className="diff-desc">{cfg.desc}</p>
                <div className="diff-specs">
                  <span>Pairs: {cfg.pairs}</span>
                  <span>Timer: {cfg.seconds}s</span>
                </div>
              </button>
            ))}
          </div>

          <button className="btn btn-primary setup-launch-button" onClick={startMemoryRun}>
            <Satellite size={18} /> Initiate Scanner ({MEMORY_SETTINGS[memoryDifficulty].label})
          </button>
        </section>
      )}

      {/* ================= ORBIT MATCH GAME ================= */}
      {gameMode === 'memory' && (
        <section className="arcade-play-panel">
          <button className="arcade-back-button" onClick={() => setGameMode('arcade')}>
            <ArrowLeft size={16} /> Arcade Hub
          </button>
          <div className="arcade-play-heading">
            <span className="arcade-kicker">ORBIT MATCH // {MEMORY_SETTINGS[memoryDifficulty].label.toUpperCase()}</span>
            <h1>Planetary Grid</h1>
            <p>Match planet pairs before life-support oxygen depletes.</p>
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
                ? 'Run logged to Weekly Leaderboard & XP!'
                : memoryRecordState === 'saving'
                ? 'Saving run...'
                : `${MEMORY_SETTINGS[memoryDifficulty].label} scanner`}
            </span>
            <button className="arcade-inline-button" onClick={startMemoryRun}>
              <RotateCcw size={15} /> Restart
            </button>
          </div>

          {memoryResult && (
            <div className="memory-result-panel">
              <strong>{memoryResult.won ? 'All planets verified!' : 'Time expired.'}</strong>
              <span>
                {memoryResult.matched} of {memoryResult.pairs} pairs · {memoryResult.moves} moves · {formatElapsed(memoryResult.elapsed)}
              </span>
              <button className="arcade-inline-button" onClick={() => openLeaderboard('orbit-match')}>
                <Trophy size={15} /> View Leaderboards
              </button>
            </div>
          )}
        </section>
      )}

      {/* ================= ASTRO QUIZ SETUP ================= */}
      {gameMode === 'quiz-setup' && (
        <section className="arcade-play-panel setup-panel">
          <button className="arcade-back-button" onClick={() => setGameMode('arcade')}>
            <ArrowLeft size={16} /> Arcade Hub
          </button>
          <div className="arcade-play-heading">
            <span className="arcade-kicker">ACADEMY BRIEFING SETUP</span>
            <h1>Astro Quiz Difficulty</h1>
            <p>Select your exam difficulty level to test your space science and astrophysics mastery.</p>
          </div>

          <div className="setup-difficulty-grid">
            {Object.entries(QUIZ_DIFFICULTIES_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className={`setup-diff-card ${quizDifficulty === key ? 'active' : ''}`}
                style={{ '--diff-color': cfg.color }}
                onClick={() => setQuizDifficulty(key)}
              >
                <div className="diff-card-header">
                  <strong>{cfg.label}</strong>
                  <span className="diff-multiplier">{cfg.multiplier}x Score &amp; XP</span>
                </div>
                <p className="diff-desc">{cfg.desc}</p>
                <div className="diff-specs">
                  <span>5–15 questions</span>
                  <span>Time bonus enabled</span>
                </div>
              </button>
            ))}
          </div>

          <div className="quiz-question-count">
            <div className="quiz-question-count-heading">
              <label htmlFor="quiz-question-count">Question count</label>
              <div className="quiz-question-count-value">
                <input
                  id="quiz-question-count-value"
                  type="number"
                  min="5"
                  max="15"
                  step="1"
                  value={quizQuestionCount}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (Number.isFinite(nextValue)) {
                      setQuizQuestionCount(Math.min(15, Math.max(5, nextValue)));
                    }
                  }}
                  aria-label="Enter number of quiz questions"
                />
                <span>questions</span>
              </div>
            </div>
            <div className="quiz-flight-track">
              <div
                className="quiz-flight-progress"
                style={{ width: `${((quizQuestionCount - 5) / 10) * 100}%` }}
                aria-hidden="true"
              />
              <div
                className="quiz-rocket-marker"
                style={{ left: `${((quizQuestionCount - 5) / 10) * 100}%` }}
                aria-hidden="true"
              >
                <span className="quiz-rocket-flame" />
                <span className="quiz-rocket-body"><span className="quiz-rocket-window" /></span>
              </div>
              <input
                id="quiz-question-count"
                className="quiz-question-slider"
                type="range"
                min="5"
                max="15"
                step="1"
                value={quizQuestionCount}
                onChange={(event) => setQuizQuestionCount(Number(event.target.value))}
                aria-valuemin="5"
                aria-valuemax="15"
                aria-valuenow={quizQuestionCount}
                aria-label="Number of quiz questions"
              />
            </div>
            <div className="quiz-question-scale" aria-hidden="true">
              <span>5 · Quick flight</span><span>10 · Mission</span><span>15 · Deep run</span>
            </div>
            <p>Questions are selected from a large difficulty-specific bank without repeating within a run.</p>
          </div>

          <div className="quiz-name-box">
            <label htmlFor="quiz-player-callsign">Cadet Callsign for Roster:</label>
            <input
              id="quiz-player-callsign"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Enter callsign"
            />
          </div>

          <button className="btn btn-primary setup-launch-button" onClick={startQuiz}>
            <Gamepad2 size={18} /> Begin Exam ({QUIZ_DIFFICULTIES_CONFIG[quizDifficulty].label})
          </button>
        </section>
      )}

      {/* ================= ASTRO QUIZ RUNNER ================= */}
      {gameMode === 'quiz' && activeQuestion && !finished && (
        <section className={`astro-quiz-panel ${quizFullscreen ? 'is-fullscreen' : ''}`} ref={quizPanelRef} key={current}>
          <div className="astro-quiz-topline">
            <div>
              <span
                className="astro-difficulty"
                style={{
                  color: QUIZ_DIFFICULTIES_CONFIG[quizDifficulty]?.color || '#38bdf8',
                  borderColor: QUIZ_DIFFICULTIES_CONFIG[quizDifficulty]?.color || '#38bdf8',
                }}
              >
                {QUIZ_DIFFICULTIES_CONFIG[quizDifficulty]?.label}
              </span>
              <span className="astro-question-count">
                Question {current + 1} of {questions.length}
              </span>
            </div>
            <div className="astro-timer">
              <small>ELAPSED</small>
              <strong>{formatElapsed(elapsedSeconds)}</strong>
            </div>
            <div className="astro-score-wrap">
              <strong className="astro-live-score">
                {displayCorrect}/{questions.length} correct
              </strong>
              {popup && (
                <span className={`quiz-pop ${popup.correct ? 'correct' : 'wrong'}`}>{popup.text}</span>
              )}
            </div>
            <button className="quiz-fullscreen-button" type="button" onClick={toggleQuizFullscreen} aria-label={quizFullscreen ? 'Exit fullscreen quiz' : 'Open quiz fullscreen'}>
              <Maximize2 size={16} />
              <span>{quizFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>

          <div className="astro-progress">
            <span style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
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

          <button className="btn btn-secondary astro-exit" onClick={() => resetQuiz('arcade')}>
            <ArrowLeft size={15} /> Exit Quiz
          </button>
        </section>
      )}

      {/* ================= ASTRO QUIZ COMPLETED ================= */}
      {gameMode === 'quiz' && finished && (
        <section className={`astro-result ${displayCorrect === questions.length ? 'astro-perfect-result' : ''}`}>
          <div className="astro-result-icon">
            {displayCorrect === questions.length ? <Trophy size={34} /> : <CheckCircle2 size={34} />}
          </div>
          <span className="astro-kicker">
            {displayCorrect === questions.length ? 'Perfect Score' : 'Exam Complete'}
          </span>
          <h2 className="astro-score-result">
            <strong>{displayCorrect}</strong>
            <small>/ {questions.length} correct</small>
          </h2>
          <div className="astro-time-result">
            <strong>{timeDescription(elapsedSeconds)}</strong>
            <span>Completed in {formatElapsed(elapsedSeconds)} · {QUIZ_DIFFICULTIES_CONFIG[quizDifficulty]?.label}</span>
          </div>

          <div className="gameover-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => resetQuiz('quiz-setup')}>
              <Gamepad2 size={15} /> New Exam
            </button>
            <button className="btn btn-secondary" onClick={() => openLeaderboard('astro-quiz')}>
              <Trophy size={15} /> View Leaderboard
            </button>
          </div>
        </section>
      )}

      {/* ================= LEADERBOARDS & RANKS HUB ================= */}
      {gameMode === 'records' && (
        <section className="arcade-play-panel leaderboard-hub-panel">
          <button className="arcade-back-button" onClick={() => setGameMode('arcade')}>
            <ArrowLeft size={16} /> Arcade Hub
          </button>

          {/* Leaderboard Header & Reset Timer */}
          <div className="leaderboard-hub-header">
            <div>
              <span className="arcade-kicker">GLOBAL COMPETITIVE LEAGUE</span>
              <h1>{leaderboardSection === 'xp' ? 'XP rankings' : 'Game leaderboards'}</h1>
              <p>{leaderboardSection === 'xp'
                ? 'This ranking shows each user once, ordered by total XP earned across every AstroGame.'
                : 'Each game has its own leaderboard. Choose a game to compare scores and difficulty results.'}</p>
            </div>

            <div className="leaderboard-reset-box">
              <Clock3 size={18} />
              <div>
                <small>WEEKLY SEASON COUNTDOWN</small>
                <strong>Resets in {weeklyTime.formatted}</strong>
              </div>
            </div>
          </div>

          <div className="leaderboard-section-menu" role="tablist" aria-label="Leaderboard sections">
            <button className={leaderboardSection === 'xp' ? 'active' : ''} onClick={() => { setLeaderboardSection('xp'); setRecordsTab('global'); }}>
              XP rankings
            </button>
            <button className={leaderboardSection === 'games' ? 'active' : ''} onClick={() => { setLeaderboardSection('games'); setRecordsTab('meteor-dash'); }}>
              Game leaderboards
            </button>
          </div>

          {/* Timeframe controls */}
          <div className="leaderboard-controls-row">
            <div className="timeframe-tabs">
              <button
                className={recordsTimeframe === 'weekly' ? 'active' : ''}
                onClick={() => setRecordsTimeframe('weekly')}
              >
                <Zap size={14} /> This Week (Reset League)
              </button>
              <button
                className={recordsTimeframe === 'all' ? 'active' : ''}
                onClick={() => setRecordsTimeframe('all')}
              >
                <Trophy size={14} /> All-Time Hall of Fame
              </button>
            </div>

            {leaderboardSection === 'games' && (
              <div className="game-filter-tabs" aria-label="Game leaderboards">
                <button className={recordsTab === 'meteor-dash' ? 'active' : ''} onClick={() => setRecordsTab('meteor-dash')}>Rocket Dash</button>
                <button className={recordsTab === 'orbit-match' ? 'active' : ''} onClick={() => setRecordsTab('orbit-match')}>Orbit Match</button>
                <button className={recordsTab === 'astro-quiz' ? 'active' : ''} onClick={() => setRecordsTab('astro-quiz')}>Astro Quiz</button>
              </div>
            )}
          </div>

          {/* Difficulty Filter Selector */}
          {leaderboardSection === 'games' && <div className="difficulty-filter-row">
            <span>Filter Difficulty:</span>
            {['all', 'easy', 'medium', 'hard', 'insane', 'master'].map((d) => (
              <button
                key={d}
                className={`diff-filter-pill ${recordsDifficultyFilter === d ? 'active' : ''}`}
                onClick={() => setRecordsDifficultyFilter(d)}
              >
                {d === 'all' ? 'All Tiers' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>}

          {/* Top 3 Podium (When entries exist) */}
          {recordsList.length >= 3 && (
            <div className="leaderboard-podium">
              {/* 2nd Place */}
              <div className="podium-stand podium-second">
                <div className="podium-badge">Second place</div>
                <strong className="podium-name">{recordsList[1]?.name || 'Cadet'}</strong>
                <span className="podium-score">{leaderboardSection === 'xp' ? `${recordsList[1]?.xp || 0} XP` : `${recordsList[1]?.score || 0} pts`}</span>
                <span className="podium-game">{leaderboardSection === 'xp' ? 'Total experience' : recordsList[1]?.game || 'Game'}</span>
              </div>

              {/* 1st Place */}
              <div className="podium-stand podium-first">
                <Crown size={24} className="podium-crown" />
                <div className="podium-badge">First place</div>
                <strong className="podium-name">{recordsList[0]?.name || 'Cadet'}</strong>
                <span className="podium-score">{leaderboardSection === 'xp' ? `${recordsList[0]?.xp || 0} XP` : `${recordsList[0]?.score || 0} pts`}</span>
                <span className="podium-game">{leaderboardSection === 'xp' ? 'Total experience' : recordsList[0]?.game || 'Game'}</span>
              </div>

              {/* 3rd Place */}
              <div className="podium-stand podium-third">
                <div className="podium-badge">Third place</div>
                <strong className="podium-name">{recordsList[2]?.name || 'Cadet'}</strong>
                <span className="podium-score">{leaderboardSection === 'xp' ? `${recordsList[2]?.xp || 0} XP` : `${recordsList[2]?.score || 0} pts`}</span>
                <span className="podium-game">{leaderboardSection === 'xp' ? 'Total experience' : recordsList[2]?.game || 'Game'}</span>
              </div>
            </div>
          )}

          {/* Roster Table */}
          {recordsLoading ? (
            <div className="records-empty">Retrieving league roster...</div>
          ) : recordsList.length === 0 ? (
            <div className="records-empty">
              <Trophy size={28} />
              <strong>No leaderboard runs recorded for this filter</strong>
              <span>Play Rocket Game, Orbit Match, or Astro Quiz to log your name!</span>
            </div>
          ) : (
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>PILOT CALLSIGN</th>
                    <th>RANK TIER</th>
                    <th>{leaderboardSection === 'xp' ? 'GAMES PLAYED' : 'GAME &amp; DIFFICULTY'}</th>
                    <th>{leaderboardSection === 'xp' ? 'TOTAL XP' : 'SCORE &amp; XP'}</th>
                    <th>LOGGED DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsList.map((rec, index) => {
                    const isCurrentUser = (rec.name && rec.name.toLowerCase() === playerName.toLowerCase()) || (rec.userEmail && rec.userEmail === user?.email);
                    const rankObj = getRankFromXP(rec.xp || rec.score * 0.8);
                    return (
                      <tr key={rec.id || `${rec.name}-${index}`} className={isCurrentUser ? 'is-user-row' : ''}>
                        <td className="rank-cell">
                          {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : `#${index + 1}`}
                        </td>
                        <td className="pilot-cell">
                          <strong>{rec.name || 'Cadet Pilot'}</strong>
                          {isCurrentUser && <span className="you-pill">YOU</span>}
                        </td>
                        <td>
                          <span className="rank-badge-inline" style={{ color: rankObj.color, backgroundColor: rankObj.bg }}>
                            {rankObj.icon} {rankObj.tier}
                          </span>
                        </td>
                        <td>
                          {leaderboardSection === 'xp' ? (
                            <span className="game-tag">{rec.gamesPlayed || 0} games</span>
                          ) : (
                          <span className="game-tag">
                            {rec.game === 'meteor-dash' ? '🚀 Rocket Dash' : rec.game === 'orbit-match' ? '🛰️ Orbit Match' : '🧠 Astro Quiz'}
                          </span>
                          )}
                          {leaderboardSection !== 'xp' && (
                          <span className="diff-tag">({rec.difficulty || 'Easy'})</span>
                          )}
                        </td>
                        <td className="score-cell">
                          <strong>{leaderboardSection === 'xp' ? `${rec.xp || 0} XP` : `${rec.score || 0} pts`}</strong>
                          <small>{leaderboardSection === 'xp' ? `${rec.score || 0} total points` : `+${rec.xp || Math.round(rec.score * 0.8)} XP`}</small>
                        </td>
                        <td className="date-cell">
                          {rec.created_at || rec.createdAt ? new Date(rec.created_at || rec.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Ranks Information Guide */}
          <div className="ranks-guide-box">
            <h3><Award size={18} /> Rank progression and tiers</h3>
            <div className="ranks-guide-grid">
              {[
                { title: 'Stargazer', tier: 'Bronze', icon: '🌌', range: '0 - 499 XP', color: '#cd7f32' },
                { title: 'Orbital Explorer', tier: 'Silver', icon: '🛰️', range: '500 - 1,499 XP', color: '#94a3b8' },
                { title: 'Cosmic Officer', tier: 'Gold', icon: '🚀', range: '1,500 - 3,499 XP', color: '#eab308' },
                { title: 'Astral Commander', tier: 'Platinum', icon: '⭐', range: '3,500 - 6,999 XP', color: '#a855f7' },
                { title: 'Galactic Admiral', tier: 'Diamond', icon: '💫', range: '7,000 - 11,999 XP', color: '#06b6d4' },
                { title: 'Cosmic Legend', tier: 'Mythic', icon: '👑', range: '12,000+ XP', color: '#f59e0b' },
              ].map((r) => (
                <div key={r.tier} className="rank-guide-card" style={{ borderColor: r.color }}>
                  <span className="r-icon">{r.icon}</span>
                  <strong style={{ color: r.color }}>{r.tier} · {r.title}</strong>
                  <small>{r.range}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AstroGames;