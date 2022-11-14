import { dataStoreUserToUser } from './utils';
import { database } from './dataStore';
import { error, user } from './types';
import validator from 'validator';
import HTTPError from 'http-errors';

/**
 * For a valid user, return info about their user ID, email, firstname , last name and handle
 *
 *
 * @param {number} authUserId - userId of user asking to view
 * @param {number} uID - userId of user to look at
 * * *
 * @returns {user} - Object containing uId, email, nameFirst, nameLast, handleStr
 */
export function userProfile(token: string, uID: number): { user: user } | error {
  const user = database.getUserByToken(token);

  return { user: dataStoreUserToUser(user) };
}

/**
  * <For a valid user, change their current email to new email input>
  *
  * @param {string} token - unique token associated with user login
  * @param {string} handleStr- new handleStr user would like to change to
  *
*/
export function userProfileHandleChange(token: string, handleStr: string): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  database.updateUserHandleStr(user.uId, handleStr);
  return {};
}

/**
  * <For a valid user, change their current email to new email input>
  *
  * @param {string} token - unique token associated with user login
  * @param {string} email - new email user would like to change to
  *
*/
export function userProfileEmailChange(token: string, email: string): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid Email');
  }
  database.updateUserEmail(user.uId, email);
  return {};
}

/**
  * <For a valid user, the function will change the first and last name if requested>
  *
  * @param {string} token - description of paramter
  * @param {string} nameFirst - description of parameter
  * @param {string} nameLast - description of parameter
*/
export function userProfileNameChange(token: string, nameFirst: string, nameLast: string): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  database.updateUserName(user.uId, nameFirst, nameLast);
  return {};
}

/**
  * Returns a list of all users and their associated details.
  *
  * @param {string} token - an object that represents the right to perform certain actions
  *
  * @returns {users} - array of objects, where each object contains types of user
*/
export function listAllUsersV1(token: string): ({ users: user[] } | error) {
  database.getUserByToken(token);
  return { users: database.users.map(user => dataStoreUserToUser(user)) };
}
