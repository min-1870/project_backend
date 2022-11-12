import { dataStoreUserToUser, getAuthUserIdFromToken, getDataStoreUser, isAuthUserIdValid, toOutputChannels } from './utils';
import { getData, setData } from './dataStore';
import {
  channelId,
  error,
  channels,
  dataStoreChannel,
} from './types';
import { generateChannelId } from './ids';
import HTTPError from 'http-errors';

/**
 * Creates a new channel with the given name, that is either a public or private channel.
 * The user who created it automatically joins the channel.
 *
 * @param { token } toke - The creator's auth token.
 * @param { string } name - The name of the channel to create.
 * @param { boolean } isPublic - Whether the new channel is a public channel or not.
 * @returns { channelId }
 */
export function channelsCreateV1(
  token: string,
  name: string,
  isPublic: boolean): (channelId | error) {
  const data = getData();
  const authUserId = getAuthUserIdFromToken(token);
  if (!isAuthUserIdValid(authUserId, data)) {
    throw HTTPError(403, 'Invalid user ID');
  }
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'name is not between 1 and 20 characters');
  }
  const dataStoreUser = getDataStoreUser(authUserId, data);
  const member = dataStoreUserToUser(dataStoreUser);
  const newChannel: dataStoreChannel = {
    channelId: generateChannelId(),
    isPublic,
    name,
    ownerMembers: [member.uId],
    allMembers: [member.uId],
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
 * @param { string } token - The access token of the user to list the channels for.
 * @returns { channels }
 */
export function channelsList(token: string) : (channels | error) {
  const data = getData();
  const authUserId = getAuthUserIdFromToken(token);
  if (!isAuthUserIdValid(authUserId, data)) {
    throw HTTPError(403, 'Invalid user ID');
  }

  const channels = data.channels
    .filter(channel => channel.allMembers
      .includes(authUserId) !== false) || [];

  return toOutputChannels(channels);
}

/**
  * Provides an array of all channels, including private
  * channels (and their associated details)
  *
  * @param { string } token - a access token of the user ID
  * @returns { channels } - Array of objects, where each object contains types { channelId, name }
*/
export function channelsListAll(token: string): (channels | error) {
  const data = getData();
  const authUserId = getAuthUserIdFromToken(token);
  if (!isAuthUserIdValid(authUserId, data)) {
    throw HTTPError(403, 'Invalid user ID');
  }

  // Return every channels in the data without Id & name only
  return toOutputChannels(data.channels);
}
