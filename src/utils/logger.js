/**
 * Logger Utility for YEZ BEE Shopify Migration System
 * Handles formatted console output and persistent file logging with strict secret sanitization.
 */

const fs = require('fs');
const path = require('path');

// ANSI Color Codes
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

const LOGS_DIR = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOGS_DIR, 'migration.log');
const ERROR_FILE = path.join(LOGS_DIR, 'error.log');

// Regex patterns to identify and redact sensitive information
const SENSITIVE_PATTERNS = [
  /shpat_[a-zA-Z0-9]{32,}/g,
  /shpca_[a-zA-Z0-9]{32,}/g,
  /shppa_[a-zA-Z0-9]{32,}/g,
  /shpss_[a-zA-Z0-9]{32,}/g,
  /Bearer\s+[a-zA-Z0-9_\-\.]{15,}/gi,
  /client_secret["']?\s*[:=]\s*["']?([^"',\s]+)/gi,
  /private_key["']?\s*[:=]\s*["']?([^"',\s]+)/gi,
  /"private_key":\s*"[^"]+"/g
];

/**
 * Sanitizes any string to remove credentials, API tokens, and private keys
 * @param {string} text 
 * @returns {string} Sanitized string
 */
function sanitize(text) {
  if (typeof text !== 'string') {
    try {
      text = JSON.stringify(text);
    } catch {
      text = String(text);
    }
  }

  // Redact known environment variables if set
  if (process.env.SHOPIFY_CLIENT_SECRET && process.env.SHOPIFY_CLIENT_SECRET.length > 5) {
    text = text.split(process.env.SHOPIFY_CLIENT_SECRET).join('[REDACTED_CLIENT_SECRET]');
  }
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN.length > 5) {
    text = text.split(process.env.SHOPIFY_ADMIN_ACCESS_TOKEN).join('[REDACTED_ACCESS_TOKEN]');
  }

  let sanitized = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      if (match.startsWith('Bearer')) return 'Bearer [REDACTED_TOKEN]';
      if (match.includes('private_key')) return '"private_key": "[REDACTED_PRIVATE_KEY]"';
      if (match.includes('client_secret')) return 'client_secret=[REDACTED]';
      return '[REDACTED_TOKEN]';
    });
  }

  return sanitized;
}

/**
 * Writes log entry to disk asynchronously
 * @param {string} filepath 
 * @param {string} line 
 */
function appendToFile(filepath, line) {
  try {
    fs.appendFileSync(filepath, line + '\n', 'utf8');
  } catch (err) {
    // Fail silently on logging error to avoid interrupting migration
  }
}

/**
 * Format timestamp
 */
function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info(message, ...args) {
    const raw = [message, ...args].map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    const clean = sanitize(raw);
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.blue}[INFO]${COLORS.reset} ${clean}`);
    appendToFile(LOG_FILE, `[${timestamp()}] [INFO] ${clean}`);
  },

  success(message, ...args) {
    const raw = [message, ...args].map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    const clean = sanitize(raw);
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.green}${COLORS.bold}[SUCCESS]${COLORS.reset} ${clean}`);
    appendToFile(LOG_FILE, `[${timestamp()}] [SUCCESS] ${clean}`);
  },

  warn(message, ...args) {
    const raw = [message, ...args].map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    const clean = sanitize(raw);
    console.warn(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}${COLORS.bold}[WARN]${COLORS.reset} ${clean}`);
    appendToFile(LOG_FILE, `[${timestamp()}] [WARN] ${clean}`);
  },

  error(message, error) {
    let details = '';
    if (error) {
      if (error.stack) {
        details = `\n${error.stack}`;
      } else if (typeof error === 'object') {
        details = `\n${JSON.stringify(error, null, 2)}`;
      } else {
        details = ` ${error}`;
      }
    }
    const cleanMsg = sanitize(message + details);
    console.error(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.red}${COLORS.bold}[ERROR]${COLORS.reset} ${cleanMsg}`);
    appendToFile(LOG_FILE, `[${timestamp()}] [ERROR] ${cleanMsg}`);
    appendToFile(ERROR_FILE, `[${timestamp()}] [ERROR] ${cleanMsg}`);
  },

  debug(message, ...args) {
    if (process.env.DEBUG === 'true' || process.env.VERBOSE === 'true') {
      const raw = [message, ...args].map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
      const clean = sanitize(raw);
      console.log(`${COLORS.gray}[${timestamp()}] [DEBUG] ${clean}${COLORS.reset}`);
      appendToFile(LOG_FILE, `[${timestamp()}] [DEBUG] ${clean}`);
    }
  },

  banner(title) {
    const line = '='.repeat(68);
    console.log(`\n${COLORS.cyan}${line}${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.cyan}  ${title}${COLORS.reset}`);
    console.log(`${COLORS.cyan}${line}${COLORS.reset}\n`);
    appendToFile(LOG_FILE, `\n=== ${title} ===`);
  },

  section(title) {
    console.log(`\n${COLORS.yellow}${COLORS.bold}--- ${title} ---${COLORS.reset}`);
  },

  step(stepNumber, totalSteps, title) {
    console.log(`\n${COLORS.magenta}${COLORS.bold}[Step ${stepNumber}/${totalSteps}] ${title}${COLORS.reset}`);
  },

  sanitize
};

module.exports = logger;
