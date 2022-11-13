import { database } from './dataStore';
/**
 * Resets the internal data of the application to its initial state
 *
 * @param {} - empty object
 * @returns {} - empty object
 */
export function clear(): Record<string, never> {
  database.clear();
  return {};
}
