import { database } from './dataStore';
import { dm, dms, error, messages } from './types';
import { duplicateValueCheck, toOutputDms, toOutputDmDetails } from './utils';
import HTTPError from 'http-errors';

/**
  * Creates the Dm from token user to users entered in uIds
  *
  * @param {string} token - user that initiated command
  * @param {number[]} uIds - array of uIds dm is directed to
  *
  * @returns {number} - returns an object containing dmId
*/
export function dmCreation(token:string, uIds: number[]): ({dmId: number} | error) {
  const authUser = database.getUserByToken(token);
  for (const uId of uIds) {
    if (!database.isUserIdValid(uId)) {
      throw HTTPError(400, 'Invalid uId in uIds');
    }
  }
  if (duplicateValueCheck(uIds)) {
    throw HTTPError(400, 'Duplicate uId values entered');
  }

  const name = dmNameGenerator(token, uIds);
  const newDm = database.addDm(authUser.uId, name, uIds);
  return {
    dmId: newDm.dmId
  };
}

/**
  * Helper function that creates the name for dm
  *
  * @param {string} token - user that initiated command
  * @param {number[]} uIds - array of uIds dm is directed to
  *
  * @returns {string} - returns a string which is the name of the function
*/
function dmNameGenerator(token:string, uIds: number[]): (string) {
  const owner = database.getUserByToken(token);

  let arr = [];
  arr.push(owner.handleStr);
  for (const uId of uIds) {
    const user = database.getUserById(uId);
    arr.push(user.handleStr);
  }
  arr = arr.sort();

  return arr.join(', ');
}

/**
  * Returns the list of DMs that the user is a member of
  *
  * @param {string} token - user that initiated command
  *
  * @returns {[object]} - array of objects, each containing {dmId, name}
*/
export function dmlist(token: string): (dms | error) {
  const authUser = database.getUserByToken(token);
  const dms = database.getAllDms()
    .filter(dm => database.isUserMemberInDm(authUser.uId, dm.dmId)) || [];

  return toOutputDms(dms);
}

export function deleteDm(token: string, dmId: number) {
  const dm = database.getDmById(dmId);
  const authUser = database.getUserByToken(token);
  if (!database.isUserInDm(authUser.uId, dm.dmId)) {
    throw HTTPError(403, 'user is not part of dm');
  }
  if (!database.isUserCreatorOfDm(authUser.uId, dm.dmId)) {
    throw HTTPError(403, 'Have to be creator to delete dm');
  }

  database.removeDm(dmId);
  return {};
}

/**
  * Removes the user from the dm
  *
  * @param {string} token - user that initiated command
  * @param {number} dmId - dm to remove user from
  *
  *
  * @returns {{}} - empty array
*/
export function dmLeave(token:string, dmId:number): (Record<string, never> | error) {
  const authUser = database.getUserByToken(token);
  database.removeUserFromDm(authUser.uId, dmId);
  return {};
}

/**
  * Returns the messages
  *
  * @param {string} token - user that initiated
  * @param {number} dmId - a dm ID in the dataStore
  * @param {number} start - the index of the starting point
  *
  *
  * @returns { {messages: messages[], start: number, end: number} } - an object contains the messages and information of pages
*/
export function dmMessages(
  token: string,
  dmId: number,
  start: number): ({ messages: messages[], start: number, end: number } | error) {
  const user = database.getUserByToken(token);
  const dm = database.getDmById(dmId);

  if (start < 0 || start > dm.messages.length) {
    throw HTTPError(400, 'Invalid start');
  }
  if (!database.isUserMemberInDm(user.uId, dm.dmId)) {
    throw HTTPError(403, 'user is not part of dm');
  }

  const messages = [...dm.messages].reverse();
  let slicedMessages: messages[];
  let end: number;

  if (start + 50 >= messages.length) {
    end = -1;
    slicedMessages = messages.slice(start, messages.length);
  } else {
    end = start + 50;
    slicedMessages = messages.slice(start, end);
  }
  return {
    messages: slicedMessages,
    start,
    end
  };
}

/**
  * Given a DM with ID dmId that the authorised user is a member of,
  * provide basic details about the dm
  *
  * @param {number} token- intiating user
  * @param {number} dmId - id of dm
  *
  * @returns {object} - An object containing basic details of the dm, name and members
*/
export function dmDetails(token: string, dmId: number): (dm | error) {
  const user = database.getUserByToken(token);
  const dm = database.getDmById(dmId);
  if (!database.isUserMemberInDm(user.uId, dm.dmId)) {
    throw HTTPError(403, 'user is not part of dm');
  }
  return toOutputDmDetails(dm);
}
