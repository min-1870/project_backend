import { getData } from './dataStore';
import { dataStore, error, messages } from './types';
import { findChannelIdByMessageId, getDataStoreChannel, getDataStoreMessage, isAuthUserIdValid, isChannelIdValid, isMessageIdValid, isUserMemberInChannel, isUserOwnerMemberInChannel } from './utils';

let messageId = 0;

export function messageSend (authUserId: number, channelId: number, message: string): ({messageId: number} | error) {
  const data = getData();
  const channel = getDataStoreChannel(channelId, data);
  if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'token is invalid' };
  } else if (!isChannelIdValid(channelId, data)) {
    return { error: 'channelId does not refer to a valid channel' };
  } else if (message.length < 1 || message.length > 1000) {
    return { error: 'length of message is less than 1 or over 1000 characters' };
  } else if (!isUserMemberInChannel(authUserId, channelId, data)) {
    return { error: 'channelId is valid and the authorised user is not a member of the channel' };
  }

  const newMessage: messages = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now()
  };

  channel.messages.push(newMessage);

  messageId += 1;

  return { messageId: messageId - 1 };
}

export function messageRemove (authUserId: number, messageId: number): (Record<string, never> | error) {
// assume toke is valid
  const data:dataStore = getData();
  const channelId = findChannelIdByMessageId(messageId, data);

  if (!isMessageIdValid(messageId, data)) {
    return { error: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined' };
  } else if (!isUserMemberInChannel(authUserId, channelId, data)) {
    return { error: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined' };
  } else if (authUserId !== getDataStoreMessage(messageId, data).uId && !isUserOwnerMemberInChannel(authUserId, channelId, data)) {
    return { error: 'the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM' };
  }

  const dataStoreChannel = getDataStoreChannel(channelId, data);
  dataStoreChannel.messages = dataStoreChannel.messages.filter(message => message.messageId !== messageId);

  return {};
}
