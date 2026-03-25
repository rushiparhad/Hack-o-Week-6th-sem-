const CryptoJS = require('crypto-js');

function deriveKey(secret) {
  return CryptoJS.SHA256(secret);
}

function encryptPayload(payload, secret) {
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = deriveKey(secret);
  const plaintext = JSON.stringify(payload);

  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ciphertext = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
  const ivHex = CryptoJS.enc.Hex.stringify(iv);
  const hmac = CryptoJS.HmacSHA256(`${ivHex}:${ciphertext}`, key).toString(
    CryptoJS.enc.Hex
  );

  return {
    algorithm: 'AES-256-CBC',
    iv: ivHex,
    ciphertext,
    hmac,
  };
}

function decryptPayload(cipherBlob, secret) {
  const key = deriveKey(secret);
  const expectedHmac = CryptoJS.HmacSHA256(
    `${cipherBlob.iv}:${cipherBlob.ciphertext}`,
    key
  ).toString(CryptoJS.enc.Hex);

  if (expectedHmac !== cipherBlob.hmac) {
    throw new Error('HMAC verification failed. Ciphertext may be tampered.');
  }

  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(cipherBlob.ciphertext),
    },
    key,
    {
      iv: CryptoJS.enc.Hex.parse(cipherBlob.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
  if (!plaintext) {
    throw new Error('Failed to decrypt payload. Secret may be incorrect.');
  }

  return JSON.parse(plaintext);
}

module.exports = {
  encryptPayload,
  decryptPayload,
};
