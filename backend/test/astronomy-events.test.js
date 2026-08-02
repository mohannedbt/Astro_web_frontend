const assert = require('assert');
const { astronomyEventsRoutes } = require('../src/routes/astronomy-events');

const events = {};
const app = {
  get(path, handler) {
    events[path] = handler;
  }
};

astronomyEventsRoutes(app);

(async () => {
  let payload;
  await events['/api/astronomy-events']({ query: { year: 2026, month: 7 } }, {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(nextPayload) {
      payload = nextPayload;
      return this;
    }
  });

  const target = payload.events['2026-08-13'];
  assert(target, 'Expected August 13 Perseids event to exist');
  assert(target[0].link && target[0].link.startsWith('https://'), 'Expected a valid HTTPS link');
  assert(target[0].link.includes('science.nasa.gov'), 'Expected a NASA-backed source link');
  console.log('astronomy-events test passed');
})();
