import {
  setData,
} from './dataStore.js';
/**
 * <clearV1>
 * Resets the internal data of the application to its initial state
 *
 *
 * @param {} - empty object
 * * *
 * @returns {} - empty object
 */
export function clearV1() {
  const data = {
    users: [
    ],
    channels: [
    ]
  };
  setData(data);
  return {};
}
