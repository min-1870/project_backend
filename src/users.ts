import { dataStoreUserToUser } from './utils';
import { database } from './dataStore';
import { error, user } from './types';
import validator from 'validator';
import HTTPError from 'http-errors';
import request from 'sync-request';
import sharp from 'sharp';

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
  database.getUserByToken(token);
  return { user: dataStoreUserToUser(database.getUserById(uID)) };
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

export async function uploadImage(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): Promise<(Record<string, never> | error)> {
  // const userId = database.getUserByToken(token);
  const res = request('GET', imgUrl);
  const body = res.getBody();
  const metadata = await sharp(body).metadata();
  const format = metadata.format;
  if (format.toLowerCase() !== 'jpg' || format.toLowerCase() !== 'jpeg') {
    throw HTTPError(400, 'Not a jpg');
  }
  if (format.width() < xStart || format.width() < xEnd) {
    throw HTTPError(400, 'Width too small');
  }
  if (format.height() < yStart || format.height() < yEnd) {
    throw HTTPError(400, 'Height too small');
  }
  if (xStart > xEnd) {
    throw HTTPError(400, 'Dimensions incorrect');
  }
  if (yStart > yEnd) {
    throw HTTPError(400, 'Dimensions incorrect');
  }
  //  fs.writeFileSync('processImages/image.jpg', body, { flag: 'w' });
  //  sharp(body)
  //   .extract({ width: (xEnd - xStart), height: (yEnd - yStart), left: xStart, top: yStart })
  //   .toFile('newImages/' + userId + 'jpg');
  // database.updateProfilePhoto(userId.uId, 'http://127.0.0.1' + ':' + 39799 + 'newImages/' + userId + 'jpg');
  return {};
}
