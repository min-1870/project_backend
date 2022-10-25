import { getData } from './dataStore';
import { error, messages } from './types';
import { getDataStoreChannel, isAuthUserIdValid, isChannelIdValid, isUserMemberInChannel } from './utils';

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