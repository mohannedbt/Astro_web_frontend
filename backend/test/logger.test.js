const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const logger = require('../src/utils/logger');

test('logger exposes info and error methods', () => {
  assert.equal(typeof logger.info, 'function');
  assert.equal(typeof logger.error, 'function');
});

test('logger writes to a file when LOG_FILE is configured', () => {
  const tempFile = path.join(os.tmpdir(), `astro-logger-${process.pid}.log`);
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }

  process.env.LOG_FILE = tempFile;
  delete require.cache[require.resolve('../src/utils/logger')];

  const fileLogger = require('../src/utils/logger');
  fileLogger.info('hello file logging');

  const content = fs.readFileSync(tempFile, 'utf8');
  assert.match(content, /hello file logging/);
});
