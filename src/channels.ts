import { getData, setData } from './dataStore.js';
import {
  channelId,
  error,
  channels,
  dataStoreUser,
  dataStore,
} from './types';

let nextChannelId = 1;

/**
 * Creates a new channel with the given name, that is either a public or private channel.
 * The user who created it automatically joins the channel.
 *
 * @param { number } authUserId - The creator's user ID.
 * @param { string } name - The name of the channel to create.
 * @param { boolean } isPublic - Whether the new channel is a public channel or not.
 * @returns { channelId }
 */
export function channelsCreateV1(authUserId: number, name: string, isPublic: boolean): (channelId | error) {
  if (name.length < 1 || name.length > 20) {
    return { error: 'name is not between 1 and 20 characters' };
  }

  const data = getData();
  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'Invalid user ID' };
  }
  const user = getUser(authUserId, data);
  const member = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr
  };
  const newChannel = {
    channelId: nextChannelId,
    isPublic,
    name,
    ownerMembers: [member],
    allMembers: [member],
    messages: [],
  };

  data.channels.push(newChannel);
  nextChannelId++;
  setData(data);

  return {
    channelId: newChannel.channelId,
  };
}

/**
 * Provides an array of all channels (and their associated details)
 * that the authorised user is part of.
 *
 * @param { number } authUserId - The user ID to list the channels for.
 * @returns { channels }
 */
export function channelsListV1(authUserId: number) : (channels | error) {
  const data = getData();
  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'authUserId is not valid' };
  }

  const channels = data.channels
    .filter(channel => channel.allMembers
      .find(member => member.uId === authUserId) != null)
    .map(channel => (
      {
        channelId: channel.channelId,
        name: channel.name
      })) || [];

  return {
    channels: channels
  };
}

/**
  * Provides an array of all channels, including private
  * channels (and their associated details)
  *
  * @param { number } authUserId - a user ID in the dataStore
  * @returns { channels } - Array of objects, where each object contains types { channelId, name }
*/
export function channelsListAllV1(authUserId: number): (channels | error) {
  const data = getData();

  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'authUserId is not valid' };
  }

  // Return every channels in the data without Id & name only
  return {
    channels: data.channels.map(({ channelId, name }) => ({ channelId, name }))
  };
}

function isAuthUserIdValid(authUserId: number, data: dataStore): boolean {
  return getUser(authUserId, data) != null;
}

function getUser(authUserId: number, data: dataStore): dataStoreUser {
  return data.users.find(user => user.uId === authUserId);
}
