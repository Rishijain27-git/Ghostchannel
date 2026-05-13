/**
 * GhostChannel Crypto Module
 * AES-256-GCM encryption with PBKDF2 key derivation
 * 100% client-side using Web Crypto API
 */

const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12;   // 96 bits for GCM
const ITERATIONS = 100000;
const KEY_LENGTH = 256; // bits

/**
 * Derive an AES-256 key from a password using PBKDF2
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,

      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}


/**
 * Encrypt a message with AES-256-GCM
 * Returns: salt(16B) + IV(12B) + ciphertext + authTag
 */
export async function encrypt(message: string, password: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const messageData = encoder.encode(message);

  // Generate random salt and IV
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  const iv = new Uint8Array(IV_LENGTH);
  crypto.getRandomValues(iv);


  // Derive key from password
  const key = await deriveKey(password, salt);

  // Encrypt (auth tag is automatically appended by Web Crypto API)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    messageData
  );

  // Bundle: salt + iv + ciphertext
  const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
  result.set(salt, 0);
  result.set(iv, SALT_LENGTH);
  result.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

  return result;
}

/**
 * Decrypt data encrypted with AES-256-GCM
 * Input format: salt(16B) + IV(12B) + ciphertext + authTag
 */
export async function decrypt(encryptedData: Uint8Array, password: string): Promise<string> {
  const decoder = new TextDecoder();

  // Extract components
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = encryptedData.slice(SALT_LENGTH + IV_LENGTH);

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Decrypt (will throw if auth tag verification fails)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return decoder.decode(decrypted);
}

/**
 * Get the AES overhead size in bytes (salt + iv + auth tag)
 */
export function getAESOverhead(): number {
  return SALT_LENGTH + IV_LENGTH + 16; // 16 bytes for GCM auth tag
}
