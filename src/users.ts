import { getDataStoreUser, isAuthUserIdValid, dataStoreUserToUser } from './utils';
import {
  getData, setData,
} from './dataStore';
import { dataStore, dataStoreUser, error, user } from './types';
import validator from 'validator';
import HTTPError from 'http-errors';
import { hashToken } from './hash';

/**
 * For a valid user, return info about their user ID, email, firstname , last name and handle
 *
 *
 * @param {number} authUserId - userId of user asking to view
 * @param {number} uID - userId of user to look at
 * * *
 * @returns {user} - Object containing uId, email, nameFirst, nameLast, handleStr
 */
export function userProfileV1(authUserId: number, uID: number): { user: user } | error {
  const data = getData();
  if (!isAuthUserIdValid(authUserId, data)) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isAuthUserIdValid(uID, data)) {
    throw HTTPError(400, 'uId is not valid');
  }

  const dataStoreUser = getDataStoreUser(uID, data);

  return { user: dataStoreUserToUser(dataStoreUser) };
}

/**
  * <For a valid user, change their current email to new email input>
  *
  * @param {string} token - unique token associated with user login
  * @param {string} handleStr- new handleStr user would like to change to
  * ...
  *
*/
export function userProfileHandleChange(token: string, handleStr: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'handleStr is not correct size');
  }
  if (!(/^[A-Za-z0-9]*$/.test(handleStr))) {
    throw HTTPError(400, 'handleStr has non-alphanumeric characters');
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    if (user.handleStr === handleStr) {
      throw HTTPError(400, 'handle is already in use');
    }
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (hashToken(user.sessionTokens[j]) === token) {
        user.handleStr = handleStr;
        setData(data);
        return {};
      }
    }
  }
  throw HTTPError(403, 'Token is Invalid');
}

/**
  * <For a valid user, change their current email to new email input>
  *
  * @param {string} token - unique token associated with user login
  * @param {string} email - new email user would like to change to
  * ...
  *
*/
export function userProfileEmailChange(token: string, email: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  if (!(validator.isEmail(email))) { // checking if email is valid
    throw HTTPError(400, 'Invalid Email');
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    if (user.email === email) {
      throw HTTPError(400, 'email is already in use');
    }
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (hashToken(user.sessionTokens[j]) === token) {
        user.email = email;
        setData(data);
        return {};
      }
    }
  }
  throw HTTPError(403, 'Token is Invalid');
}

/**
  * <For a valid user, the function will change the first and last name if requested>
  *
  * @param {string} token - description of paramter
  * @param {string} nameFirst - description of parameter
  * @param {string} nameLast - description of parameter
  * ...
*/
export function userProfileNameChange(token: string, nameFirst: string, nameLast: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'First name is not correct length');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Last name is not correct length');
  }
  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (hashToken(user.sessionTokens[j]) === token) {
        user.nameFirst = nameFirst;
        user.nameLast = nameLast;
        setData(data);
        return {};
      }
    }
  }
  throw HTTPError(403, 'Token is Invalid');
}

/**
  * Returns a list of all users and their associated details.
  *
  * @param {string} token - an object that represents the right to perform certain actions
  *
  * @returns {users} - array of objects, where each object contains types of user
*/
export function listAllUsersV1(token: string): ({ users: user[] } | error) {
  const data: dataStore = getData();
  const myarray: user[] = [];

  for (const item of data.users) {
    const dataStoreUser = getDataStoreUser(item.uId, data);
    myarray.push(dataStoreUserToUser(dataStoreUser));
  }
  return { users: myarray };
}
