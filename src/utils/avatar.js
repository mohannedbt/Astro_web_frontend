const createSeededRandom = (seed = '') => {
  const normalized = String(seed || 'astro').toLowerCase();
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(index);
    hash |= 0;
  }
  return () => {
    hash = (hash + 0x6d2b79f5) | 0;
    let result = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

export const createAvatarSeed = (seedBase = '') => {
  const cleaned = (seedBase || '').trim();
  const suffix = Math.random().toString(36).slice(2, 10);
  return cleaned ? `${cleaned}-${suffix}` : `astro-${suffix}`;
};

export const buildAvatarUrl = (seed = '', scale = 80) => {
  const normalizedSeed = (seed || 'astro').toString().trim();
  const rand = createSeededRandom(normalizedSeed);
  const size = Math.max(24, Math.min(96, scale));
  const cell = Math.max(4, Math.round(size / 8));
  const sizePx = Math.floor(size / cell) * cell;
  const palette = ['#0f172a', '#1d4ed8', '#7c3aed', '#f59e0b', '#ef4444', '#14b8a6', '#f8fafc'];

  const squares = [];
  for (let y = 0; y < sizePx; y += cell) {
    for (let x = 0; x < sizePx; x += cell) {
      const color = palette[Math.floor(rand() * palette.length)];
      squares.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${color}" />`);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${sizePx} ${sizePx}"><rect width="100%" height="100%" fill="#020617"/>${squares.join('')}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
