import { toOutputChannels } from './utils';
import { database } from './dataStore';
import {
  channelId,
  error,
  channels,
} from './types';
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
export function channelsCreate(
  token: string,
  name: string,
  isPublic: boolean): (channelId | error) {
  const user = database.getUserByToken(token);
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'name is not between 1 and 20 characters');
  }
  const newChannel = database.addNewChannel(name, isPublic, user.uId);
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
  const user = database.getUserByToken(token);
  return toOutputChannels(database.getAllChannelsUserIsMemberOf(user.uId));
}

/**
  * Provides an array of all channels, including private
  * channels (and their associated details)
  *
  * @param { string } token - a access token of the user ID
  * @returns { channels } - Array of objects, where each object contains types { channelId, name }
*/
export function channelsListAll(token: string): (channels | error) {
  database.getUserByToken(token);
  // Return every channels in the data with Id & name only
  return toOutputChannels(database.getAllChannels());
}
