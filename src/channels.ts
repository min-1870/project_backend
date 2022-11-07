import { dataStoreUserToUser, getDataStoreUser, isAuthUserIdValid, toOutputChannels } from './utils';
import { getData, setData } from './dataStore';
import {
  channelId,
  error,
  channels,
  dataStoreChannel,
} from './types';
import { generateChannelId } from './ids';

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
  const dataStoreUser = getDataStoreUser(authUserId, data);
  const member = dataStoreUserToUser(dataStoreUser);
  const newChannel: dataStoreChannel = {
    channelId: generateChannelId(),
    isPublic,
    name,
    ownerMembers: [member],
    allMembers: [member],
    messages: [],
  };

  data.channels.push(newChannel);
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
      .find(member => member.uId === authUserId) != null) || [];

  return toOutputChannels(channels);
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
  return toOutputChannels(data.channels);
}
