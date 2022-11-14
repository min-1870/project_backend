import { database } from './dataStore';
import { error } from './types';
import HTTPError from 'http-errors';

/** Send a message from the authorised user to the channel specified by channelId.
 * Note: Each message should have its own unique ID, i.e. no messages should share
 * an ID with another message, even if that other message is in a different channel.
 *
 * @param token
 * @param channelId
 * @param message
 * @returns  message Id
 */
export function messageSend (
  token: string,
  channelId: number,
  message: string): ({messageId: number} | error) {
  const user = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByChannelId(channelId);
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }
  if (!database.isUserMemberInChannel(user.uId, channel.channelId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }
  const newMessage = database.addMessageToChannel(message, user.uId, channel.channelId);
  return { messageId: newMessage.messageId };
}

/** Given a messageId for a message, this message is removed from the channel/DM
 *
 * @param token
 * @param messageId
 * @returns
 */
export function messageRemove(token: string, messageId: number): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  const channel = database.getDataStoreChannelByMessageId(messageId);

  if (!database.isUserMemberInChannel(user.uId, channel.channelId)) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }

  const message = database.getDataStoreMessageByMessageId(messageId);
  if (message.uId !== user.uId &&
      !database.isUserOwnerMemberInChannel(user.uId, channel.channelId)) {
    throw HTTPError(403, 'the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM');
  }
  database.removeChannelMessageById(message.messageId);
  return {};
}

/** Given a message, update its text with new text. If the new message is an empty
 * string, the message is deleted.
 *
 * @param token
 * @param messageId
 * @param message
 * @returns
 */
export function messageEdit (token: string, messageId: number, message: string): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  const dataStoreMessage = database.getDataStoreMessageByMessageId(messageId);

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  if (database.isMessageInChannels(messageId)) {
    const channel = database.getDataStoreChannelByMessageId(messageId);

    if (user.uId !== dataStoreMessage.uId &&
        !database.isUserOwnerMemberInChannel(user.uId, channel.channelId) &&
        !(database.isUserGlobalOwner(user.uId) &&
          database.isUserMemberInChannel(user.uId, channel.channelId))) {
      throw HTTPError(403, 'Message can only be edited by sender, owner of channel, or global owner in that channel');
    }
    database.editChannelMessage(messageId, message);
  } else {
    const dm = database.getDmByMessageId(messageId);
    if (user.uId !== dataStoreMessage.uId ||
        !database.isUserOwnerInDm(user.uId, dm.dmId)) {
      return { error: 'the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM' };
    }
    database.editDmMessage(messageId, message);
  }
  return {};
}

/** Send a message from authorised user to the DM specified by dmId. Note: Each message
 * should have it's own unique ID, i.e. no messages should share an ID with another
 * message, even if that other message is in a different channel or DM.
 *
 * @param token
 * @param dmId
 * @param message
 * @returns
 */
export function dmMessageSend(
  token: string,
  dmId: number,
  message: string): ({messageId: number} | error) {
  const user = database.getUserByToken(token);
  const dm = database.getDmById(dmId);
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }
  if (!database.isUserMemberInDm(user.uId, dmId)) {
    throw HTTPError(403, 'user is not part of dm');
  }
  const newMessage = database.addMessageToDm(message, user.uId, dm.dmId);
  return { messageId: newMessage.messageId };
}
