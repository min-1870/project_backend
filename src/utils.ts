import { getData, setData } from './dataStore';
import { channel, channels, dataStore, dataStoreChannel, dataStoreUser, user, error, dms, dataStoreDm, messages } from './types';

// -----FUCNTIONS ABOUT USER ONLY

export function isAuthUserIdValid(authUserId: number, data: dataStore): boolean {
  return getDataStoreUser(authUserId, data) != null;
}

export function getDataStoreUser(userId: number, data: dataStore): dataStoreUser {
  return data.users.find(user => user.uId === userId);
}

export function getDataStoreUserByEmail(email: string, data: dataStore): dataStoreUser {
  return data.users.find(user => user.email === email);
}

export function isEmailUsed(email: string, users: dataStoreUser[]): boolean {
  return users.some(user => user.email === email);
}

export function isHandleStrExist(handleStr: string, users: dataStoreUser[]): boolean {
  return users.some(user => user.handleStr === handleStr);
}

export function dataStoreUserToUser(dataStoreUser: dataStoreUser): user {
  return {
    uId: dataStoreUser.uId,
    email: dataStoreUser.email,
    nameFirst: dataStoreUser.nameFirst,
    nameLast: dataStoreUser.nameLast,
    handleStr: dataStoreUser.handleStr
  };
}

// Add session token to a user. Assumes user is a valid user.
export function addSessionTokenForUser(userId: number, sessionToken: string, data: dataStore) {
  data.users.find(user => user.uId === userId).sessionTokens.push(sessionToken);
  setData(data);
}

export function getAuthUserIdFromToken(token: string): number {
  const data: dataStore = getData();
  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (user.sessionTokens[j] === token) {
        return user.uId;
      }
    }
  }
  return null;
}

export function removetoken(token: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (user.sessionTokens[j] === token) {
        user.sessionTokens.splice(j, 1);
        setData(data);
        return {};
      }
    }
  }
  return { error: 'Token is Invalid' };
}

// -----FUNCTIONS ABOUT CHANNELS ONYL

export function isChannelIdValid(channelId: number, data: dataStore): boolean {
  return getDataStoreChannel(channelId, data) != null;
}

export function getDataStoreChannel(channelId: number, data: dataStore): dataStoreChannel {
  return data.channels.find(channel => channel.channelId === channelId);
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
    ownerMembers: channel.ownerMembers,
    allMembers: channel.allMembers
  };
}

// -----FUNCTIONS ABOUT BOTH USER AND CHANNEL

export function isUserMemberInChannel(authUserId: number, channelId: number, data: dataStore): boolean {
  return getDataStoreChannel(channelId, data).allMembers.some(member => member.uId === authUserId);
}

export function isUserOwnerMemberInChannel(authUserId: number, channelId: number, data: dataStore): boolean {
  return getDataStoreChannel(channelId, data).ownerMembers.some(member => member.uId === authUserId);
}

// Add user to the channel. Assumes user and channel ID is valid.
export function addUserToChannel(user: user, channelId: number, data: dataStore) {
  data.channels.find(channel => channel.channelId === channelId).allMembers.push(user);
  setData(data);
}

// -----FUCTIONS ABOUT MESSAGE ONYL

export function isMessageIdValid(messageId: number, data: dataStore): boolean {
  return findChannelIdByMessageId(messageId, data) != null;
}

export function findChannelIdByMessageId(messageId: number, data: dataStore): number|null {
  for (let channels = 0; channels < data.channels.length; channels++) {
    if (data.channels[channels].messages.find(message => message.messageId === messageId) != null) {
      return data.channels[channels].channelId;
    }
  }

  return null;
}

export function getDataStoreMessage(messageId: number, data: dataStore): messages|null {
  for (let channels = 0; channels < data.channels.length; channels++) {
    if (data.channels[channels].messages.find(message => message.messageId === messageId) != null) {
      return data.channels[channels].messages.find(message => message.messageId === messageId);
    }
  }

  return null;
}

// -----FUNCTIONS ABOUT DM ONLY

export function getDataStoreDm(dmId: number, data: dataStore): dataStoreDm {
  return data.dms.find(channel => channel.dmId.toString() === dmId.toString());
}

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

export function isDataStoreDmValid(dmId: number, data: dataStore): boolean {
  // console.log(data);
  return getDataStoreDm(dmId, data) != null;
}
// -----OTHERS

export function duplicateValueCheck(array) {
  if (array.length !== new Set(array).size) {
    return true;
  }

  return false;
}
