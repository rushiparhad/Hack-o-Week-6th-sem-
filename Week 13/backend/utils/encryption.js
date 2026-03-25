const crypto = require('crypto');

// Key must be exactly 32 bytes for AES-256
const RAW_KEY = process.env.ENCRYPTION_KEY || 'my-dashboard-secret-key-32chars!';
const KEY_BUFFER = Buffer.from(RAW_KEY.substring(0, 32).padEnd(32, '0'));
const IV_LENGTH = 16;

function encrypt(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY_BUFFER, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    data: encrypted,
  };
}

function decrypt(encryptedObj) {
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY_BUFFER, iv);
  let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };
