const crypto = require('crypto');
const env = require('../config/env');

const key = crypto.createHash('sha256').update(env.aesSecret).digest();

function encryptValue(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: authTag.toString('hex')
  };
}

function decryptValue(payload) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(payload.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.content, 'hex')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

module.exports = {
  encryptValue,
  decryptValue
};
