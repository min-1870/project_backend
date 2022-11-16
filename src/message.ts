import { database } from './dataStore';
import { error, reactOutput } from './types';
import HTTPError from 'http-errors';
import { notificationTypes } from './notifications';

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
  const message = database.getDataStoreMessageByMessageId(messageId);
  if (database.isMessageInChannels(messageId)) {
    const channel = database.getDataStoreChannelByMessageId(messageId);
    if (message.uId !== user.uId &&
        !database.isUserOwnerMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(403, 'Message can only be removed by sender, channel owners or global owner in that channel.');
    }
    database.removeChannelMessageById(message.messageId);
  } else {
    const dm = database.getDmByMessageId(messageId);
    if (user.uId !== message.uId &&
        !database.isUserOwnerInDm(user.uId, dm.dmId) && user.uId !== dm.creatorId) {
      throw HTTPError(403, 'Only dm creator or message sender or DM owner can remove message.');
    }
    database.removeDmMessageById(message.messageId);
  }
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
      throw HTTPError(403, 'Message can only be edited by sender, dm owners, or global owner in that channel.');
    }
    database.editChannelMessage(messageId, message);
  } else {
    const dm = database.getDmByMessageId(messageId);
    if (user.uId !== dataStoreMessage.uId &&
        !database.isUserOwnerInDm(user.uId, dm.dmId) && user.uId !== dm.creatorId) {
      throw HTTPError(403, 'Only dm creator or message sender or DM owner can edit message.');
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

/**
 * Given a message within a channel or DM the authorised user is part of,
 * adds a "react" to that particular message.
 *
 * @param token - token of the authroised user.
 * @param messageId - message ID of the message to react to.
 * @param reactId - react ID of the reaction user is making.
 */
export function messageReact(
  token: string,
  messageId: number,
  reactId: number
): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  const message = database.getDataStoreMessageByMessageId(messageId);

  let isChannelMessage = true;
  if (database.isMessageInChannels(message.messageId)) {
    const channel = database.getDataStoreChannelByMessageId(messageId);
    if (!database.isUserMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(400, 'User is not part of the channel where this message is.');
    }
  } else {
    const dm = database.getDmByMessageId(messageId);
    if (!database.isUserInDm(user.uId, dm.dmId)) {
      throw HTTPError(400, 'User is not part of the channel where this message is.');
    }
    isChannelMessage = false;
  }

  if (message.reacts.some(react => react.reactId === reactId)) {
    database.getDataStoreMessageByMessageId(messageId).reacts.find(r => r.reactId === reactId).addUserToReact(user.uId);
  } else {
    database.addReact(reactId, message.messageId, user.uId);
  }

  if (isChannelMessage) {
    database.addNotification(user.uId,
      message.uId,
      notificationTypes.ReactedToChannelMessage,
      -1,
      message.messageId,
      database.getDataStoreChannelByMessageId(messageId).channelId);
  } else {
    database.addNotification(user.uId,
      message.uId,
      notificationTypes.ReactedToDmMessage,
      database.getDmByMessageId(messageId).dmId,
      message.messageId,
      -1);
  }
  return {};
}

export class React {
  reactId: number;
  uIds: number[];

  constructor(reactId: number, uIds: number[]) {
    if (reactId !== 1) {
      throw HTTPError(400, 'Invalid react ID');
    }
    this.reactId = reactId;
    this.uIds = uIds;
  }

  toMessageOutput(callerId: number): reactOutput {
    return {
      reactId: this.reactId,
      uIds: this.uIds,
      isThisUserReacted: this.uIds.includes(callerId)
    };
  }

  addUserToReact(uId: number) {
    if (this.uIds.includes(uId)) {
      throw HTTPError(400, 'Already contains this user in this react.');
    }
    this.uIds.push(uId);
  }
}

export function messagePin(
  token: string,
  messageId: number
): (Record<string, never> | error) {
  const user = database.getUserByToken(token);
  const message = database.getDataStoreMessageByMessageId(messageId);

  let isChannelMessage = true;
  if (database.isMessageInChannels(message.messageId)) {
    const channel = database.getDataStoreChannelByMessageId(messageId);
    if (!database.isUserMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(400, 'User is not part of the channel where this message is.');
    }
    if (!database.isUserOwnerMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(403, 'user does not have owner permissions in the channel/DM.');
    }
  } else {
    const dm = database.getDmByMessageId(messageId);
    if (!database.isUserInDm(user.uId, dm.dmId)) {
      throw HTTPError(400, 'User is not part of the channel where this message is.');
    }
    if (!database.isUserCreatorOfDm(user.uId, dm.dmId)) {
      throw HTTPError(403, 'user does not have owner permissions in the channel/DM.');
    }
    isChannelMessage = false;
  }

  if (message.isPinned === true) {
    throw HTTPError(400, 'Message is already pinned.');
  } else {
    database.addPin(message.messageId);
  }

  if (isChannelMessage) {
    database.addNotification(user.uId,
      message.uId,
      notificationTypes.ReactedToChannelMessage,
      -1,
      message.messageId,
      database.getDataStoreChannelByMessageId(messageId).channelId);
  } else {
    database.addNotification(user.uId,
      message.uId,
      notificationTypes.ReactedToDmMessage,
      database.getDmByMessageId(messageId).dmId,
      message.messageId,
      -1);
  }
  return {};
}
