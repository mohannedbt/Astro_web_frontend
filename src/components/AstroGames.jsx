import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArrowRight, CheckCircle2, Gamepad2, Loader2, Orbit, RotateCcw, Sparkles, Trophy, XCircle } from 'lucide-react';

const quizBank = {
  easy: [
    { question: 'Which planet is known as the Red Planet?', options: ['Mars', 'Venus', 'Mercury', 'Jupiter'], answer: 'Mars' },
    { question: 'What is the closest star to Earth?', options: ['The Sun', 'Sirius', 'Proxima Centauri', 'Alpha Centauri'], answer: 'The Sun' },
    { question: 'How many planets are in our solar system?', options: ['8', '7', '9', '10'], answer: '8' },
    { question: 'What galaxy do we live in?', options: ['The Milky Way', 'Andromeda', 'Triangulum', 'Whirlpool'], answer: 'The Milky Way' },
    { question: 'Which planet has the most prominent ring system?', options: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'], answer: 'Saturn' },
  ],
  medium: [
    { question: 'Which moon of Saturn has a thick nitrogen atmosphere?', options: ['Titan', 'Enceladus', 'Mimas', 'Iapetus'], answer: 'Titan' },
    { question: 'What force keeps planets in orbit around the Sun?', options: ['Gravity', 'Magnetism', 'Inertia alone', 'Solar wind'], answer: 'Gravity' },
    { question: 'Which spacecraft first landed humans on the Moon?', options: ['Apollo 11', 'Apollo 8', 'Gemini 4', 'Voyager 1'], answer: 'Apollo 11' },
    { question: 'Which dwarf planet was reclassified from full planet status in 2006?', options: ['Pluto', 'Ceres', 'Eris', 'Haumea'], answer: 'Pluto' },
    { question: 'What is the term for the point in an orbit closest to the Sun?', options: ['Perihelion', 'Aphelion', 'Zenith', 'Apogee'], answer: 'Perihelion' },
  ],
  hard: [
    { question: 'What is the Chandrasekhar limit approximately equal to, in solar masses?', options: ['1.4', '3.2', '0.8', '5.6'], answer: '1.4' },
    { question: 'What is the name of the process by which stars fuse hydrogen into helium?', options: ['Nuclear fusion', 'Nuclear fission', 'Photodissociation', 'Radioactive decay'], answer: 'Nuclear fusion' },
    { question: 'Which mission was the first to achieve a soft landing on a comet?', options: ['Rosetta/Philae', 'Stardust', 'Deep Impact', 'OSIRIS-REx'], answer: 'Rosetta/Philae' },
    { question: 'What is the term for a star\'s total energy output per second?', options: ['Luminosity', 'Magnitude', 'Flux density', 'Albedo'], answer: 'Luminosity' },
    { question: 'Which region of the solar system is the source of most long-period comets?', options: ['The Oort Cloud', 'The Kuiper Belt', 'The Asteroid Belt', 'The Heliosphere'], answer: 'The Oort Cloud' },
  ],
  insane: [
    { question: 'What is the approximate mass of the supermassive black hole Sagittarius A*?', options: ['About 4.3 million solar masses', 'About 4.3 thousand', 'About 4.3 billion', 'About 430'], answer: 'About 4.3 million solar masses' },
    { question: 'Which spacecraft became the first human-made object to enter interstellar space?', options: ['Voyager 1', 'Voyager 2', 'Pioneer 10', 'New Horizons'], answer: 'Voyager 1' },
    { question: 'What is the Roche limit primarily used to calculate?', options: ['The distance at which a celestial body disintegrates due to tidal forces', 'The escape velocity of a planet', 'The habitable zone of a star', 'The rotation period of a moon'], answer: 'The distance at which a celestial body disintegrates due to tidal forces' },
    { question: 'Which effect describes Mercury\'s orbital perihelion shift?', options: ['Perihelion precession', 'Nodal regression', 'Axial libration', 'Orbital resonance drift'], answer: 'Perihelion precession' },
    { question: 'What is the term for the faint glow of sunlight scattered by interplanetary dust?', options: ['Zodiacal light', 'Airglow', 'Gegenschein halo', 'Corona discharge'], answer: 'Zodiacal light' },
  ],
};

const universleBodies = [
  { id: 'mercury', name: 'Mercury', type: 'Planet', system: 'Sun', distAU: 0.39, radius: 0.38, color: '#8C8A8A', tempC: 167 },
  { id: 'venus', name: 'Venus', type: 'Planet', system: 'Sun', distAU: 0.72, radius: 0.95, color: '#D9B36F', tempC: 465 },
  { id: 'earth', name: 'Earth', type: 'Planet', system: 'Sun', distAU: 1.0, radius: 1, color: '#4D8FD6', tempC: 15 },
  { id: 'mars', name: 'Mars', type: 'Planet', system: 'Sun', distAU: 1.52, radius: 0.53, color: '#C1440E', tempC: -65 },
  { id: 'jupiter', name: 'Jupiter', type: 'Planet', system: 'Sun', distAU: 5.2, radius: 11.2, color: '#D8CA9D', tempC: -110 },
  { id: 'saturn', name: 'Saturn', type: 'Planet', system: 'Sun', distAU: 9.58, radius: 9.45, color: '#E4D2A7', tempC: -140 },
  { id: 'uranus', name: 'Uranus', type: 'Planet', system: 'Sun', distAU: 19.2, radius: 4.01, color: '#85D7E6', tempC: -195 },
  { id: 'neptune', name: 'Neptune', type: 'Planet', system: 'Sun', distAU: 30.1, radius: 3.88, color: '#4B6FE1', tempC: -200 },
  { id: 'moon', name: 'Moon', type: 'Moon', system: 'Earth', distAU: 1.0, radius: 0.27, color: '#CFCFCF', tempC: -20 },
  { id: 'titan', name: 'Titan', type: 'Moon', system: 'Saturn', distAU: 9.58, radius: 0.4, color: '#E0B96E', tempC: -179 },
  { id: 'io', name: 'Io', type: 'Moon', system: 'Jupiter', distAU: 5.2, radius: 0.286, color: '#D7B457', tempC: -143 },
  { id: 'europa', name: 'Europa', type: 'Moon', system: 'Jupiter', distAU: 5.2, radius: 0.245, color: '#C7D4E3', tempC: -160 },
  { id: 'ganymede', name: 'Ganymede', type: 'Moon', system: 'Jupiter', distAU: 5.2, radius: 0.413, color: '#A39A89', tempC: -163 },
  { id: 'pluto', name: 'Pluto', type: 'Dwarf Planet', system: 'Sun', distAU: 39.48, radius: 0.18, color: '#CBB8A3', tempC: -230 },
  { id: 'ceres', name: 'Ceres', type: 'Dwarf Planet', system: 'Sun', distAU: 2.77, radius: 0.07, color: '#ABA396', tempC: -105 },
  { id: 'eris', name: 'Eris', type: 'Dwarf Planet', system: 'Sun', distAU: 67.7, radius: 0.18, color: '#F4E4C2', tempC: -230 },
];

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const getUniversleSuggestions = (value, max = 8) => {
  const query = value.trim().toLowerCase();
  if (!query) return [];
  // Starts-with matches first (most relevant), then contains-matches, so
  // typing a single letter like "m" still surfaces something useful.
  const startsWith = universleBodies.filter((body) => body.name.toLowerCase().startsWith(query));
  const contains = universleBodies.filter(
    (body) => !body.name.toLowerCase().startsWith(query) && body.name.toLowerCase().includes(query)
  );
  return [...startsWith, ...contains].slice(0, max);
};

const getStateTone = (state) => {
  switch (state) {
    case 'match':
      return { background: 'rgba(34, 197, 94, 0.16)', color: '#4ade80', label: 'Match' };
    case 'partial':
      return { background: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24', label: 'Partial' };
    default:
      return { background: 'rgba(248, 113, 113, 0.16)', color: '#f87171', label: 'Miss' };
  }
};

const getStatus = (guess, target) => {
  const typeMatch = guess.type === target.type;
  const systemMatch = guess.system === target.system;
  const distDiff = Math.abs(guess.distAU - target.distAU);
  const sizeDiff = Math.abs(guess.radius - target.radius);
  const tempDiff = Math.abs((guess.tempC ?? 0) - (target.tempC ?? 0));

  let distanceState = 'miss';
  if (distDiff <= target.distAU * 0.15) distanceState = 'match';
  else if (distDiff <= target.distAU * 0.35) distanceState = 'partial';

  let sizeState = 'miss';
  if (sizeDiff <= 0.1) sizeState = 'match';
  else if (sizeDiff <= 0.4) sizeState = 'partial';

  let temperatureState = 'miss';
  if (tempDiff <= 80) temperatureState = 'match';
  else if (tempDiff <= 180) temperatureState = 'partial';

  const distanceLabel = guess.distAU === 0
    ? 'No orbit data yet'
    : guess.distAU < target.distAU
      ? `Needs to be farther from the Sun than ${guess.distAU.toFixed(2)} AU`
      : guess.distAU > target.distAU
        ? `Needs to be closer to the Sun than ${guess.distAU.toFixed(2)} AU`
        : 'Distance from the Sun is spot on';

  const temperatureLabel = guess.tempC === undefined
    ? 'Temperature not known'
    : tempDiff <= 80
      ? 'Temperature is a close match'
      : tempDiff <= 180
        ? 'Temperature is in the right ballpark'
        : 'Temperature is much different';

  // Proximity points for this single guess (used in global score)
  const proximityPoints =
    (typeMatch ? 30 : 0) +
    (systemMatch ? 20 : 0) +
    (distanceState === 'match' ? 25 : distanceState === 'partial' ? 12 : 0) +
    (sizeState === 'match' ? 15 : sizeState === 'partial' ? 7 : 0) +
    (temperatureState === 'match' ? 10 : temperatureState === 'partial' ? 5 : 0);

  return {
    typeMatch,
    systemMatch,
    distanceState,
    sizeState,
    temperatureState,
    distanceLabel,
    temperatureLabel,
    proximityPoints,
    summary: [
      typeMatch ? 'type match' : 'type mismatch',
      systemMatch ? 'system match' : `system should be ${target.system}`,
      distanceState === 'match' ? 'distance match' : distanceLabel,
      sizeState === 'match' ? 'size match' : sizeState === 'partial' ? 'size is close' : 'size mismatch',
      temperatureState === 'match' ? 'temperature match' : temperatureLabel,
    ].join(' · '),
  };
};

// ─── Global Scoring ────────────────────────────────────────────────────────
// Both games produce a single integer "globalScore" so players can be
// compared on one number regardless of game mode.
//
// Formula factors:
//  • Time     — faster answers / completions earn more
//  • Errors   — wrong answers subtract points; more misses = lower score
//  • Proximity — how close each guess was to the correct answer

// Quiz: correct answers earn base × difficulty × speed bonus × streak;
// wrong answers apply a small error penalty so total errors matter.
const QUIZ_DIFF_MULT = { easy: 1.0, medium: 1.6, hard: 2.5, insane: 4.0 };
// Penalty deducted for each wrong answer (scaled by difficulty so insane
// mistakes hurt more than easy ones).
const QUIZ_ERROR_PENALTY = { easy: 30, medium: 50, hard: 80, insane: 120 };

const quizQuestionScore = (isCorrect, elapsedMs, streakAfter, difficultyTier) => {
  if (!isCorrect) {
    // Wrong answer: return a negative penalty so cumulative score captures error count.
    return -(QUIZ_ERROR_PENALTY[difficultyTier] || 30);
  }
  const base = 200 * (QUIZ_DIFF_MULT[difficultyTier] || 1);
  // Speed bonus: full 120 pts under 3 s, linear decay to 0 at 20 s.
  const speedBonus = Math.max(0, Math.round(120 * (1 - Math.min(1, elapsedMs / 20000))));
  // Streak multiplier: 1× at streak 0, up to 2.5× at streak 5+.
  const streakMult = 1 + Math.min(streakAfter, 5) * 0.3;
  return Math.round((base + speedBonus) * streakMult);
};

// Universle: rewards winning, speed, guess efficiency, and how close each
// guess was to the target (proximity points accumulated across all guesses).
// errors = guesses that were NOT the correct answer (guessCount - 1 if won, all if lost).
const universleGlobalScore = (won, guessCount, timeSec, totalProximityPoints) => {
  const winBonus   = won ? 500 : 0;
  // 120 pts per guess saved (out of 7), 0 if used all.
  const guessBonus = Math.max(0, (7 - guessCount) * 120);
  // Error penalty: each wrong guess (before finding the answer) deducts 40 pts.
  const errorCount   = won ? guessCount - 1 : guessCount;
  const errorPenalty = errorCount * 40;
  // Time bonus: 400 pts under 30 s, linear decay to 0 at 3 min.
  const timeBonus  = Math.max(0, Math.round(400 * (1 - Math.min(1, timeSec / 180))));
  return Math.max(0, winBonus + guessBonus - errorPenalty + timeBonus + totalProximityPoints);
};


// Live quiz questions are pulled from the Open Trivia Database
// (https://opentdb.com), a free public trivia API with no key required.
// It doesn't have a dedicated "astronomy" category, so we request its
// Science & Nature category and keep only questions that mention
// space/astronomy terms, falling back to the bundled quizBank if the
// network request fails or doesn't yield enough matches.
const ASTRO_KEYWORDS = [
  'planet', 'star', 'moon', 'sun', 'solar', 'galaxy', 'universe', 'astronom',
  'space', 'orbit', 'comet', 'asteroid', 'nebula', 'black hole', 'mars',
  'venus', 'jupiter', 'saturn', 'mercury', 'neptune', 'uranus', 'pluto',
  'cosmic', 'telescope', 'nasa', 'spacecraft', 'satellite', 'meteor',
  'eclipse', 'constellation', 'milky way', 'astronaut', 'rocket',
];

const decodeHtmlEntities = (value) => {
  if (typeof document === 'undefined') return value;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
};

const shuffleArray = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const fetchLiveAstronomyQuestions = async (difficultyTier, amount = 5) => {
  // Open Trivia DB only supports easy/medium/hard, so "insane" borrows the
  // hard pool and relies on the astronomy keyword filter to keep things
  // tough and on-topic.
  const apiDifficulty = difficultyTier === 'insane' ? 'hard' : difficultyTier;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const backendResponse = await fetch(`/api/astrogames/live-questions?difficulty=${apiDifficulty}&amount=${amount}`);
    if (backendResponse.ok) {
      const backendPayload = await backendResponse.json();
      if (backendPayload?.questions?.length) {
        return backendPayload.questions.slice(0, amount);
      }
    }

    const response = await fetch(
      `https://opentdb.com/api.php?amount=50&category=17&difficulty=${apiDifficulty}&type=multiple`,
      { signal: controller.signal }
    );
    if (!response.ok) throw new Error('Open Trivia DB unavailable');
    const payload = await response.json();
    if (payload.response_code !== 0 || !Array.isArray(payload.results) || !payload.results.length) {
      throw new Error('No live questions returned');
    }

    const decoded = payload.results.map((item) => ({
      question: decodeHtmlEntities(item.question),
      answer: decodeHtmlEntities(item.correct_answer),
      options: shuffleArray([item.correct_answer, ...item.incorrect_answers].map(decodeHtmlEntities)),
      category: decodeHtmlEntities(item.category),
    }));

    const astronomyMatches = decoded.filter((entry) =>
      ASTRO_KEYWORDS.some((keyword) => entry.question.toLowerCase().includes(keyword))
    );

    const seen = new Set();
    const pool = [...astronomyMatches, ...decoded];
    const unique = [];
    for (const entry of pool) {
      if (seen.has(entry.question)) continue;
      seen.add(entry.question);
      unique.push(entry);
      if (unique.length >= amount) break;
    }

    if (unique.length < amount) throw new Error('Not enough live questions');
    return unique;
  } catch (error) {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

// All textures are generated locally on a <canvas>. Earlier this pulled
// planet images from a raw.githubusercontent.com path that three.js has
// since removed (only earth/moon textures remain upstream), which caused
// every other body to 404. Generating textures locally means the globe
// always renders correctly with no network dependency or CORS risk.
const shadeColor = (hex, factor) => {
  const value = hex.replace('#', '');
  const num = parseInt(value, 16);
  const r = Math.max(0, Math.min(255, Math.round(((num >> 16) & 255) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(((num >> 8) & 255) * factor)));
  const b = Math.max(0, Math.min(255, Math.round((num & 255) * factor)));
  return `rgb(${r}, ${g}, ${b})`;
};

const gasGiants = new Set(['Jupiter', 'Saturn', 'Uranus', 'Neptune']);

const createPlanetTexture = (body) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  if (gasGiants.has(body.name)) {
    // Horizontal banding, like Jupiter/Saturn/Uranus/Neptune cloud belts.
    const bandCount = 9 + Math.floor(Math.random() * 5);
    for (let i = 0; i < bandCount; i += 1) {
      const bandHeight = canvas.height / bandCount;
      const y = i * bandHeight;
      const shade = 0.72 + Math.random() * 0.55;
      context.fillStyle = shadeColor(body.color, shade);
      context.fillRect(0, y, canvas.width, bandHeight + 1);
    }
    context.globalAlpha = 0.22;
    for (let i = 0; i < 8; i += 1) {
      const y = Math.random() * canvas.height;
      context.beginPath();
      context.ellipse(Math.random() * canvas.width, y, 26 + Math.random() * 46, 7 + Math.random() * 12, 0, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
    }
    context.globalAlpha = 1;
  } else {
    // Rocky planets, moons, and dwarf planets get a shaded sphere with
    // scattered craters/spots.
    const gradient = context.createRadialGradient(96, 90, 16, 128, 128, 168);
    gradient.addColorStop(0, shadeColor(body.color, 1.35));
    gradient.addColorStop(0.55, body.color);
    gradient.addColorStop(1, shadeColor(body.color, 0.45));
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.globalAlpha = 0.32;
    const featureCount = body.type === 'Planet' ? 16 : 26;
    for (let index = 0; index < featureCount; index += 1) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = body.type === 'Planet' ? 6 + Math.random() * 24 : 3 + Math.random() * 12;
      context.beginPath();
      context.fillStyle = shadeColor(body.color, 0.55);
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const PlanetScene = ({ targetBody, bodies = universleBodies }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060816);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 2.2, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 24;
    controls.target.set(0, 0, 0);

    const ambient = new THREE.AmbientLight(0x6b7cff, 1.1);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xffffff, 2.5, 200);
    pointLight.position.set(6, 4, 4);
    scene.add(pointLight);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffb347 })
    );
    scene.add(sun);

    const group = new THREE.Group();
    scene.add(group);

    const meshes = bodies.map((body, index) => {
      const size = Math.max(0.12, Math.min(0.85, body.radius * 0.08));
      const distance = Math.max(1.8, body.distAU * 0.32);
      const geometry = new THREE.SphereGeometry(size, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        map: createPlanetTexture(body),
        roughness: body.type === 'Planet' ? 0.82 : 0.9,
        metalness: body.type === 'Planet' ? 0.04 : 0.0,
        emissive: body.name === targetBody?.name ? 0x2b4cff : 0x000000,
        emissiveIntensity: body.name === targetBody?.name ? 0.65 : 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { ...body, orbitOffset: index * 0.5, distance, size };
      group.add(mesh);

      const orbit = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 96 }, (_, i) => {
            const angle = (i / 96) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
          })
        ),
        new THREE.LineBasicMaterial({ color: 0x7c8bff, transparent: true, opacity: 0.16 })
      );
      group.add(orbit);

      if (body.name === 'Saturn') {
        const ringGeometry = new THREE.RingGeometry(size * 1.55, size * 2.1, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xc7b27a, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2.2;
        mesh.add(ring);
      }

      return mesh;
    });

    const starGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 1200; i += 1) {
      const radius = 90 + Math.random() * 180;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      starPositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xf5f7ff, size: 0.16, transparent: true, opacity: 0.9 })
    );
    scene.add(stars);

    const startTimestamp = performance.now();
    let animationFrameId = 0;
    const animate = () => {
      const elapsed = (performance.now() - startTimestamp) / 1000;
      group.rotation.y = elapsed * 0.035;
      meshes.forEach((mesh) => {
        const planet = mesh.userData;
        const angle = elapsed * (planet.name === 'Mercury' ? 1.9 : planet.name === 'Venus' ? 1.5 : planet.name === 'Earth' ? 1.2 : planet.name === 'Mars' ? 1.0 : planet.name === 'Jupiter' ? 0.55 : planet.name === 'Saturn' ? 0.42 : planet.name === 'Uranus' ? 0.3 : planet.name === 'Neptune' ? 0.24 : 0.92) + planet.orbitOffset;
        mesh.position.set(Math.cos(angle) * planet.distance, Math.sin(angle * 0.35) * 0.7, Math.sin(angle) * planet.distance);
        const isTarget = planet.name === targetBody?.name;
        mesh.scale.setScalar(isTarget ? 1.35 : 1);
        mesh.material.emissiveIntensity = isTarget ? 0.75 : 0;
      });
      stars.rotation.y += 0.0003;
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      container.innerHTML = '';
    };
  }, [targetBody, bodies]);

  return <div ref={containerRef} style={{ width: '100%', minHeight: '320px', borderRadius: '20px', overflow: 'hidden', background: 'radial-gradient(circle at top, rgba(167, 139, 250, 0.16), transparent 35%)' }} />;
};

const AstroGames = ({ user, profile }) => {
  const [view, setView] = useState('home');
  const [activePanel, setActivePanel] = useState('play');
  const [leaderboardView, setLeaderboardView] = useState('all');
  const [difficulty, setDifficulty] = useState('easy');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [saveName, setSaveName] = useState('');
  const [savePayload, setSavePayload] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizAnswerTime, setQuizAnswerTime] = useState(null);
  const [quizStreak, setQuizStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSource, setQuizSource] = useState(null);
  const [quizPulse, setQuizPulse] = useState(null);
  const [quizPop, setQuizPop] = useState(null);
  const [quizGlobalScore, setQuizGlobalScore] = useState(0); // running total
  const [quizInterlude, setQuizInterlude] = useState(null); // { isCorrect, pts, streak, answer, isLast }
  const [quizInterludeCountdown, setQuizInterludeCountdown] = useState(3);
  const [challengeMode, setChallengeMode] = useState(null); // 'daily', 'practice', or null
  const [leaderboard, setLeaderboard] = useState({ quiz: [], universle: [], challenge: [] });
  const [universleTarget, setUniversleTarget] = useState(null);
  const [universleGuess, setUniversleGuess] = useState('');
  const [universleSuggestions, setUniversleSuggestions] = useState([]);
  const [universleHistory, setUniversleHistory] = useState([]);
  const [universleGuessCount, setUniversleGuessCount] = useState(0);
  const [universleFinished, setUniversleFinished] = useState(false);
  const [universleWon, setUniversleWon] = useState(false);
  const [universleSeconds, setUniversleSeconds] = useState(0);
  const [universleFeedback, setUniversleFeedback] = useState(null);
  const [universleProximityTotal, setUniversleProximityTotal] = useState(0);
  const [showUniversleGuide, setShowUniversleGuide] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const params = new URLSearchParams();
        if (user?.id) params.set('userId', String(user.id));
        if (user?.email) params.set('userEmail', user.email);
        const response = await fetch(`/api/astrogames/leaderboard${params.toString() ? `?${params.toString()}` : ''}`);
        if (!response.ok) throw new Error('backend unavailable');
        const payload = await response.json();
        setLeaderboard({
          quiz: payload.filter((entry) => entry.game === 'quiz'),
          universle: payload.filter((entry) => entry.game === 'universle'),
          challenge: payload.filter((entry) => entry.game === 'daily' || entry.game === 'practice'),
        });
      } catch (error) {
        const stored = JSON.parse(localStorage.getItem('astrogames_leaderboard_v1') || '[]');
        setLeaderboard({
          quiz: stored.filter((entry) => entry.game === 'quiz'),
          universle: stored.filter((entry) => entry.game === 'universle'),
          challenge: stored.filter((entry) => entry.game === 'daily' || entry.game === 'practice'),
        });
      }
    };

    loadLeaderboard();
  }, [user]);

  useEffect(() => {
    if (view !== 'universle' || universleFinished) return;
    const timer = window.setInterval(() => setUniversleSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [view, universleFinished]);

  // Countdown tick while interlude is showing
  useEffect(() => {
    if (!quizInterlude) return;
    setQuizInterludeCountdown(3);
    const tick = window.setInterval(() => {
      setQuizInterludeCountdown((prev) => {
        if (prev <= 1) { window.clearInterval(tick); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [quizInterlude]);

  const startQuiz = async (selectedDifficulty = difficulty) => {
    setChallengeMode(null);
    setDifficulty(selectedDifficulty);
    setQuizQuestions([]);
    setQuizLoading(true);
    setView('quiz');
    setSavePayload(null);

    const liveQuestions = await fetchLiveAstronomyQuestions(selectedDifficulty);
    const baseQuestions = liveQuestions || quizBank[selectedDifficulty] || quizBank.easy;
    // Shuffle question order and, for the offline bank (whose options are
    // authored in a fixed order), shuffle the answer choices too, so the
    // correct answer isn't always in the same position round after round.
    const questions = shuffleArray(baseQuestions).map((entry) => ({
      ...entry,
      options: liveQuestions ? entry.options : shuffleArray(entry.options),
    }));

    setQuizSource(liveQuestions ? 'live' : 'offline');
    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizGlobalScore(0);
    setQuizFinished(false);
    setChosenAnswer(null);
    setQuizFeedback(null);
    setQuizAnswerTime(null);
    setQuizStartTime(Date.now());
    setQuizStreak(0);
    setBestStreak(0);
    setQuizPulse(null);
    setQuizPop(null);
    setQuizInterlude(null);
    setQuizInterludeCountdown(3);
    setQuizLoading(false);
  };

  // ─── Daily / Practice challenge ──────────────────────────────────────────────
  // Daily: deterministic question set seeded from today's UTC date so every
  // player faces the same questions. Practice: quick 3-question easy warmup.
  const startChallenge = async (mode) => {
    setChallengeMode(mode);
    const isPractice = mode === 'practice';
    const questionCount = isPractice ? 3 : 5;
    const difficultyTier = isPractice ? 'easy' : 'medium';

    // Seed a deterministic PRNG from today's date for the daily challenge
    const today = new Date();
    const dateSeed = today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate();
    const makeRand = (seed) => {
      let s = seed;
      return () => {
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };
    const seededShuffle = (arr, seed) => {
      const copy = [...arr];
      const rand = makeRand(seed);
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    setDifficulty(difficultyTier);
    setQuizQuestions([]);
    setQuizLoading(true);
    setView('quiz');
    setSavePayload(null);

    const liveQuestions = await fetchLiveAstronomyQuestions(difficultyTier, 50);
    const basePool = liveQuestions || quizBank[difficultyTier] || quizBank.easy;

    let questions;
    if (isPractice) {
      questions = shuffleArray(basePool).slice(0, questionCount).map((entry) => ({
        ...entry,
        options: liveQuestions ? entry.options : shuffleArray(entry.options),
      }));
    } else {
      // Daily: same shuffle every day for all players
      questions = seededShuffle(basePool, dateSeed).slice(0, questionCount).map((entry, i) => ({
        ...entry,
        options: seededShuffle(liveQuestions ? entry.options : [...entry.options], dateSeed + i + 1),
      }));
    }

    setQuizSource(liveQuestions ? 'live' : 'offline');
    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizGlobalScore(0);
    setQuizFinished(false);
    setChosenAnswer(null);
    setQuizFeedback(null);
    setQuizAnswerTime(null);
    setQuizStartTime(Date.now());
    setQuizStreak(0);
    setBestStreak(0);
    setQuizPulse(null);
    setQuizPop(null);
    setQuizInterlude(null);
    setQuizInterludeCountdown(3);
    setQuizLoading(false);
  };

  useEffect(() => {
    if (view !== 'quiz' || quizFinished || !quizQuestions.length || chosenAnswer || quizInterlude) return;
    const handleKeyDown = (event) => {
      const optionIndex = Number(event.key) - 1;
      const currentQuestion = quizQuestions[quizIndex];
      if (!currentQuestion || optionIndex < 0 || optionIndex >= currentQuestion.options.length) return;
      handleQuizAnswer(currentQuestion.options[optionIndex]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, quizFinished, quizQuestions, quizIndex, chosenAnswer, quizInterlude]);

  const handleQuizAnswer = (answer) => {
    if (chosenAnswer) return;
    setChosenAnswer(answer);

    const currentQuestion = quizQuestions[quizIndex];
    const isCorrect = answer === currentQuestion.answer;
    const elapsedMs = Date.now() - (quizStartTime || Date.now());
    const nextStreak = isCorrect ? quizStreak + 1 : 0;
    setQuizAnswerTime(elapsedMs);
    const questionGlobalScore = quizQuestionScore(isCorrect, elapsedMs, nextStreak, difficulty);
    setQuizFeedback({
      isCorrect,
      answer: currentQuestion.answer,
      selected: answer,
      timeMs: elapsedMs,
      streak: nextStreak,
      questionGlobalScore,
      speedBonus: isCorrect ? Math.max(0, Math.round(120 * (1 - Math.min(1, elapsedMs / 20000)))) : 0,
      errorPenalty: !isCorrect ? (QUIZ_ERROR_PENALTY[difficulty] || 30) : 0,
    });
    setQuizStreak(nextStreak);
    setBestStreak((value) => Math.max(value, nextStreak));
    setQuizPulse(isCorrect ? 'correct' : 'wrong');
    setQuizPop(isCorrect ? `+${questionGlobalScore}` : `-${QUIZ_ERROR_PENALTY[difficulty] || 30}`);
    if (isCorrect) {
      setQuizScore((value) => value + 1);
    }
    setQuizGlobalScore((prev) => prev + questionGlobalScore);

    // After a short reveal pause, show the Kahoot-style interlude screen.
    window.setTimeout(() => {
      const finalCorrect = isCorrect ? quizScore + 1 : quizScore;
      const isLast = quizIndex + 1 >= quizQuestions.length;
      const finalGlobal = quizGlobalScore + questionGlobalScore;

      if (isLast) {
        // Last question: go straight to results after interlude
        setQuizInterlude({
          isCorrect,
          pts: questionGlobalScore,
          streak: nextStreak,
          answer: currentQuestion.answer,
          isLast: true,
          finalGlobal,
          finalCorrect,
          total: quizQuestions.length,
        });
        const payload = {
          game: 'quiz',
          name: '',
          score: finalCorrect,
          total: quizQuestions.length,
          difficulty,
          date: Date.now(),
          pct: finalCorrect / quizQuestions.length,
          timeMs: elapsedMs,
          answeredAt: Date.now(),
          globalScore: finalGlobal,
        };
        setSavePayload(payload);
        // Advance to results after interlude duration (3s + buffer)
        window.setTimeout(() => {
          setQuizInterlude(null);
          setQuizFinished(true);
        }, 3500);
      } else {
        // Show interlude, then advance to next question after 3s
        setQuizInterlude({
          isCorrect,
          pts: questionGlobalScore,
          streak: nextStreak,
          answer: currentQuestion.answer,
          isLast: false,
        });
        window.setTimeout(() => {
          setQuizInterlude(null);
          setQuizFeedback(null);
          setChosenAnswer(null);
          setQuizPulse(null);
          setQuizPop(null);
          setQuizIndex((value) => value + 1);
          setQuizStartTime(Date.now());
        }, 3500);
      }
    }, 700);
  };

  const saveCurrentResult = async () => {
    const name = saveName.trim() || 'Astronaut';
    const payload = {
      ...savePayload,
      name,
    };

    try {
      const response = await fetch('/api/astrogames/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          userId: user?.id || null,
          userEmail: user?.email || profile?.email || null,
          userName: profile?.name || user?.name || user?.username || user?.email || null,
        }),
      });
      if (!response.ok) throw new Error('backend unavailable');
      const savedEntry = await response.json();
      setLeaderboard((current) => {
        if (payload.game === 'daily' || payload.game === 'practice') {
          return {
            ...current,
            challenge: [savedEntry, ...current.challenge].slice(0, 8),
          };
        }
        if (payload.game === 'quiz') {
          return {
            ...current,
            quiz: [savedEntry, ...current.quiz].slice(0, 8),
          };
        }
        return {
          ...current,
          universle: [savedEntry, ...current.universle].slice(0, 8),
        };
      });
    } catch (error) {
      const stored = JSON.parse(localStorage.getItem('astrogames_leaderboard_v1') || '[]');
      stored.push(payload);
      localStorage.setItem('astrogames_leaderboard_v1', JSON.stringify(stored));
      setLeaderboard((current) => {
        if (payload.game === 'daily' || payload.game === 'practice') {
          return {
            ...current,
            challenge: [payload, ...current.challenge].slice(0, 8),
          };
        }
        if (payload.game === 'quiz') {
          return {
            ...current,
            quiz: [payload, ...current.quiz].slice(0, 8),
          };
        }
        return {
          ...current,
          universle: [payload, ...current.universle].slice(0, 8),
        };
      });
    }

    setSavePayload(null);
    setSaveName('');
  };

  const saveQuizScore = async () => saveCurrentResult();

  const startUniversle = () => {
    const candidates = universleTarget
      ? universleBodies.filter((body) => body.id !== universleTarget.id)
      : universleBodies;
    const nextTarget = shuffleArray(candidates)[0];
    setUniversleTarget(nextTarget);
    setUniversleGuess('');
    setUniversleSuggestions([]);
    setUniversleHistory([]);
    setUniversleGuessCount(0);
    setUniversleFinished(false);
    setUniversleWon(false);
    setUniversleSeconds(0);
    setUniversleFeedback(null);
    setUniversleProximityTotal(0);
    setView('universle');
    setSavePayload(null);
  };

  const handleUniversleGuessChange = (event) => {
    const value = event.target.value;
    setUniversleGuess(value);
    setUniversleSuggestions(getUniversleSuggestions(value));
  };

  const selectUniversleSuggestion = (body) => {
    setUniversleGuess(body.name);
    setUniversleSuggestions([]);
    submitUniversleGuess(null, body);
  };

  const submitUniversleGuess = (event, guessedBody = null) => {
    if (event?.preventDefault) event.preventDefault();
    if (!universleTarget) return;

    const currentGuess = guessedBody ? guessedBody.name : universleGuess.trim();
    if (!currentGuess) return;

    setShowUniversleGuide(false);
    const normalizedGuess = currentGuess.toLowerCase();
    const matchedBody = guessedBody || universleBodies.find((body) => body.name.toLowerCase() === normalizedGuess) || universleBodies.find((body) => body.name.toLowerCase().startsWith(normalizedGuess));
    const guessEntry = matchedBody || { name: currentGuess, type: 'Unknown', system: 'Unknown', distAU: 0, radius: 0, tempC: 0 };
    const status = getStatus(guessEntry, universleTarget);
    const nextProximity = universleProximityTotal + status.proximityPoints;
    setUniversleProximityTotal(nextProximity);
    const nextHistory = [
      ...universleHistory,
      {
        name: guessEntry.name,
        type: guessEntry.type,
        system: guessEntry.system,
        status,
      },
    ];
    setUniversleHistory(nextHistory);
    setUniversleFeedback(status);

    const nextCount = universleGuessCount + 1;
    setUniversleGuessCount(nextCount);
    setUniversleGuess('');
    setUniversleSuggestions([]);

    if (guessEntry.name.toLowerCase() === universleTarget.name.toLowerCase()) {
      setUniversleWon(true);
      setUniversleFinished(true);
      const globalScore = universleGlobalScore(true, nextCount, universleSeconds, nextProximity);
      const payload = {
        game: 'universle',
        name: '',
        score: Math.max(1, 8 - nextCount),
        total: 7,
        won: true,
        guesses: nextCount,
        timeSec: universleSeconds,
        target: universleTarget.name,
        date: Date.now(),
        globalScore,
      };
      setSavePayload(payload);
      return;
    }

    if (nextCount >= 7) {
      setUniversleFinished(true);
      const globalScore = universleGlobalScore(false, nextCount, universleSeconds, nextProximity);
      const payload = {
        game: 'universle',
        name: '',
        score: 0,
        total: 7,
        won: false,
        guesses: nextCount,
        timeSec: universleSeconds,
        target: universleTarget.name,
        date: Date.now(),
        globalScore,
      };
      setSavePayload(payload);
    }
  };

  const saveUniversleScore = async () => {
    const name = saveName.trim() || 'Astronaut';
    const payload = { ...savePayload, name };

    try {
      const response = await fetch('/api/astrogames/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          userId: user?.id || null,
          userEmail: user?.email || profile?.email || null,
          userName: profile?.name || user?.name || user?.username || user?.email || null,
        }),
      });
      if (!response.ok) throw new Error('backend unavailable');
      const savedEntry = await response.json();
      setLeaderboard((current) => ({
        ...current,
        universle: [savedEntry, ...current.universle].slice(0, 8),
      }));
    } catch (error) {
      const stored = JSON.parse(localStorage.getItem('astrogames_leaderboard_v1') || '[]');
      stored.push(payload);
      localStorage.setItem('astrogames_leaderboard_v1', JSON.stringify(stored));
      setLeaderboard((current) => ({
        ...current,
        universle: [payload, ...current.universle].slice(0, 8),
      }));
    }

    setSavePayload(null);
    setSaveName('');
  };

  const quizQuestion = useMemo(() => quizQuestions[quizIndex], [quizIndex, quizQuestions]);
  const quizProgress = quizQuestions.length ? ((quizFinished ? quizQuestions.length : quizIndex + 1) / quizQuestions.length) * 100 : 0;
  const universleMultiplier = useMemo(() => {
    if (!universleFeedback) return 1;
    if (universleFeedback.distanceState === 'match' && universleFeedback.sizeState === 'match' && universleFeedback.temperatureState === 'match') return 2.5;
    if (universleFeedback.distanceState === 'partial' || universleFeedback.sizeState === 'partial' || universleFeedback.temperatureState === 'partial') return 1.4;
    return 1;
  }, [universleFeedback]);
  const universleHintRows = useMemo(() => {
    if (!universleTarget || !universleFeedback) return [];
    return [
      { label: 'Type', state: universleFeedback.typeMatch ? 'match' : 'miss', detail: universleFeedback.typeMatch ? `${universleTarget.type} is correct` : `Needs ${universleTarget.type}` },
      { label: 'System', state: universleFeedback.systemMatch ? 'match' : 'miss', detail: universleFeedback.systemMatch ? `Orbiting ${universleTarget.system}` : `Belongs to ${universleTarget.system}` },
      { label: 'Distance', state: universleFeedback.distanceState, detail: universleFeedback.distanceLabel },
      { label: 'Size', state: universleFeedback.sizeState, detail: universleFeedback.sizeState === 'match' ? 'Size is spot on' : universleFeedback.sizeState === 'partial' ? 'Size is close' : 'Size is off' },
      { label: 'Temp', state: universleFeedback.temperatureState, detail: universleFeedback.temperatureLabel },
    ];
  }, [universleFeedback, universleTarget]);
  const challengeRows = useMemo(() => {
    const orderedEntries = (leaderboard.challenge || [])
      .slice()
      .sort((left, right) => {
        const leftGlobal = Number(left.globalScore || 0);
        const rightGlobal = Number(right.globalScore || 0);
        if (rightGlobal !== leftGlobal) return rightGlobal - leftGlobal;
        const leftScore = Number(left.score || 0);
        const rightScore = Number(right.score || 0);
        if (rightScore !== leftScore) return rightScore - leftScore;
        return (Number(left.timeMs || Infinity) - Number(right.timeMs || Infinity));
      });
    return orderedEntries.slice(0, 10);
  }, [leaderboard.challenge]);

  const quizDifficultyRows = useMemo(() => {
    const orderedDifficulties = ['easy', 'medium', 'hard', 'insane'];
    return orderedDifficulties
      .map((diff) => ({
        difficulty: diff,
        entries: (leaderboard.quiz || [])
          .filter((entry) => entry.difficulty === diff)
          .slice()
          .sort((left, right) => {
            // Primary: global score descending
            const leftGlobal = Number(left.globalScore || 0);
            const rightGlobal = Number(right.globalScore || 0);
            if (rightGlobal !== leftGlobal) return rightGlobal - leftGlobal;
            // Secondary: raw correct count descending
            const leftScore = Number(left.score || 0);
            const rightScore = Number(right.score || 0);
            if (rightScore !== leftScore) return rightScore - leftScore;
            // Tertiary: fastest time
            const leftTime = Number(left.timeMs || Infinity);
            const rightTime = Number(right.timeMs || Infinity);
            return leftTime - rightTime;
          })
          .slice(0, 6),
      }))
      .filter((group) => group.entries.length > 0);
  }, [leaderboard.quiz]);

  // Combined cross-game leaderboard sorted by globalScore
  const allTimeRows = useMemo(() => {
    const combined = [
      ...(leaderboard.quiz || []).map((e) => ({ ...e, gameLabel: 'Quiz' })),
      ...(leaderboard.universle || []).map((e) => ({ ...e, gameLabel: 'Universle' })),
      ...(leaderboard.challenge || []).map((e) => ({ ...e, gameLabel: e.game === 'daily' ? 'Daily' : 'Practice' })),
    ];
    return combined
      .slice()
      .sort((a, b) => Number(b.globalScore || 0) - Number(a.globalScore || 0))
      .slice(0, 12);
  }, [leaderboard.quiz, leaderboard.universle]);

  const sortedUniversle = useMemo(() =>
    (leaderboard.universle || [])
      .slice()
      .sort((a, b) => Number(b.globalScore || 0) - Number(a.globalScore || 0))
      .slice(0, 8),
  [leaderboard.universle]);

  return (
    <div className="page-content astrogames-page">
      {/* ── Hero header ── */}
      <section className="hero astrogames-hero">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={12} style={{ marginRight: '6px' }} color="#a78bfa" /> Cosmic Arcade
          </div>
          <h1 className="hero-title">AstroGames</h1>
          <p className="hero-sub">Two cosmic challenges in one portal — a shared daily sprint, a replayable practice run, and a planetary guessing game built for fast rounds and clean visuals.</p>
          <div className="hero-actions">
            <button
              className={`btn ${activePanel === 'play' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActivePanel('play'); setView('home'); }}
            >
              <Gamepad2 size={15} /> Play
            </button>
            <button
              className={`btn ${activePanel === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActivePanel('leaderboard')}
            >
              <Trophy size={15} /> Leaderboards
            </button>
            {(view !== 'home' || activePanel !== 'play') && (
              <button className="btn btn-secondary" onClick={() => { setActivePanel('play'); setView('home'); }}>
                <RotateCcw size={15} /> Launch pad
              </button>
            )}
          </div>
        </div>
        <div className="orbit-container">
          <div className="orbit-center"></div>
          <div className="orbit-ring ring-1"></div>
          <div className="orbit-ring ring-2"></div>
          <div className="orbit-ring ring-3"></div>
        </div>
      </section>

      {activePanel === 'play' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {view === 'home' && (
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '28px 28px 8px', display: 'grid', gap: '10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content', padding: '6px 12px', borderRadius: '999px', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                  <Sparkles size={14} color="#a78bfa" /> Two games, one sky
                </div>
                <h2 style={{ fontSize: '28px', color: 'var(--text-primary)' }}>A polished astronomy arcade built into the portal.</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>Choose a challenge and play right away. Your scores can be saved to a shared leaderboard and stay synced with the backend when it is available.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', padding: '8px 28px 28px' }}>
                <button
                  onClick={() => { setView('quiz'); setQuizQuestions([]); setQuizFinished(false); setQuizLoading(false); }}
                  className="btn btn-primary"
                  style={{ justifyContent: 'flex-start', padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Gamepad2 size={18} /> Astro Quiz</div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'left' }}>Five astronomy questions with four difficulty tiers and an instant score reveal.</span>
                </button>
                <button onClick={() => startChallenge('daily')} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18} /> Daily challenge</div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'left' }}>A shared challenge stored in the backend and ranked in the daily leaderboard.</span>
                </button>
                <button onClick={() => startChallenge('practice')} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={18} /> Practice challenge</div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'left' }}>A lighter replayable round you can warm up with anytime.</span>
                </button>
                <button onClick={startUniversle} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Orbit size={18} /> Universle</div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'left' }}>Guess the hidden body by type, system, distance and size before you run out of turns.</span>
                </button>
              </div>
            </div>
          )}

          {view === 'quiz' && (
            <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
              {quizLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px 12px', color: 'var(--text-secondary)' }}>
                  <Loader2 size={28} style={{ animation: 'astrogamesSpin 1s linear infinite' }} />
                  <style>{`@keyframes astrogamesSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  <span>Fetching astronomy questions from Open Trivia DB…</span>
                </div>
              ) : !quizQuestions.length ? (
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Choose a difficulty</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Five questions, live from Open Trivia DB when possible, with an offline backup bank if the connection drops.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {[
                      { level: 'easy', title: 'Easy', blurb: 'Warm-up basics', color: '#4ade80' },
                      { level: 'medium', title: 'Medium', blurb: 'Solid astronomy knowledge', color: '#38bdf8' },
                      { level: 'hard', title: 'Hard', blurb: 'For serious space nerds', color: '#fbbf24' },
                      { level: 'insane', title: 'Insane', blurb: 'Expert-tier, no mercy', color: '#f87171' },
                    ].map(({ level, title, blurb, color }) => (
                      <button
                        key={level}
                        className="btn btn-secondary"
                        onClick={() => startQuiz(level)}
                        style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', padding: '16px', borderRadius: '16px', textAlign: 'left', height: 'auto' }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: color, display: 'inline-block' }} />
                          {title}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{blurb}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : !quizFinished ? (
                <>
                  {/* ── Kahoot-style interlude screen ── */}
                  {quizInterlude && (() => {
                    const { isCorrect, pts, streak, answer, isLast } = quizInterlude;
                    const motivations = {
                      correct: [
                        { streak: 0, msg: 'Nice one! Keep it up! 🚀', sub: 'Every correct answer counts.' },
                        { streak: 2, msg: 'Great streak! You\'re on fire! 🔥', sub: 'Two in a row — the cosmos is with you.' },
                        { streak: 3, msg: 'Unstoppable! 🌟', sub: 'Three correct — you\'re a star.' },
                        { streak: 5, msg: 'LEGENDARY! 🏆', sub: 'Five in a row. You know the universe.' },
                      ],
                      wrong: [
                        { msg: 'Not this time — but you\'ve got this! 💫', sub: `Correct answer: ${answer}` },
                      ],
                    };
                    let motivation;
                    if (isCorrect) {
                      const tiers = motivations.correct.filter(m => streak >= m.streak);
                      motivation = tiers[tiers.length - 1] || motivations.correct[0];
                    } else {
                      motivation = motivations.wrong[0];
                    }
                    const ptsPositive = isCorrect;
                    const circumference = 2 * Math.PI * 22;
                    const dashOffset = circumference - (quizInterludeCountdown / 3) * circumference;
                    return (
                      <div key="interlude" style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        padding: '48px 24px',
                        borderRadius: '24px',
                        minHeight: '340px',
                        background: isCorrect
                          ? 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.18) 0%, transparent 65%), linear-gradient(135deg, rgba(20,30,20,0.9), rgba(10,20,30,0.95))'
                          : 'radial-gradient(ellipse at 50% 0%, rgba(248,113,113,0.18) 0%, transparent 65%), linear-gradient(135deg, rgba(30,15,15,0.9), rgba(15,15,25,0.95))',
                        border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(248,113,113,0.25)'}`,
                        overflow: 'hidden',
                        animation: 'astrogamesFadeIn 0.35s ease',
                        textAlign: 'center',
                      }}>
                        <style>{`
                          @keyframes interlundeZoomIn { 0%{transform:scale(0.55);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
                          @keyframes interludeSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
                          @keyframes interludeShimmer { 0%,100%{opacity:1} 50%{opacity:0.65} }
                          @keyframes interludePtsBounce { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.25)} 100%{transform:scale(1);opacity:1} }
                          @keyframes interludeCountSpin { from{stroke-dashoffset:${circumference}} to{stroke-dashoffset:0} }
                        `}</style>

                        {/* Big emoji / result icon */}
                        <div style={{ animation: 'interlundeZoomIn 0.5s cubic-bezier(.34,1.56,.64,1) forwards', fontSize: '64px', lineHeight: 1 }}>
                          {isCorrect ? (streak >= 5 ? '🏆' : streak >= 3 ? '🌟' : streak >= 2 ? '🔥' : '✅') : '❌'}
                        </div>

                        {/* Motivational text */}
                        <div style={{ animation: 'interludeSlideUp 0.45s ease 0.15s both', display: 'grid', gap: '8px' }}>
                          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                            {motivation.msg}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{motivation.sub}</div>
                        </div>

                        {/* Score earned / lost pill */}
                        <div style={{ animation: 'interludePtsBounce 0.45s cubic-bezier(.34,1.56,.64,1) 0.3s both', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <div style={{
                            padding: '10px 22px',
                            borderRadius: '999px',
                            fontWeight: 800,
                            fontSize: '22px',
                            background: ptsPositive ? 'rgba(34,197,94,0.18)' : 'rgba(248,113,113,0.18)',
                            color: ptsPositive ? '#4ade80' : '#f87171',
                            border: `1px solid ${ptsPositive ? 'rgba(34,197,94,0.35)' : 'rgba(248,113,113,0.35)'}`,
                            letterSpacing: '-0.01em',
                          }}>
                            {ptsPositive ? '+' : '−'}{Math.abs(pts)} pts
                          </div>
                          {isCorrect && streak >= 2 && (
                            <div style={{
                              padding: '10px 18px',
                              borderRadius: '999px',
                              fontWeight: 700,
                              fontSize: '16px',
                              background: 'rgba(167,139,250,0.16)',
                              color: '#a78bfa',
                              border: '1px solid rgba(167,139,250,0.3)',
                            }}>
                              🔥 {streak}× streak
                            </div>
                          )}
                        </div>

                        {/* Stats row */}
                        <div style={{ animation: 'interludeSlideUp 0.4s ease 0.45s both', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '13px' }}>
                          <span style={{ padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            ⭐ Total: <strong style={{ color: 'var(--text-primary)' }}>{quizGlobalScore.toLocaleString()} pts</strong>
                          </span>
                          <span style={{ padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            ✓ {quizScore}/{quizQuestions.length} correct
                          </span>
                          <span style={{ padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            🏅 Best streak {bestStreak}
                          </span>
                        </div>

                        {/* Countdown ring */}
                        <div style={{ position: 'absolute', bottom: '20px', right: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                            <circle
                              cx="26" cy="26" r="22"
                              fill="none"
                              stroke={isCorrect ? '#4ade80' : '#f87171'}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={dashOffset}
                              style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                            <text x="26" y="26" textAnchor="middle" dominantBaseline="central" style={{ transform: 'rotate(90deg)', transformOrigin: '26px 26px', fill: 'var(--text-primary)', fontSize: '16px', fontWeight: 700 }}>
                              {quizInterludeCountdown}
                            </text>
                          </svg>
                          <span>{isLast ? 'results…' : 'next question…'}</span>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Hide question UI during interlude */}
                  {!quizInterlude && <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize' }}>
                      {challengeMode === 'daily' ? 'Daily challenge' : challengeMode === 'practice' ? 'Practice challenge' : `Difficulty: ${difficulty}`}
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        textTransform: 'none',
                        background: quizSource === 'daily' ? 'rgba(167,139,250,0.16)' : quizSource === 'practice' ? 'rgba(34,197,94,0.16)' : quizSource === 'live' ? 'rgba(34,197,94,0.16)' : 'rgba(148,163,184,0.16)',
                        color: quizSource === 'daily' ? '#a78bfa' : quizSource === 'practice' ? '#4ade80' : quizSource === 'live' ? '#4ade80' : '#94a3b8',
                      }}>
                        {quizSource === 'daily' ? 'Shared daily challenge' : quizSource === 'practice' ? 'Practice challenge' : quizSource === 'live' ? 'Live · Open Trivia DB' : 'Offline question bank'}
                      </span>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(167, 139, 250, 0.16)', color: '#f5e7ff', fontWeight: 700 }}>Streak x{quizStreak}</span>
                      <span>Score: {quizScore}/{quizQuestions.length}</span>
                      <span style={{ padding: '6px 10px', borderRadius: '999px', background: quizGlobalScore >= 0 ? 'rgba(34,197,94,0.14)' : 'rgba(248,113,113,0.14)', color: quizGlobalScore >= 0 ? '#4ade80' : '#f87171', fontWeight: 700, fontSize: '13px' }}>⭐ {quizGlobalScore.toLocaleString()} pts</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ width: `${quizProgress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #8b5cf6, #38bdf8)', transition: 'width 220ms ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px', flexWrap: 'wrap', gap: '8px' }}>
                      <span>Progress {quizIndex + 1}/{quizQuestions.length}</span>
                      <span>Best streak {bestStreak}</span>
                    </div>
                  </div>
                  <div className="admin-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '12px', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Question {quizIndex + 1}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{quizAnswerTime ? `Last answer: ${Math.round(quizAnswerTime / 1000)}s` : 'Fast answers score higher'}</div>
                    </div>
                    <h3 style={{ fontSize: '24px', marginBottom: '18px' }}>{quizQuestion.question}</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {quizQuestion.options.map((option, optionIndex) => {
                        const isRevealed = Boolean(quizFeedback);
                        const isCorrectAnswer = isRevealed && option === quizQuestion.answer;
                        const isSelected = isRevealed && option === quizFeedback?.selected;
                        const isWrongSelection = isSelected && !isCorrectAnswer;
                        return (
                          <button
                            key={option}
                            className="btn btn-secondary"
                            onClick={() => handleQuizAnswer(option)}
                            disabled={Boolean(chosenAnswer)}
                            style={{
                              justifyContent: 'flex-start',
                              padding: '14px 16px',
                              borderRadius: '16px',
                              textAlign: 'left',
                              transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
                              transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                              animation: isRevealed ? 'astrogamesFadeIn 0.3s ease' : undefined,
                              background: isCorrectAnswer ? 'rgba(34,197,94,0.12)' : isWrongSelection ? 'rgba(248,113,113,0.12)' : undefined,
                              borderColor: isCorrectAnswer ? 'rgba(34,197,94,0.4)' : isWrongSelection ? 'rgba(248,113,113,0.4)' : undefined,
                              boxShadow: isCorrectAnswer ? '0 0 0 1px rgba(34,197,94,0.25)' : isWrongSelection ? '0 0 0 1px rgba(248,113,113,0.25)' : undefined,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                            }}
                          >
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '22px',
                              height: '22px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: 'rgba(255,255,255,0.08)',
                              color: 'var(--text-secondary)',
                              flexShrink: 0,
                            }}>
                              {optionIndex + 1}
                            </span>
                            <span style={{ flex: 1 }}>{option}</span>
                            {isCorrectAnswer && <CheckCircle2 size={18} color="#4ade80" style={{ flexShrink: 0 }} />}
                            {isWrongSelection && <XCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>Tip: press 1–{quizQuestion.options.length} on your keyboard to answer fast.</div>
                    {quizFeedback && (
                      <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '14px', border: `1px solid ${quizFeedback.isCorrect ? 'rgba(34,197,94,0.35)' : 'rgba(248,113,113,0.35)'}`, background: quizFeedback.isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(248,113,113,0.08)', animation: 'astrogamesFadeIn 0.3s ease', display: 'grid', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{quizFeedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}</div>
                          <div style={{ fontWeight: 800, fontSize: '18px', color: quizFeedback.isCorrect ? '#4ade80' : '#f87171' }}>
                            {quizFeedback.isCorrect ? `+${quizFeedback.questionGlobalScore}` : `−${quizFeedback.errorPenalty}`} pts
                          </div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Answer: <strong style={{ color: 'var(--text-primary)' }}>{quizFeedback.answer}</strong>{!quizFeedback.isCorrect && <> · Your pick: {quizFeedback.selected}</>} · Time: {(quizFeedback.timeMs / 1000).toFixed(1)}s</div>
                        {quizFeedback.isCorrect && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '999px', background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>⚡ Speed +{quizFeedback.speedBonus}</span>
                            <span style={{ padding: '3px 8px', borderRadius: '999px', background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>🔥 Streak ×{(1 + Math.min(quizFeedback.streak, 5) * 0.3).toFixed(1)}</span>
                            <span style={{ padding: '3px 8px', borderRadius: '999px', background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>Combo {quizFeedback.streak}</span>
                          </div>
                        )}
                        {!quizFeedback.isCorrect && (
                          <div style={{ fontSize: '12px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Error penalty applied — fewer mistakes = higher global score</span>
                          </div>
                        )}
                      </div>
                    )}
                    {quizPulse && (
                      <div style={{ position: 'relative', height: 0 }}>
                        <div className={`quiz-pop ${quizPulse}`} style={{ position: 'absolute', top: '-12px', right: '0', padding: '8px 12px', borderRadius: '999px', fontWeight: 800, animation: 'astrogamesPop 0.7s ease' }}>
                          {quizPop}
                        </div>
                      </div>
                    )}
                  </div>
                  </>}
                </>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div className="admin-card" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(56, 189, 248, 0.12))' }}>
                    <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '12px' }}>Mission complete</div>
                    <div style={{ fontSize: '13px', color: '#a78bfa', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Global Score</div>
                    <h3 style={{ fontSize: '56px', margin: '4px 0 2px', background: (savePayload?.globalScore ?? quizGlobalScore) >= 0 ? 'linear-gradient(90deg, #a78bfa, #38bdf8)' : 'linear-gradient(90deg, #f87171, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                      {Number(savePayload?.globalScore ?? quizGlobalScore).toLocaleString()}
                    </h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>{quizScore}/{quizQuestions.length} correct · {quizQuestions.length - quizScore} errors</div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                      <span className="admin-summary-item" style={{ padding: '8px 12px' }}>✓ Accuracy {(quizScore / quizQuestions.length * 100).toFixed(0)}%</span>
                      <span className="admin-summary-item" style={{ padding: '8px 12px' }}>⚡ Last answer {quizAnswerTime ? `${(quizAnswerTime / 1000).toFixed(1)}s` : '—'}</span>
                      <span className="admin-summary-item" style={{ padding: '8px 12px' }}>🔥 Best streak {bestStreak}</span>
                      <span className="admin-summary-item" style={{ padding: '8px 12px', textTransform: 'capitalize' }}>📚 {difficulty}</span>
                      <span className="admin-summary-item" style={{ padding: '8px 12px', color: '#f87171' }}>✗ Errors −{(quizQuestions.length - quizScore) * (QUIZ_ERROR_PENALTY[difficulty] || 30)}</span>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'left', lineHeight: 1.7 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Score formula:</strong> (base × difficulty × streak) + speed bonus − error penalties<br />
                      Correct: <span style={{ color: '#4ade80' }}>+200–800 pts</span> · Speed: <span style={{ color: '#38bdf8' }}>up to +120 pts</span> · Wrong: <span style={{ color: '#f87171' }}>−{QUIZ_ERROR_PENALTY[difficulty] || 30} pts each</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input className="admin-input" value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Your name" />
                    <button className="btn btn-primary" onClick={saveQuizScore}>Save score</button>
                    <button className="btn btn-secondary" onClick={() => { setQuizQuestions([]); setQuizFinished(false); setQuizLoading(false); }}>Change difficulty</button>
                    <button className="btn btn-secondary" onClick={() => startQuiz(difficulty)}>Play again · {difficulty}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'universle' && (
            <div className="admin-card" style={{ display: 'grid', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '12px' }}>Universle</div>
                  <h3 style={{ fontSize: '24px', marginTop: '4px' }}>Identify the hidden celestial body</h3>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUniversleGuide((value) => !value)}
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  >
                    {showUniversleGuide ? 'Hide guide' : 'How to play'}
                  </button>
                  <span className="admin-summary-item" style={{ padding: '8px 12px' }}>⏱ {formatTime(universleSeconds)}</span>
                  <span className="admin-summary-item" style={{ padding: '8px 12px' }}>Attempts {universleGuessCount}/7</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: '6px',
                      borderRadius: '999px',
                      background: index < universleGuessCount
                        ? (universleWon && index === universleGuessCount - 1 ? '#22c55e' : 'rgba(167, 139, 250, 0.55)')
                        : 'rgba(255,255,255,0.08)',
                      transition: 'background 200ms ease',
                    }}
                  />
                ))}
              </div>

              {showUniversleGuide && (
                <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', background: 'rgba(167, 139, 250, 0.06)', display: 'grid', gap: '10px', animation: 'astrogamesFadeIn 0.25s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#a78bfa' }}>
                    <Sparkles size={16} /> How to play
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                    A planet, moon, or dwarf planet is hidden in the scene on the left. Type a name below — even a single letter surfaces matching worlds — and submit a guess. You have 7 attempts. Each guess reveals five clues compared against the target:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                    {[
                      { label: 'Type', detail: 'Planet, Moon, or Dwarf Planet — exact match or miss' },
                      { label: 'System', detail: 'Which body it orbits — exact match or miss' },
                      { label: 'Distance', detail: 'Distance from the Sun, with closer/farther hints' },
                      { label: 'Size', detail: 'Relative radius compared to Earth' },
                      { label: 'Temp', detail: 'Average surface temperature' },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.label}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{item.detail}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '999px', background: '#4ade80', display: 'inline-block' }} /> Match</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '999px', background: '#fbbf24', display: 'inline-block' }} /> Close</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '999px', background: '#f87171', display: 'inline-block' }} /> Off target</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
                <div className="admin-card" style={{ minHeight: '360px', padding: '0', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, padding: '6px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(9, 9, 11, 0.72)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Drag to orbit • target highlighted
                  </div>
                  <PlanetScene targetBody={universleTarget} bodies={universleBodies} />
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <form onSubmit={(event) => submitUniversleGuess(event)} style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input className="admin-input" value={universleGuess} onChange={handleUniversleGuessChange} placeholder="Type a planet, moon or dwarf" />
                      <button type="submit" className="btn btn-primary">Guess</button>
                    </div>
                    {universleSuggestions.length > 0 && (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {universleSuggestions.map((body) => (
                          <button key={body.id} type="button" className="btn btn-secondary" onClick={() => selectUniversleSuggestion(body)} style={{ justifyContent: 'space-between', padding: '10px 12px', borderRadius: '12px' }}>
                            <span>{body.name}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{body.type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </form>
                  {universleTarget && !universleFinished && (
                    <div style={{ padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, color: '#a78bfa' }}>Clue board</div>
                        <span style={{ padding: '4px 8px', borderRadius: '999px', background: 'rgba(167, 139, 250, 0.16)', color: '#a78bfa', fontSize: '12px' }}>Multiplier ×{universleMultiplier.toFixed(1)}</span>
                      </div>
                      <div style={{ marginBottom: '10px' }}>Target: {universleTarget.type} in the {universleTarget.system} system. Compare type, system, distance from the Sun, temperature and size.</div>
                      {universleHintRows.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)' }}>Metric</th>
                                <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)' }}>State</th>
                                <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-secondary)' }}>Detail</th>
                              </tr>
                            </thead>
                            <tbody>
                              {universleHintRows.map((row) => {
                                const tone = getStateTone(row.state);
                                return (
                                  <tr key={row.label}>
                                    <td style={{ padding: '6px 0', color: 'var(--text-primary)' }}>{row.label}</td>
                                    <td style={{ padding: '6px 0' }}>
                                      <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '999px', background: tone.background, color: tone.color, fontWeight: 700 }}>{tone.label}</span>
                                    </td>
                                    <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>{row.detail}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {universleHistory.length ? [...universleHistory].reverse().map((entry, reversedIndex) => {
                      const guessNumber = universleHistory.length - reversedIndex;
                      const attributes = [
                        { label: 'Type', state: entry.status.typeMatch ? 'match' : 'miss' },
                        { label: 'System', state: entry.status.systemMatch ? 'match' : 'miss' },
                        { label: 'Dist', state: entry.status.distanceState },
                        { label: 'Size', state: entry.status.sizeState },
                        { label: 'Temp', state: entry.status.temperatureState },
                      ];
                      return (
                        <div key={`${entry.name}-${guessNumber}`} style={{ padding: '12px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '13px', display: 'grid', gap: '8px', animation: reversedIndex === 0 ? 'astrogamesFadeIn 0.3s ease' : undefined }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>#{guessNumber}</span>
                              <strong>{entry.name}</strong>
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>{entry.type}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                            {attributes.map((attribute) => {
                              const tone = getStateTone(attribute.state);
                              return (
                                <div
                                  key={attribute.label}
                                  title={attribute.label}
                                  style={{
                                    textAlign: 'center',
                                    padding: '6px 4px',
                                    borderRadius: '8px',
                                    background: tone.background,
                                    color: tone.color,
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    letterSpacing: '0.02em',
                                  }}
                                >
                                  <div>{attribute.label}</div>
                                  <div style={{ fontSize: '9px', fontWeight: 500, opacity: 0.85, marginTop: '2px' }}>{tone.label}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }) : <div style={{ padding: '16px', borderRadius: '14px', border: '1px dashed var(--border)', color: 'var(--text-secondary)' }}>Type a name like "m" to see matching worlds and moons.</div>}
                  </div>
                </div>
              </div>

              {universleFinished && (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div className="admin-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.16em' }}>{universleWon ? 'You found the target' : 'Round over'}</div>
                    <div style={{ fontSize: '13px', color: '#a78bfa', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Global Score</div>
                    <h3 style={{ fontSize: '48px', margin: '4px 0 2px', background: universleWon ? 'linear-gradient(90deg, #4ade80, #38bdf8)' : 'linear-gradient(90deg, #f87171, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                      {savePayload?.globalScore ?? 0}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span className="admin-summary-item" style={{ padding: '6px 10px', fontSize: '12px' }}>{universleGuessCount}/7 guesses</span>
                      <span className="admin-summary-item" style={{ padding: '6px 10px', fontSize: '12px' }}>Time {formatTime(universleSeconds)}</span>
                      <span className="admin-summary-item" style={{ padding: '6px 10px', fontSize: '12px' }}>Proximity {universleProximityTotal} pts</span>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.7, textAlign: 'left' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Score formula:</strong> win bonus + guess savings − error penalty + time bonus + proximity<br />
                      Win: <span style={{ color: '#4ade80' }}>+500</span> · Each saved guess: <span style={{ color: '#38bdf8' }}>+120</span> · Each wrong guess: <span style={{ color: '#f87171' }}>−40</span> · Speed: <span style={{ color: '#a78bfa' }}>up to +400</span> · Proximity: cumulative closeness pts
                    </div>
                  </div>
                  <div className="admin-card" style={{ padding: '16px', display: 'grid', gap: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Target profile</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                        <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}><div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Type</div><div style={{ fontWeight: 700, marginTop: '4px' }}>{universleTarget.type}</div></div>
                        <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}><div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>System</div><div style={{ fontWeight: 700, marginTop: '4px' }}>{universleTarget.system}</div></div>
                        <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}><div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Distance</div><div style={{ fontWeight: 700, marginTop: '4px' }}>{universleTarget.distAU.toFixed(2)} AU</div></div>
                        <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}><div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Temp</div><div style={{ fontWeight: 700, marginTop: '4px' }}>{universleTarget.tempC}°C</div></div>
                      </div>
                    </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input className="admin-input" value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Your name" />
                    <button className="btn btn-primary" onClick={saveUniversleScore}>Save result</button>
                    <button className="btn btn-secondary" onClick={startUniversle}>Try another</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activePanel === 'leaderboard' && (
        <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              <Trophy size={14} /> Leaderboards
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className={`btn ${leaderboardView === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLeaderboardView('all')}>🏆 All-Time</button>
              <button className={`btn ${leaderboardView === 'quiz' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLeaderboardView('quiz')}>Quiz</button>
              <button className={`btn ${leaderboardView === 'daily' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLeaderboardView('daily')}>Daily</button>
              <button className={`btn ${leaderboardView === 'practice' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLeaderboardView('practice')}>Practice</button>
              <button className={`btn ${leaderboardView === 'universle' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLeaderboardView('universle')}>Universle</button>
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: '14px', background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.18)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            ★ Rankings are sorted by <strong style={{ color: 'var(--text-primary)' }}>Global Score</strong> — a single number combining accuracy, speed, streak (quiz) or win bonus, guess efficiency, time and proximity (Universle).
          </div>

          {leaderboardView === 'all' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {allTimeRows.length ? allTimeRows.map((entry, index) => (
                <div key={`all-${entry.gameLabel}-${entry.date}-${index}`} style={{ padding: '12px 14px', borderRadius: '14px', background: index === 0 ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${index === 0 ? 'rgba(167,139,250,0.4)' : 'var(--border)'}`, display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', minWidth: '24px' }}>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{entry.name}</strong>
                        <span style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '10px', background: entry.gameLabel === 'Quiz' ? 'rgba(56,189,248,0.15)' : 'rgba(167,139,250,0.15)', color: entry.gameLabel === 'Quiz' ? '#38bdf8' : '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{entry.gameLabel}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                        {entry.gameLabel === 'Quiz'
                          ? `${entry.score}/${entry.total} correct · ${entry.difficulty} · ${(entry.pct * 100).toFixed(0)}% accuracy`
                          : `${entry.target} · ${entry.guesses} guesses · ${entry.timeSec ? formatTime(entry.timeSec) : '—'} · ${entry.won ? '✓ Won' : '× Lost'}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '20px', background: 'linear-gradient(90deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{Number(entry.globalScore || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>pts</div>
                  </div>
                </div>
              )) : <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No scores yet. Play a game and save your result!</div>}
            </div>
          )}

          {leaderboardView === 'quiz' && (
            <div style={{ display: 'grid', gap: '14px' }}>
              {quizDifficultyRows.length ? quizDifficultyRows.map((group) => {
                const sorted = [...group.entries].sort((a, b) => (b.globalScore || 0) - (a.globalScore || 0));
                return (
                  <div key={group.difficulty}>
                    <div style={{ marginBottom: '8px', textTransform: 'capitalize', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: { easy: '#4ade80', medium: '#38bdf8', hard: '#fbbf24', insane: '#f87171' }[group.difficulty], display: 'inline-block' }} />
                      {group.difficulty}
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {sorted.map((entry, index) => (
                        <div key={`${entry.name}-${entry.date}-${index}`} style={{ padding: '12px 14px', borderRadius: '14px', background: index === 0 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${index === 0 ? 'rgba(167,139,250,0.3)' : 'var(--border)'}`, display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px', minWidth: '20px' }}>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                            <div>
                              <strong>{entry.name}</strong>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{entry.score}/{entry.total} correct · {entry.timeMs ? `${Math.round(entry.timeMs / 1000)}s` : '—'} · {(entry.pct * 100).toFixed(0)}% accuracy</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '18px', background: 'linear-gradient(90deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{entry.globalScore ?? '—'}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>pts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }) : <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No quiz scores yet.</div>}
            </div>
          )}

          {leaderboardView === 'daily' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {challengeRows.filter((entry) => entry.game === 'daily').length ? challengeRows.filter((entry) => entry.game === 'daily').map((entry, index) => (
                <div key={`daily-${entry.date}-${index}`} style={{ padding: '12px 14px', borderRadius: '14px', background: index === 0 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${index === 0 ? 'rgba(167,139,250,0.3)' : 'var(--border)'}`, display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', minWidth: '20px' }}>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                    <div>
                      <strong>{entry.name}</strong>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{entry.challengeTitle || 'Daily Cosmic Sprint'} · {entry.score}/{entry.total} correct · {(entry.pct * 100).toFixed(0)}% accuracy</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', background: 'linear-gradient(90deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{entry.globalScore ?? '—'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>pts</div>
                  </div>
                </div>
              )) : <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No daily challenges completed yet.</div>}
            </div>
          )}

          {leaderboardView === 'practice' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {challengeRows.filter((entry) => entry.game === 'practice').length ? challengeRows.filter((entry) => entry.game === 'practice').map((entry, index) => (
                <div key={`practice-${entry.date}-${index}`} style={{ padding: '12px 14px', borderRadius: '14px', background: index === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${index === 0 ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', minWidth: '20px' }}>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                    <div>
                      <strong>{entry.name}</strong>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{entry.challengeTitle || 'Practice Orbit'} · {entry.score}/{entry.total} correct · {(entry.pct * 100).toFixed(0)}% accuracy</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', background: 'linear-gradient(90deg, #4ade80, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{entry.globalScore ?? '—'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>pts</div>
                  </div>
                </div>
              )) : <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No practice challenges completed yet.</div>}
            </div>
          )}

          {leaderboardView === 'universle' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {leaderboard.universle.length ? [...leaderboard.universle].sort((a, b) => (b.globalScore || 0) - (a.globalScore || 0)).slice(0, 10).map((entry, index) => (
                <div key={`${entry.name}-${entry.date}-${index}`} style={{ padding: '12px 14px', borderRadius: '14px', background: index === 0 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${index === 0 ? 'rgba(167,139,250,0.3)' : 'var(--border)'}`, display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', minWidth: '20px' }}>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                    <div>
                      <strong>{entry.name}</strong>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                        {entry.target} · {entry.guesses} guesses · {entry.timeSec ? formatTime(entry.timeSec) : '—'}
                        <span style={{ marginLeft: '6px', color: entry.won ? '#4ade80' : '#f59e0b', fontWeight: 600 }}>{entry.won ? '✓ Won' : '× Lost'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', background: entry.won ? 'linear-gradient(90deg, #4ade80, #38bdf8)' : 'linear-gradient(90deg, #f87171, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{entry.globalScore ?? '—'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>pts</div>
                  </div>
                </div>
              )) : <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No Universle runs yet.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AstroGames;