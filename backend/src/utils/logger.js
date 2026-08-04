const fs = require('fs');
const path = require('path');

const levelOrder = ['error', 'warn', 'info', 'debug'];
const currentLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();

function shouldLog(level) {
  return levelOrder.indexOf(level) <= levelOrder.indexOf(currentLevel);
}

function formatValue(value) {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function formatMessage(level, message, details) {
  const timestamp = new Date().toISOString();
  const parts = [`[${timestamp}] [${level.toUpperCase()}] ${message}`];

  if (details) {
    const detailText = Array.isArray(details)
      ? details.map(formatValue).join(' ')
      : formatValue(details);
    if (detailText) {
      parts.push(detailText);
    }
  }

  return parts.join(' ');
}

function writeToFile(line) {
  const logFile = process.env.LOG_FILE;
  if (!logFile) {
    return;
  }

  try {
    const logDir = path.dirname(logFile);
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, `${line}\n`, { encoding: 'utf8' });
  } catch (error) {
    console.error(`[LOGGER] Unable to write to log file ${logFile}:`, error.message);
  }
}

function log(level, message, details) {
  if (!shouldLog(level)) {
    return;
  }

  const line = formatMessage(level, message, details);
  writeToFile(line);

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

module.exports = {
  debug(message, details) {
    log('debug', message, details);
  },
  info(message, details) {
    log('info', message, details);
  },
  warn(message, details) {
    log('warn', message, details);
  },
  error(message, details) {
    log('error', message, details);
  },
};
