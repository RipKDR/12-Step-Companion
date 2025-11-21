import sodium from "libsodium-wrappers";
import * as SecureStore from "expo-secure-store";
import { ready } from "./crypto-setup";

const KEY_PAIR_STORAGE_KEY = "user_key_pair";

export interface KeyPair {
  publicKey: string; // Base64
  privateKey: string; // Base64
}

export interface EncryptedMessage {
  ciphertext: string; // Base64
  nonce: string; // Base64
}

/**
 * Ensure libsodium is ready
 */
async function ensureReady() {
  await ready;
}

/**
 * Generate and store a new key pair if one doesn't exist
 */
export async function getOrGenerateKeyPair(): Promise<KeyPair> {
  await ensureReady();

  // Try to load existing keys
  const stored = await SecureStore.getItemAsync(KEY_PAIR_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Generate new pair
  const pair = sodium.crypto_box_keypair();
  const keys: KeyPair = {
    publicKey: sodium.to_base64(pair.publicKey),
    privateKey: sodium.to_base64(pair.privateKey),
  };

  // Store securely
  await SecureStore.setItemAsync(KEY_PAIR_STORAGE_KEY, JSON.stringify(keys));
  return keys;
}

/**
 * Encrypt a message for a recipient
 * Uses authenticated encryption (crypto_box_easy)
 */
export async function encryptMessage(
  message: string,
  recipientPublicKeyBase64: string
): Promise<EncryptedMessage> {
  await ensureReady();
  const senderKeys = await getOrGenerateKeyPair();

  const recipientPublicKey = sodium.from_base64(recipientPublicKeyBase64);
  const senderPrivateKey = sodium.from_base64(senderKeys.privateKey);
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

  const ciphertext = sodium.crypto_box_easy(
    message,
    nonce,
    recipientPublicKey,
    senderPrivateKey
  );

  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
  };
}

/**
 * Decrypt a message from a sender
 */
export async function decryptMessage(
  encrypted: EncryptedMessage,
  senderPublicKeyBase64: string
): Promise<string> {
  await ensureReady();
  const recipientKeys = await getOrGenerateKeyPair();

  const ciphertext = sodium.from_base64(encrypted.ciphertext);
  const nonce = sodium.from_base64(encrypted.nonce);
  const senderPublicKey = sodium.from_base64(senderPublicKeyBase64);
  const recipientPrivateKey = sodium.from_base64(recipientKeys.privateKey);

  const decrypted = sodium.crypto_box_open_easy(
    ciphertext,
    nonce,
    senderPublicKey,
    recipientPrivateKey
  );

  return sodium.to_string(decrypted);
}

