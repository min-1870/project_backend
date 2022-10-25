import { getData } from './dataStore';
import {
  error,
  messages,
  dataStore,
  channel
} from './types';
import { addUserToChannel, getDataStoreChannel, getDataStoreUser, isAuthUserIdValid, isUserMemberInChannel, toOutputChannelDetail, dataStoreUserToUser } from './utils';

/**
  * Given a channelId of a channel Given a channel with ID channelId
  * that the authorised user is a member of,
  * provide basic details about the channel.
  *
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel
  *
  * @returns {object} - An object containing basic details of the channel such as name, isPublic, ownerMembers and allMembers
*/
export function channelDetailsV1(authUserId: number, channelId: number): (channel | error) {
  const data = getData();
  const channel = getDataStoreChannel(channelId, data);
  if (channel == null) {
    return { error: 'Channel ID does not refer to a valid channel' };
  } else if (getDataStoreUser(authUserId, data) == null) {
    return { error: 'User ID does not exist' };
  } else if (channel.allMembers.find(user => user.uId === authUserId) == null) {
    return { error: 'User is not a member of channel' };
  }

  return toOutputChannelDetail(channel);
}

/**
  * Given a channelId of a channel that the authorised user can join,
  * adds them to that channel.
  *
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel
  *
  * @returns {} - empty object returned
*/
export function channelJoinV1(authUserId: number, channelId: number): (Record<string, never> | error) {
  const data: dataStore = getData();
  const dataStoreUser = getDataStoreUser(authUserId, data);
  const channel = getDataStoreChannel(channelId, data);

  if (channel == null) {
    return { error: 'Invalid channel ID' };
  } else if (dataStoreUser == null) {
    return { error: 'Invalid token' };
  } else if (channel.allMembers.find(user => user.uId === authUserId) != null) {
    return { error: 'User already in channel' };
  } else if (!channel.isPublic && !dataStoreUser.isGlobalOwner) {
    return { error: 'Permission denied, non-global owner is not allowed to access private channel' };
  }

  addUserToChannel(dataStoreUserToUser(dataStoreUser), channel.channelId, data);
  return {};
}

/**
  * Invites a user with ID uId to join a channel with ID channelId.
  * Once invited, the user is added to the channel immediately.
  * In both public and private channels, all members are able to invite users.
  *
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel
  * @param {number} uId - uId in user
  *
  * @returns {} - empty object returned
*/
export function channelInviteV1(authUserId: number, channelId: number, uId: number): (Record<string, never> | error) {
  const data = getData();

  const channel = getDataStoreChannel(channelId, data);
  if (channel == null) {
    return { error: 'Invalid channel ID' };
  }

  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'Invalid token' };
  }
  const dataStoreUser = getDataStoreUser(uId, data);
  if (dataStoreUser == null) {
    return { error: 'Invalid user ID' };
  }

  if (isUserMemberInChannel(uId, channelId, data)) {
    return { error: 'User already in channel' };
  }

  if (!isUserMemberInChannel(uId, channelId, data)) {
    return { error: 'Permission denied, non-channel user cannot invite other user to the channel' };
  }

  addUserToChannel(dataStoreUserToUser(dataStoreUser), channel.channelId, data);
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
  * @param {number} authUserId - a user ID in the dataStore
  * @param {number} channelId - a channel ID in the dataStore
  * @param {number} start - the index of the starting point
  * @returns {{messages: array, start: number, end: number}} - an object contains the messages and information of pages
*/
export function channelMessagesV1(authUserId: number, channelId: number, start: number): ({ messages: messages[], start: number, end: number } | error) {
  const data = getData();
  const channel = getDataStoreChannel(channelId, data);
  if (channel == null) {
    return { error: 'Invalid channel ID' };
  } else if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'Invalid user ID' };
  } else if (start < 0 || start > channel.messages.length) {
    return { error: 'Invalid start' };
  } else if (!isUserMemberInChannel(authUserId, channelId, data)) {
    return { error: 'Not a member of the channel' };
  }

  const messages = channel.messages;
  let slicedMessages: messages[];
  let end: number;

  if (start + 50 >= messages.length) {
    end = -1;
    slicedMessages = messages.slice(start);
  } else {
    end = start + 50;
    slicedMessages = messages.slice(start, end);
  }

  return {
    messages: slicedMessages,
    start: start,
    end: end
  };
}
