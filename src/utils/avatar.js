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
  const cell = size / 4;
  const hue = Math.floor(rand() * 360);
  const color = `hsl(${hue} 68% 46%)`;

  const squares = [];
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const x = column * cell;
      const y = row * cell;
      const fill = rand() > 0.5 ? color : '#ffffff';
      squares.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${fill}" />`);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="#ffffff"/>${squares.join('')}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
