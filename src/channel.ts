import { database } from './dataStore';
import {
  error,
  messages,
  channel
} from './types';
import {
  toOutputChannelDetail,
} from './utils';
import HTTPError from 'http-errors';
import { notificationTypes } from './notifications';

/**
  * Given a channelId of a channel Given a channel with ID channelId
  * that the authorised user is a member of,
  * provide basic details about the channel.
  *
  * @param {string} token - token of the user
  * @param {number} channelId - channelId in channel
  *
  * @returns {object} - An object containing basic details of the channel such as name, isPublic, ownerMembers and allMembers
*/
export function channelDetails(token: string, channelId: number): (channel | error) {
  const user = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByChannelId(channelId);
  if (!database.isUserMemberInChannel(user.uId, channel.channelId)) {
    throw HTTPError(403, 'User not a member of channel.');
  }
  return toOutputChannelDetail(channel);
}

/**
  * Given a channelId of a channel that the authorised user can join,
  * adds them to that channel.
  *
  * @param {string} token - access token of the user
  * @param {number} channelId - channelId in channel
  *
  * @returns {} - empty object returned
*/
export function channelJoin(
  token: string,
  channelId: number): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByChannelId(channelId);
  if (!channel.isPublic && !database.isUserGlobalOwner(user.uId)) {
    throw HTTPError(403,
      'Permission denied, non-global owner is not allowed to access private channel');
  }
  database.addUserToChannel(user.uId, channel.channelId);
  return {};
}

/**
  * Invites a user with ID uId to join a channel with ID channelId.
  * Once invited, the user is added to the channel immediately.
  * In both public and private channels, all members are able to invite users.
  *
  * @param {number} token - access token of the user
  * @param {number} channelId - channelId in channel
  * @param {number} uId - uId in user
  *
  * @returns {} - empty object returned
*/
export function channelInvite(
  token: string,
  channelId: number,
  uId: number): (Record<string, never> | error) {
  const authUser = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByChannelId(channelId);

  if (!database.isUserMemberInChannel(authUser.uId, channel.channelId)) {
    throw HTTPError(403, 'Permission denied, non-channel user cannot invite other user to the channel');
  }
  if (!database.isUserIdValid(uId)) {
    throw HTTPError(400, 'Invalid user ID.');
  }
  database.addUserToChannel(uId, channel.channelId);
  database.addNotification(authUser.uId, uId,
    notificationTypes.AddedToChannel, -1, -1, channel.channelId);
  return {};
}

/**
  * Given a channel with ID channelId that the authorised user
  * is a member of, returns up to 50 messages between index
  * "start" and "start + 50". Message with index 0 (i.e. the
  * first element in the returned array of messages) is the
  * most recent message in the channel. This function returns
  * a new index "end". If there are more messages to return
  * after this function call, "end" equals "start + 50". If
  * this function has returned the least recent messages in
  * the channel, "end" equals -1 to indicate that there are no
  * more messages to load after this return.
  *
  * @param {string} token - access token of a user in the dataStore
  * @param {number} channelId - a channel ID in the dataStore
  * @param {number} start - the index of the starting point
  * @returns {{messages: array, start: number, end: number}} - an object contains the messages and information of pages
*/
export function channelMessages(
  token: string,
  channelId: number,
  start: number): ({ messages: messages[], start: number, end: number } | error) {
  const authUser = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByChannelId(channelId);
  if (start < 0 || start > channel.messages.length) {
    throw HTTPError(400, 'Invalid start');
  }
  if (!database.isUserMemberInChannel(authUser.uId, channel.channelId)) {
    throw HTTPError(403, 'Not a member of channel.');
  }

  const messages = [...channel.messages].reverse();
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
 * Add a user to channel to become nan owner of the channel
 * If there something that is not meet the requirement, return error.
 * Otherwise make that user an onwner of the channel
 * @param {string} token - the auth token of the person perforing the add action
 * @param {number} channelId - the Id of the channel that user want to be the owner
 * @param {number} ownerToAddId - the Id of the person who want to become owner of the channel
 * @returns
 */
export function channelAddOwners(
  token: string,
  channelId: number,
  ownerToAddId: number): (Record<string, never> | error) {
  const authUser = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByChannelId(channelId);
  if (!database.isUserOwnerMemberInChannel(authUser.uId, channel.channelId) &&
    !(database.isUserMemberInChannel(authUser.uId, channel.channelId) &&
      database.isUserGlobalOwner(authUser.uId))) {
    throw HTTPError(403, 'Not an authorised user to add owner to channel.');
  }
  database.addOwnerToChannel(ownerToAddId, channel.channelId);
  return {};
}

/**
 * Remove user from channel with user Id as an owner of the channel.
 * If there is something does not meet the requirement then return error.
 * Otherwise remove them from the channel.
 *
 * @param {string} token - the auth token of the person performing the remove action.
 * @param {number} channelId - the channel they will be remove from.
 * @param {number} ownerToRemoveId - the user Id of the person who will be remove from channel.
 * @returns
 */
export function channelRemoveOwners(
  token: string,
  channelId: number,
  ownerToRemoveId: number): (Record<string, never> | error) {
  const authUser = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByChannelId(channelId);
  if (!database.isUserOwnerMemberInChannel(authUser.uId, channel.channelId) &&
      !(database.isUserGlobalOwner(authUser.uId) &&
        database.isUserMemberInChannel(authUser.uId, channel.channelId))) {
    throw HTTPError(403, 'Not an authorised user to add owner to channel.');
  }

  database.removeOwnerFromChannel(ownerToRemoveId, channel.channelId);
  return {};
}

/**
  * Given a channel with ID channelId that the authorised user is a member of,
  * remove them as a member of the channel.
  * Their messages should remain in the channel.
  * If the only channel owner leaves,
  * the channel will remain.
  *
  * @param {string} token - an object that represents the right to perform certain actions
  * @param {number} channelId - a channel ID in the dataStore
  *
  * @returns {} - empty object returned
*/
export function channelLeave(
  token: string,
  channelId: number): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByChannelId(channelId);
  database.removeUserFromChannel(user.uId, channel.channelId);
  return {};
}
