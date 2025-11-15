/**
 * Sponsor-specific encryption utilities
 * Uses existing crypto.ts for AES-GCM encryption
 * Stores shared secrets per relationship securely
 */

import { encrypt, decrypt } from './crypto';

const STORAGE_PREFIX = 'sponsor_secret_';

/**
 * Generate a shared secret for a relationship
 * This will be stored securely and used for all messages in this relationship
 */
export async function generateSharedSecret(relationshipId: string): Promise<string> {
  // Generate a random passphrase for this relationship
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Store it securely (localStorage for web, can be expo-secure-store for mobile)
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${relationshipId}`, secret);
  } catch (error) {
    console.error('Failed to store shared secret:', error);
    throw new Error('Failed to store encryption key');
  }
  
  return secret;
}

/**
 * Get the shared secret for a relationship
 */
export async function getSharedSecret(relationshipId: string): Promise<string | null> {
  try {
    const secret = localStorage.getItem(`${STORAGE_PREFIX}${relationshipId}`);
    return secret;
  } catch (error) {
    console.error('Failed to retrieve shared secret:', error);
    return null;
  }
}

/**
 * Ensure a shared secret exists for a relationship
 * If it doesn't exist, generate one
 */
async function ensureSharedSecret(relationshipId: string): Promise<string> {
  let secret = await getSharedSecret(relationshipId);
  if (!secret) {
    secret = await generateSharedSecret(relationshipId);
  }
  return secret;
}

// Store salt per relationship for proper decryption (consistent salt per relationship)
const SALT_STORAGE_PREFIX = 'sponsor_salt_';

/**
 * Get or generate a consistent salt for a relationship
 */
function getOrCreateSalt(relationshipId: string): string {
  try {
    const existingSalt = localStorage.getItem(`${SALT_STORAGE_PREFIX}${relationshipId}`);
    if (existingSalt) {
      return existingSalt;
    }
    
    // Generate a new salt
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const salt = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    const saltBase64 = btoa(String.fromCharCode(...array));
    
    localStorage.setItem(`${SALT_STORAGE_PREFIX}${relationshipId}`, saltBase64);
    return saltBase64;
  } catch (error) {
    console.error('Failed to get/create salt:', error);
    // Return empty salt as fallback (not ideal but allows encryption to proceed)
    return '';
  }
}

/**
 * Encrypt a message for a sponsor relationship
 */
export async function encryptMessage(
  content: string,
  relationshipId: string
): Promise<{ ciphertext: string; nonce: string }> {
  try {
    const secret = await ensureSharedSecret(relationshipId);
    const salt = getOrCreateSalt(relationshipId);
    
    // Encrypt with consistent salt by deriving key manually
    const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBytes = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      new TextEncoder().encode(content)
    );
    
    const ciphertext = btoa(String.fromCharCode(...new Uint8Array(encryptedBytes)));
    const nonceBase64 = btoa(String.fromCharCode(...iv));
    
    return {
      ciphertext,
      nonce: nonceBase64,
    };
  } catch (error) {
    console.error('Failed to encrypt message:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message for a sponsor relationship
 */
export async function decryptMessage(
  ciphertext: string,
  nonce: string,
  relationshipId: string
): Promise<string> {
  try {
    const secret = await getSharedSecret(relationshipId);
    if (!secret) {
      throw new Error('Shared secret not found for this relationship');
    }
    
    // Get salt from storage
    const salt = getOrCreateSalt(relationshipId);
    if (!salt) {
      throw new Error('Salt not found for this relationship');
    }
    
    // Decrypt manually using consistent salt
    const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(nonce), c => c.charCodeAt(0));
    const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      derivedKey,
      ciphertextBytes
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Failed to decrypt message:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Delete a shared secret (when relationship is revoked)
 */
export function deleteSharedSecret(relationshipId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${relationshipId}`);
  } catch (error) {
    console.error('Failed to delete shared secret:', error);
  }
}

