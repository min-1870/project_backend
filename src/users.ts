import { getDataStoreUser, isAuthUserIdValid, dataStoreUserToUser } from './utils';
import {
  getData,
} from './dataStore';
import { error, user } from './types';

/**
 * For a valid user, return info about their user ID, email, firstname , last name and handle
 *
 *
 * @param {number} authUserId - userId of user asking to view
 * @param {number} uID - userId of user to look at
 * * *
 * @returns {user} - Object containing uId, email, nameFirst, nameLast, handleStr
 */
export function userProfileV1(authUserId: number, uID: number): {user: user}|error {
  const data = getData();

  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'authUserId is not valid' };
  }

  if (!isAuthUserIdValid(uID, data)) {
    return { error: 'uId is not valid' };
  }

  const dataStoreUser = getDataStoreUser(uID, data);

  return { user: dataStoreUserToUser(dataStoreUser) };
}
