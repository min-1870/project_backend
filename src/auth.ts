import { database } from './dataStore';
import validator from 'validator';
import { authUserId, error } from './types';
import { generateToken } from './ids';
import HTTPError from 'http-errors';
import { getHashOf } from './hash';
import { createTransport } from 'nodemailer';

/**
 * Given a registered user's email and password, returns their authUserId value
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 *
 * @returns {authUserId} an object containing authUserId
 */
export function authLoginV1(
  email: string,
  password: string): (authUserId | error) {
  // checking if email has already been used
  if (!database.isEmailUsed(email)) {
    throw HTTPError(400, 'Email address is not registered');
  }

  const user = database.getUserByEmail(email);
  if (user.password !== getHashOf(password)) {
    throw HTTPError(400, 'Incorrect Password');
  }

  const token = database.addSessionTokenForUser(user.uId);
  return {
    token,
    authUserId: user.uId
  };
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
export function authRegisterV1(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string): (authUserId | error) {
  if (!(validator.isEmail(email))) { // checking if email is valid
    throw HTTPError(400, 'Invalid Email');
  }

  if (database.isEmailUsed(email)) {
    throw HTTPError(400, 'Email Address already in use');
  }

  if (password.length < 6) {
    throw HTTPError(400, 'password has to be six characters or longer');
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'First name has to be between 1 and 50 characters in length');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Last name has to be between 1 and 50 characters in length');
  }
  let fullname = nameFirst.toLowerCase() + nameLast.toLowerCase();
  fullname = onlyalphanumeric(fullname);
  if (fullname.length > 20) {
    fullname = fullname.substring(0, 20);
  }

  // checking if handleStr already exist and making unique if not already
  let j = 0;
  while (database.isHandleStrUsed(fullname)) {
    if (j !== 0) {
      fullname = fullname.substring(0, fullname.length - 1);
    }
    fullname = fullname + j;
    j++;
  }

  const newUser = database.addUser(
    email, getHashOf(password), nameFirst, nameLast, fullname);

  return {
    authUserId: newUser.uId,
    token: newUser.sessionTokens[0]
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

/**
 * Sends a reset code to email given if email is part of UNSW Beans
 *
 * @param {string} email - email to send reset code to
 *
 * @returns {} - empty object
 */
export function sendPasswordResetEmail(email :string) {
  if (database.isEmailUsed(email)) {
    const transporter = createTransport({
      host: 'smtp-comp1531mulo.alwaysdata.net',
      port: 587,
      secure: false,
      auth: {
        user: 'comp1531mulo@alwaysdata.net',
        pass: 'HAHA123a?',
      },
    });
    const code = generateToken();
    const userId = database.getUserByEmail(email).uId;
    database.addPasswordResets(userId, code);
    transporter.sendMail({
      from: '"UNSW BEANS" <trey.hickle@ethereal.email>',
      to: `${email}`,
      subject: 'UNSW BEANS: Password Reset',
      text: `Keep the code: ${code.toString()}`,
    });
    database.removeSessionTokenForUser(userId);
  }
  return {};
}

export function getResetCodes(email: string) {
  return {
    codes: database.passwordResets
      .filter(pR => pR.uId === database.getUserByEmail(email).uId)
      .map(pR => pR.resetCode)
  };
}
/**
 * Resets password for user with resetcode from email
 *
 * @param {string} resetCode - code that was sent to email
 * @param {string} newPassword - new password
 *
 * @returns {} - empty object
 */
export function resetPassword(resetCode: string, newPassword: string) {
  if (newPassword.length < 6) {
    throw HTTPError(400, 'Password must be 6 character or longer');
  }
  database.updateUserPassword(
    database.getPasswordResetsByResetCode(resetCode).uId, newPassword);
  database.removePassWordReset(resetCode);
  return {};
}

export function logOut(token) {
  database.getUserByToken(token);
  database.removeSessionToken(token);
  return {};
}
