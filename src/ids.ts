import { v4 as uuidv4 } from 'uuid';
import { getData } from './dataStore';
import { isAuthUserIdValid, isChannelIdValid, isDataStoreDmValid, isMessageIdValid } from './utils';

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
  const dataStore = getData();
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (isAuthUserIdValid(id, dataStore)) {
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
  const dataStore = getData();
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (isChannelIdValid(id, dataStore)) {
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
  const dataStore = getData();
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (isMessageIdValid(id, dataStore)) {
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
  const dataStore = getData();
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (isDataStoreDmValid(id, dataStore)) {
    id = Math.floor(Math.random() * maxId);
  }
  return id;
}
