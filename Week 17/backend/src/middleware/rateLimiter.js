const rateLimit = require('express-rate-limit');

const exportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many export requests. Please try again later.' }
});

module.exports = { exportRateLimiter };
