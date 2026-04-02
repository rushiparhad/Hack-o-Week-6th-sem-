const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization token' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found for token' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
}

module.exports = { auth };
