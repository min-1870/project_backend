import { database } from './dataStore';
import { notificationTypes } from './notifications';
import {
  channel,
  channels,
  dataStoreChannel,
  dataStoreUser,
  user,
  dms,
  dataStoreDm,
  messages,
  messageOutput
} from './types';

export function dataStoreUserToUser(dataStoreUser: dataStoreUser): user {
  return {
    uId: dataStoreUser.uId,
    email: dataStoreUser.email,
    nameFirst: dataStoreUser.nameFirst,
    nameLast: dataStoreUser.nameLast,
    handleStr: dataStoreUser.handleStr
  };
}

export function toOutputChannels(channels: dataStoreChannel[]): channels {
  return {
    channels: channels.map(channel => {
      return {
        channelId: channel.channelId,
        name: channel.name
      };
    })
  };
}

export function toOutputChannelDetail(channel: dataStoreChannel): channel {
  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: channel.ownerMembers
      .map(userId => dataStoreUserToUser(database.getUserById(userId))),
    allMembers: channel.allMembers
      .map(userId => dataStoreUserToUser(database.getUserById(userId)))
  };
}

// -----FUNCTIONS ABOUT DM ONLY
export function toOutputDms(dms: dataStoreDm[]): dms {
  return {
    dms: dms.map(dm => {
      return {
        dmId: dm.dmId,
        name: dm.name
      };
    })
  };
}

export function toOutputDmDetails(dm: dataStoreDm) {
  return {
    name: dm.name,
    members: dm.allMembers
      .map(userId => dataStoreUserToUser(database.getUserById(userId)))
  };
}

// -----OTHERS

export function duplicateValueCheck(array) {
  return array.length !== new Set(array).size;
}

export function toOutputMessages(dataStoreMessage: messages, authUserId: number): messageOutput {
  return {
    messageId: dataStoreMessage.messageId,
    message: dataStoreMessage.message,
    uId: dataStoreMessage.uId,
    timeSent: dataStoreMessage.timeSent,
    reacts: dataStoreMessage.reacts.map(r => r.toMessageOutput(authUserId))
  };
}

export function parseTags(message: string): string[] {
  const regex = /@[a-z0-9]+/gi;
  const matches = Array.from(message.matchAll(regex));
  let res = [];
  for (const match of matches) {
    const temp = match.map(tag => tag.slice(1));
    res = res.concat(temp.flatMap(e => e));
  }
  return res;
}

export function processMessageTagsAndSendNotifications(
  messageId: number, message: string, senderId: number) {
  const taggedUserHandles = new Set(parseTags(message));
  database.getDataStoreMessageByMessageId(messageId);
  taggedUserHandles.forEach(handle => {
    if (database.isHandleStrUsed(handle)) {
      const receiverId = database.getUserByHandle(handle).uId;
      if (database.isMessageInChannels(messageId)) {
        if (database.isUserMemberInChannel(receiverId,
          database.getDataStoreChannelByMessageId(messageId).channelId)) {
          database.addNotification(senderId,
            receiverId, notificationTypes.TaggedToChannel, -1,
            messageId, database.getDataStoreChannelByMessageId(messageId).channelId);
        }
      } else {
        const dm = database.getDmByMessageId(messageId);
        if (database.isUserInDm(receiverId, dm.dmId)) {
          database.addNotification(senderId,
            receiverId, notificationTypes.TaggedToDm, dm.dmId, messageId, -1);
        }
      }
    }
  });
}
