import {
  setData,
  getData,
} from './dataStore';
import validator from 'validator';
import { authUserId, error, dataStoreUser } from './types';
import { addSessionTokenForUser, getDataStoreUserByEmail, isEmailUsed, isHandleStrExist } from './utils';

let uniqueuserID = 0;
let totallyUnpredictableToken = 0;

/**
 * Given a registered user's email and password, returns their authUserId value
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 *
 * @returns {authUserId} an object containing authUserId
 */
export function authLoginV1(email: string, password: string): (authUserId | error) {
  const data = getData();

  // checking if email has already been used
  if (!isEmailUsed(email, data.users)) {
    return { error: 'Email address is not registered' };
  }

  const user = getDataStoreUserByEmail(email, data);
  if (user.password !== password) {
    return { error: 'Wrong password' };
  } else {
    const token = totallyUnpredictableToken.toString();
    const ret = {
      token,
      authUserId: user.uId
    };
    addSessionTokenForUser(user.uId, token, data);
    totallyUnpredictableToken++;
    return ret;
  }
}

/**
 * Given a user's first and last name, email and password, creates a new account for them and
 * returns new authUserId
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @returns {authUserId} an object containing authUserId
 */
export function authRegisterV1(email: string, password: string,
  nameFirst: string, nameLast: string): (authUserId | error) {
  const data = getData();

  if (!(validator.isEmail(email))) { // checking if email is valid
    return { error: 'Invalid Email' };
  }

  if (isEmailUsed(email, data.users)) {
    return { error: 'Email address already in use' };
  }

  if (password.length < 6) {
    return { error: 'password has to be six characters or longer' };
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'First name has to be between 1 and 50 characters in length' };
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'Last name has to be between 1 and 50 characters in length' };
  }
  let fullname = nameFirst.toLowerCase() + nameLast.toLowerCase();
  fullname = onlyalphanumeric(fullname);
  if (fullname.length > 20) {
    fullname = fullname.substring(0, 20);
  }

  // checking if handleStr already exist and making unique if not already
  let j = 0;
  while (isHandleStrExist(fullname, data.users)) {
    if (j !== 0) {
      fullname = fullname.substring(0, fullname.length - 1);
    }
    fullname = fullname + j;
    j++;
  }

  const isGlobalOwner = data.users.length === 0;

  const uuID: number = uniqueuserID;
  const currentsessionID: string = totallyUnpredictableToken.toString();
  const temp: dataStoreUser = {
    uId: uuID,
    email,
    password,
    nameFirst,
    nameLast,
    handleStr: fullname,
    isGlobalOwner,
    sessionTokens: [currentsessionID]
  };
  totallyUnpredictableToken++;
  uniqueuserID++;
  data.users.push(temp);
  setData(data);

  return {
    authUserId: uuID,
    token: currentsessionID
  };
}

/**
 * Takes in a string and removes all non-alphanumeric values from it
 *
 * @param {string} handle - a username
 * @param {string} password - user's password
 *
 * @returns {string} - returns string containing only alphanumeric values
 */
function onlyalphanumeric(handle:string): string {
  handle = handle.replace(/[^a-z0-9]/gi, '');
  return handle;
}