import CryptoJS from 'crypto-js';

// Key must match the backend ENCRYPTION_KEY (32 chars for AES-256)
const RAW_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'my-dashboard-secret-key-32chars!';
const ENCRYPTION_KEY = RAW_KEY.substring(0, 32).padEnd(32, '0');

/**
 * Decrypts an AES-256-CBC encrypted payload produced by the backend.
 * @param {{ iv: string, data: string }} encryptedObj - hex-encoded iv and ciphertext
 * @returns {any} parsed JSON value
 */
export function decryptData(encryptedObj) {
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const iv  = CryptoJS.enc.Hex.parse(encryptedObj.iv);

  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Hex.parse(encryptedObj.data),
  });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}
