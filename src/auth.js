import {
  setData,
  getData,
} from './dataStore.js';
import validator from 'validator';

let uniqueuserID = 0;

/**
 * Given a registered user's email and password, returns their authUserId value
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 *
 * @returns {authUserId: authUserId} an object containing authUserId
 */
export function authLoginV1(email, password) {
  const data = getData();

  let i = 0;
  // checking if email has already been used
  while (true) {
    if (i >= data.users.length) {
      return { error: 'Email address is not registered' };
    }
    if (data.users[i].email === email) {
      break;
    }
    i++;
  }
  if (data.users[i].password !== password) {
    return { error: 'Wrong password' };
  } else {
    return { authUserId: data.users[i].uId };
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
 * @returns {authUserId: authUserId} an object containing authUserId
 */
export function authRegisterV1(email, password, nameFirst, nameLast) {
  const data = getData();

  if (!(validator.isEmail(email))) { // checking if email is valid
    return { error: 'Invalid Email' };
  }

  let i = 0;
  // checking if email has already been used
  while (true) {
    if (i >= data.users.length) {
      break;
    }
    if (data.users[i].email === email) {
      return { error: 'Email address already in use' };
    }
    i++;
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
  i = 0;
  let j = 0;
  while (true) {
    if (i >= data.users.length) {
      break;
    }
    if (data.users[i].handleStr === fullname) {
      if (j !== 0) {
        fullname = fullname.substring(0, fullname.length - 1);
      }

      fullname = fullname + j;
      j++;
      i = 0;
    }

    i++;
  }

  let ownerglob = false;
  if (data.users.length === 0) {
    ownerglob = true;
  }

  const uuID = uniqueuserID;
  const temp = {
    uId: uuID,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: fullname,
    isGlobalOwner: ownerglob
  };

  uniqueuserID++;
  data.users.push(temp);
  setData(data);

  return { authUserId: uuID };
}

/**
 * Takes in a string and removes all non-alphanumeric values from it
 *
 * @param {string} handle - a username
 * @param {string} password - user's password
 *
 * @returns {string} - returns string containing only alphanumeric values
 */
function onlyalphanumeric(handle) {
  handle = handle.replace(/[^a-z0-9]/gi, '');
  return handle;
}
