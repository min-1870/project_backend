import { database } from './dataStore';
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
