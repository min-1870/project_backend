import { getData, setData } from './dataStore';
import {
  error,
  messages,
  dataStore,
  channel
} from './types';
import {
  addUserToChannel,
  getDataStoreChannel,
  getDataStoreUser,
  isAuthUserIdValid,
  isUserMemberInChannel,
  toOutputChannelDetail,
  dataStoreUserToUser,
  getDataStoreChannelSpecial,
  getDataStoreUserSpecial,
  isChannelIdValid,
  isUserOwnerInChannel,
  isGlobalOwner,
  addUserToChannelAsOwner,
  getAuthUserIdFromToken,
  isUserOwnerMemberInChannel,
  removeUserFromChannelAsOwner
} from './utils';

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
  const channel = getDataStoreChannelSpecial(channelId, data);
  if (channel == null) {
    return { error: 'Channel ID does not refer to a valid channel' };
  } else if (getDataStoreUserSpecial(authUserId, data) == null) {
    return { error: 'User ID does not exist' };
  } else if (channel.allMembers.find(user => user.uId === authUserId) == null) {
    return { error: 'User ID is not a member of channel' };
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
  setData(data);
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
export function channelInviteV1(
  authUserId: number,
  channelId: number,
  uId: number): (Record<string, never> | error) {
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

  if (!isUserMemberInChannel(authUserId, channelId, data)) {
    return { error: 'Permission denied, non-channel user cannot invite other user to the channel' };
  }

  addUserToChannel(dataStoreUserToUser(dataStoreUser), channel.channelId, data);
  setData(data);
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
    messages: slicedMessages.reverse(),
    start: start,
    end: end
  };
}
/**
 * Add a user with user Id to channel to become nan owner of the channel
 * If there something that is not meet the requirement, return error.
 * Otherwise make that user an onwner of the channel
 * @param {number} authUserId - the authUserId of the person perforing the add action
 * @param {number} channelId - the Id of the channel that user want to be the owner
 * @param {number} ownerToAddId - the Id of the person who want to become owner of the channel
 * @returns
 */
export function channelAddOwnersV1(
  authUserId: number,
  channelId: number,
  ownerToAddId: number): (Record<string, never> | error) {
  const data = getData();

  if (!isChannelIdValid(channelId, data)) {
    return { error: 'channelId does not refer to a valid channel.' };
  }
  const dataStoreChannel = getDataStoreChannel(channelId, data);

  if (!isAuthUserIdValid(ownerToAddId, data)) {
    return { error: 'uId does not refer to a valid user.' };
  }
  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'authUserId is not a valid user.' };
  }

  if (!isUserMemberInChannel(ownerToAddId, dataStoreChannel.channelId, data)) {
    return { error: 'uId refers to a user who is not a member of the channel.' };
  }

  if (isUserOwnerInChannel(dataStoreChannel, ownerToAddId)) {
    return { error: 'uId refers to a user who is already an owner of the channel' };
  }
  if (isChannelIdValid(channelId, data) &&
    !isUserOwnerInChannel(dataStoreChannel, authUserId) &&
    !isGlobalOwner(authUserId, data)) {
    return {
      error: 'channelId is valid and the authorised user does not have owner permissions in the channel.'
    };
  }
  addUserToChannelAsOwner(
    dataStoreUserToUser(getDataStoreUser(ownerToAddId, data)), channelId, data);
  setData(data);
  return {};
}

/**
 * Remove user from channel with user Id as an owner of the channel.
 * If there is something does not meet the requirement then return error.
 * Otherwise remove them from the channel.
 *
 * @param {number} authUserId - the auth user id of the person performing the remove action.
 * @param {number} channelId - the channel they will be remove from.
 * @param {number}ownerToRemoveId - the user Id of the person who will be remove from channel.
 * @returns
 */
export function channelRemoveOwnersV1(
  authUserId: number,
  channelId: number,
  ownerToRemoveId: number): (Record<string, never> | error) {
  const data = getData();
  const dataStoreChannel = getDataStoreChannel(channelId, data);
  if (!isChannelIdValid(channelId, data)) {
    return { error: 'channelId does not refer to a valid channel.' };
  }

  if (!isAuthUserIdValid(ownerToRemoveId, data)) {
    return { error: 'uId does not refer to a valid user.' };
  }

  if (!isUserOwnerMemberInChannel(ownerToRemoveId, channelId, data)) {
    return { error: 'uId refers to a user who is already an owner of the channel' };
  }

  if (isChannelIdValid(channelId, data) &&
    !isUserOwnerInChannel(dataStoreChannel, authUserId) &&
    !isGlobalOwner(authUserId, data)) {
    return {
      error: 'channelId is valid and the authorised user does not have owner permissions in the channel.'
    };
  }

  if (dataStoreChannel.ownerMembers.length === 1) {
    return { error: 'uId refers to a user who is currently the only owner of the channel' };
  }

  removeUserFromChannelAsOwner(dataStoreUserToUser(getDataStoreUser(ownerToRemoveId, data)), channelId, data);
  setData(data);
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
export function channelLeaveV1(token: string, channelId: number): (Record<string, never> | error) {
  const data: dataStore = getData();
  const authUserId = getAuthUserIdFromToken(token);
  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'Invalid token' };
  }
  if (!isChannelIdValid(channelId, data)) {
    return { error: 'Invalid channel ID' };
  }
  if (!isUserMemberInChannel(authUserId, channelId, data)) {
    return { error: 'Permission denied, non-channel user cannot leave the channel' };
  }
  const indexOne = data.channels.findIndex(channel => channel.channelId.toString() === channelId.toString());
  const indexTwo = data.channels[indexOne].allMembers.findIndex(member => member.uId.toString() === getAuthUserIdFromToken(token).toString());
  data.channels[indexOne].allMembers.splice(indexTwo, 1);
  setData(data);
  return {};
}
