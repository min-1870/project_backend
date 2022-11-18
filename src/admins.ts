import { database } from './dataStore';
import HTTPError from 'http-errors';
import { messages } from './types';
import { dmMessageSend, messageSend } from './message';
import { toOutputMessages } from './utils';

/**
  * Removes user from UNSW Beans
  *
  * @param {string} token - user that initiated command
  * @param {number} uId - uId of user being removed from Beans
  *
  * @returns {} - empty object
*/
export function deleteUser(token:string, uId: number) {
  const authUser = database.getUserByToken(token);

  if (database.isUserGlobalOwner(authUser.uId) === false) {
    throw HTTPError(403, 'authorised user is not global owner');
  }

  if (!database.isUserIdValid(uId)) {
    throw HTTPError(400, 'uId is not valid');
  }

  if (database.howManyGlobalOwners() === 1) {
    throw HTTPError(400, 'uId is only global owner');
  }

  database.removeUserName(uId);

  // should fix it showing up on users/all

  for (const item of database.dms) {
    if (database.isUserInDm(uId, item.dmId)) {
      database.removeUserFromDm(uId, item.dmId);
    }
  }
  database.removeUserMessagesFromDms(uId);
  database.removeUserMessagesFromChannels(uId);
  for (const item of database.channels) {
    if (database.isUserMemberInChannel(uId, item.channelId)) {
      database.removeUserFromChannel(uId, item.channelId);
    }
  }
  return {};
}

/**
  * Changes Perms of user
  *
  * @param {string} token - user that initiated command
  * @param {number} uId - uId of user being removed from Beans
  * @param {number} permissionId- uId of user being removed from Beans
  *
  * @returns {} - empty object
*/
export function changePerms(token:string, uId: number, permissionId: number) {
  const authUser = database.getUserByToken(token);
  let isPermValid;

  if (permissionId < 1 || permissionId > 2) {
    throw HTTPError(400, 'invalid permission id');
  }

  if (permissionId === 1) {
    isPermValid = true;
  }
  if (permissionId === 2) {
    isPermValid = false;
  }

  if (database.isUserGlobalOwner(authUser.uId) === false) {
    throw HTTPError(403, 'authorised user is not global owner');
  }

  if (!database.isUserIdValid(uId)) {
    throw HTTPError(400, 'uId is not valid');
  }

  if (database.getUserById(uId).isGlobalOwner === isPermValid) {
    throw HTTPError(400, 'user already at permission level');
  }

  if (database.howManyGlobalOwners() === 1 && permissionId === 2) {
    throw HTTPError(400, 'uId is only global owner');
  }

  if (permissionId === 1) {
    database.changePermUser(uId);
  }

  if (permissionId === 2) {
    database.changePermOwner(uId);
  }

  return {};
}
/**
  * Finds all messages that have querystr and makes them an array
  *
  * @param {string} token - user that initiated command
  * @param {number} uId - uId of user being removed from Beans
  * @param {number} permissionId- uId of user being removed from Beans
  *
  * @returns {messages} - array of messages
*/
export function searchMessage(token: string, queryStr: string) {
  const authUser = database.getUserByToken(token);
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'queryStr is incorrect size');
  }
  const arr: messages[] = [];
  for (const item of database.dms) {
    if (item.allMembers.includes(authUser.uId)) {
      for (const itemTwo of item.messages) {
        if (itemTwo.message.includes(queryStr)) {
          arr.push(itemTwo);
        }
      }
    }
  }
  for (const item of database.channels) {
    if (item.allMembers.includes(authUser.uId)) {
      for (const itemTwo of item.messages) {
        if (itemTwo.message.includes(queryStr)) {
          arr.push(itemTwo);
        }
      }
    }
  }
  return { messages: arr.map(msg => toOutputMessages(msg, authUser.uId)) };
}
/**
  * Shares message to another channel
  *
  * @param {string} token - user that initiated command
  * @param {number} ogMessageId - messageId of message being shared
  * @param {string} message- string being added to shared message
  * @param {number} channelId - channel message is being shared to
  * @param {number} dmId- dm message is being shared to
  *
  * @returns {sharedMessageId} - messageId of shared message
*/
export function msgShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const authUser = database.getUserByToken(token);
  if (message.length > 1000) {
    throw HTTPError(400, 'message too long');
  }

  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'neither channelId or dmId are -1');
  }

  if ((database.dms.find(d => d.dmId === dmId) === undefined) && (dmId !== -1)) {
    throw HTTPError(400, 'both channelId or dmId are invalid');
  }

  if ((database.channels.find(d => d.channelId === channelId) === undefined) && (channelId !== -1)) {
    throw HTTPError(400, 'both channelId or dmId are invalid');
  }

  if ((dmId === -1) && database.isMessageInChannels(ogMessageId) === false && database.isMessageInDms(ogMessageId) === false) {
    throw HTTPError(400, 'ogMessageId isnt valid');
  }

  if ((channelId === -1) && database.isMessageInDms(ogMessageId) === false && database.isMessageInChannels(ogMessageId) === false) {
    throw HTTPError(400, 'ogMessageId isnt valid');
  }

  if (database.isMessageInChannels(ogMessageId) === true) {
    if (database.getDataStoreChannelByMessageId(ogMessageId).allMembers.includes(authUser.uId) === false) {
      throw HTTPError(400, 'ogMessageId isnt valid');
    }
  }

  if (database.isMessageInDms(ogMessageId) === true) {
    if (database.getDataStoreDmByMessageId(ogMessageId).allMembers.includes(authUser.uId) === false) {
      throw HTTPError(400, 'ogMessageId isnt valid');
    }
  }

  if ((dmId === -1)) {
    if (database.getDataStoreChannelByChannelId(channelId).allMembers.includes(authUser.uId) === false) {
      throw HTTPError(403, 'user is not part of channel/dm');
    }
  }

  if ((channelId === -1)) {
    if (database.getDataStoreDmByDmId(dmId).allMembers.includes(authUser.uId) === false) {
      throw HTTPError(403, 'user is not part of channel/dm');
    }
  }
  const ogMessage = database.getDataStoreMessageByMessageId(ogMessageId).message;
  const combinedMessage = ogMessage.concat(message);
  let retValue;
  if (channelId === -1) {
    retValue = dmMessageSend(token, dmId, combinedMessage);
    return { sharedMessageId: retValue.messageId };
  }

  if (dmId === -1) {
    retValue = messageSend(token, channelId, combinedMessage);
    return { sharedMessageId: retValue.messageId };
  }
}
