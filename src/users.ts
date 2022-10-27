import { getDataStoreUser, isAuthUserIdValid, dataStoreUserToUser } from './utils';
import {
  getData, setData,
} from './dataStore';
import { dataStore, dataStoreUser, error, user } from './types';
import validator from 'validator';

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
    return { error: 'authUserId is not valid' };
  }

  if (!isAuthUserIdValid(uID, data)) {
    return { error: 'uId is not valid' };
  }

  const dataStoreUser = getDataStoreUser(uID, data);

  return { user: dataStoreUserToUser(dataStoreUser) };
}

export function userProfileHandleChange(token: string, handleStr: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  if (handleStr.length < 3 || handleStr.length > 20) {
    return { error: 'handleStr is not correct size' };
  }
  if (!(/^[A-Za-z0-9]*$/.test(handleStr))) {
    return { error: 'handleStr has non-alphanumeric characters' };
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    if (user.handleStr === handleStr) {
      return { error: 'handle is already in use' };
    }
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (user.sessionTokens[j] === token) {
        user.handleStr = handleStr;
        setData(data);
        return {};
      }
    }
  }
  return { error: 'Token is Invalid' };
}

export function userProfileEmailChange(token: string, email: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  if (!(validator.isEmail(email))) { // checking if email is valid
    return { error: 'Invalid Email' };
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    if (user.email === email) {
      return { error: 'email is already in use' };
    }
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (user.sessionTokens[j] === token) {
        user.email = email;
        setData(data);
        return {};
      }
    }
  }
  return { error: 'Token is Invalid' };
}

export function userProfileNameChange(token: string, nameFirst: string, nameLast: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'First name is not the correct length' };
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'handleStr is not correct size' };
  }
  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (user.sessionTokens[j] === token) {
        user.nameFirst = nameFirst;
        setData(data);
        return {};
      }
    }
  }
  for (let l = 0; l < data.users.length; l++) {
    const user: dataStoreUser = data.users[l];
    for (let k = 0; k < user.sessionTokens.length; k++) {
      if (user.sessionTokens[k] === token) {
        user.nameLast = nameLast;
        setData(data);
        return {};
      }
    }
  }
  return { error: 'Token is Invalid' };
}

export function listAllUsersV1(token: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  const users: dataStoreUser[] = data.users;
  if (data.users.length !== 0) {
    return { users };
  }
  return { error: 'Invalid token' };
}
