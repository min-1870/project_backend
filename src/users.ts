import { getUser, isAuthUserIdValid, toOutputUser } from './utils';
import {
  getData,
} from './dataStore';

/**
 * For a valid user, return info about their user ID, email, firstname , last name and handle
 *
 *
 * @param {number} authUserId - userId of user asking to view
 * @param {number} uID - userId of user to look at
 * * *
 * @returns {} - empty object
 */
export function userProfileV1(authUserId: number, uID: number): any {
  const data = getData();

  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'authUserId is not valid' };
  }

  if (!isAuthUserIdValid(uID, data)) {
    return { error: 'uId is not valid' };
  }

  const user = getUser(uID, data);

  return toOutputUser(user);
}
