import {
  setData,
} from './dataStore';
/**
 * <clearV1>
 * Resets the internal data of the application to its initial state
 *
 *
 * @param {} - empty object
 * * *
 * @returns {} - empty object
 */
export function clearV1(): Record<string, never> {
  const data = {
    users: [
    ],
    channels: [
    ],
    dms: [
    ]
  };
  setData(data);
  return {};
}
