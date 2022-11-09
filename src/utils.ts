import { getData, setData } from './dataStore';
import { TokenHash } from './hash';
import { channel, channels, dataStore, dataStoreChannel, dataStoreUser, user, error, dms, dataStoreDm, messages } from './types';
import HTTPError from 'http-errors';
// -----FUCNTIONS ABOUT USER ONLY

export function isAuthUserIdValid(authUserId: number, data: dataStore): boolean {
  return getDataStoreUser(authUserId, data) != null;
}

export function getDataStoreUser(userId: number, data: dataStore): dataStoreUser {
  return data.users.find(user => user.uId === userId);
}

// for some reason need this to make channelDetailsV1 work
export function getDataStoreUserSpecial(userId: number, data: dataStore): dataStoreUser {
  return data.users.find(user => user.uId.toString() === userId.toString());
}

export function getDataStoreUserByEmail(email: string, data: dataStore): dataStoreUser {
  return data.users.find(user => user.email === email);
}

export function isUserOwnerInChannel(channel: dataStoreChannel, userId: number): boolean {
  return channel.ownerMembers.includes(userId);
}

// Check if a user is global owner. If not exist, returns false.
export function isGlobalOwner(userId: number, data: dataStore) {
  const user = data.users.find(user => user.uId === userId);
  return user != null && user.isGlobalOwner;
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
      if (TokenHash(user.sessionTokens[j]) === token) {
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
      if (TokenHash(user.sessionTokens[j]) === token) {
        user.sessionTokens.splice(j, 1);
        setData(data);
        return {};
      }
    }
  }
  throw HTTPError(403, 'invalid token');
}

// -----FUNCTIONS ABOUT CHANNELS ONYL

export function isChannelIdValid(channelId: number, data: dataStore): boolean {
  return getDataStoreChannel(channelId, data) != null;
}

export function getDataStoreChannel(channelId: number, data: dataStore): dataStoreChannel {
  return data.channels.find(channel => channel.channelId === channelId);
}

// for some reason i need this to make channelDetailsV2 work
export function getDataStoreChannelSpecial(channelId: number, data: dataStore): dataStoreChannel {
  return data.channels.find(channel => channel.channelId.toString() === channelId.toString());
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
  const data = getData();
  const ownerMember: user[] = [];
  const allMember: user[] = [];
  for (const item of channel.ownerMembers) {
    ownerMember.push(dataStoreUserToUser(getDataStoreUser(item, data)));
  }
  for (const item of channel.allMembers) {
    allMember.push(dataStoreUserToUser(getDataStoreUser(item, data)));
  }
  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: ownerMember,
    allMembers: allMember
  };
}

// -----FUNCTIONS ABOUT BOTH USER AND CHANNEL

export function isUserMemberInChannel(authUserId: number, channelId: number, data: dataStore): boolean {
  return getDataStoreChannel(channelId, data).allMembers.includes(authUserId);
}

export function isUserOwnerMemberInChannel(authUserId: number, channelId: number, data: dataStore): boolean {
  return getDataStoreChannel(channelId, data).ownerMembers.includes(authUserId);
}

// Add user to the channel. Assumes user and channel ID is valid.
export function addUserToChannel(user: user, channelId: number, data: dataStore) {
  // Check if the user is already a member or not. This is needed since
  // when adding global owner, they would bypass the being a member first rule.
  if (isUserMemberInChannel(user.uId, channelId, data)) {
    return;
  }
  data.channels.find(channel => channel.channelId === channelId).allMembers.push(user.uId);
  setData(data);
}

// Add a user as owner to a channel. Assumes user and channel ID is valid.
export function addUserToChannelAsOwner(user: user, channelId: number, data: dataStore) {
  data.channels.find(channel => channel.channelId === channelId).ownerMembers.push(user.uId);
  setData(data);
  addUserToChannel(user, channelId, getData());
}

// Remove a user as owner to a channel. Assumes user and channel ID is valid.
export function removeUserFromChannelAsOwner(uId: number, channelId: number, data: dataStore) {
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const idx = channel.ownerMembers.indexOf(uId);
  if (idx > -1) {
    channel.ownerMembers.splice(idx, 1);
  }
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
  return getDataStoreDm(dmId, data) != null;
}

export function toOutputDmDetails(dm: dataStoreDm) {
  const data = getData();
  const allMember: user[] = [];
  for (const item of dm.allMembers) {
    allMember.push(dataStoreUserToUser(getDataStoreUser(item, data)));
  }
  return {
    name: dm.name,
    members: allMember
  };
}

// -----OTHERS

export function duplicateValueCheck(array) {
  return array.length !== new Set(array).size;
}

export function isUserMemberInDm(authUserId: number, dmId: number, data: dataStore): boolean {
  return getDataStoreDm(dmId, data).allMembers.includes(authUserId);
}
