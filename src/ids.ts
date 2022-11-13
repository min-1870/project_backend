import { v4 as uuidv4 } from 'uuid';
import { database } from './dataStore';

/**
 * Generate a token.
 *
 * @returns {string} UUID based token string.
 */
export function generateToken(): string {
  return uuidv4();
}

/**
 * Generate auth user ID.
 *
 * @returns { number }
 */
export function generateAuthUserId(): number {
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (database.isUserIdValid(id)) {
    id = Math.floor(Math.random() * maxId);
  }
  return id;
}

/**
 * Generate channel ID.
 *
 * @returns { number }
 */
export function generateChannelId(): number {
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (database.isChannelIdValid(id)) {
    id = Math.floor(Math.random() * maxId);
  }
  return id;
}

/**
 * Generate message ID.
 *
 * @returns { number }
 */
export function generateMessageId(): number {
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (database.isMessageIdValid(id)) {
    id = Math.floor(Math.random() * maxId);
  }
  return id;
}

/**
 * Generate Dm ID.
 *
 * @returns { number }
 */
export function generateDmId(): number {
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (database.isDmIdValid(id)) {
    id = Math.floor(Math.random() * maxId);
  }
  return id;
}
