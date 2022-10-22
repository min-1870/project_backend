import { getData, setData } from './dataStore';
import { channel, channels, dataStore, dataStoreChannel, dataStoreUser, user } from './types';

export function isAuthUserIdValid(authUserId: number, data: dataStore): boolean {
  return getDataStoreUser(authUserId, data) != null;
}

export function isChannelIdValid(channelId: number, data: dataStore): boolean {
  return getDataStoreChannel(channelId, data) != null;
}

export function getDataStoreUser(userId: number, data: dataStore): dataStoreUser {
  return data.users.find(user => user.uId === userId);
}

export function getDataStoreUserByEmail(email: string, data: dataStore): dataStoreUser {
  return data.users.find(user => user.email === email);
}

export function getDataStoreChannel(channelId: number, data: dataStore): dataStoreChannel {
  return data.channels.find(channel => channel.channelId === channelId);
}

export function isUserMemberInChannel(channel: dataStoreChannel, userId: number): boolean {
  return channel.allMembers.some(member => member.uId === userId);
}

export function isUserOwnerInChannel(channel: dataStoreChannel, userId: number): boolean {
  return channel.ownerMembers.some(member => member.uId === userId);
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

// Add user to the channel. Assumes user and channel ID is valid.
export function addUserToChannel(user: user, channelId: number, data: dataStore) {
  // Check if the user is already a member or not. This is needed since
  // when adding global owner, they would bypass the being a member first rule.
  if (isUserMemberInChannel(getDataStoreChannel(channelId, data), user.uId)) {
    return;
  }
  data.channels.find(channel => channel.channelId === channelId).allMembers.push(user);
  setData(data);
}

// Add a user as owner to a channel. Assumes user and channel ID is valid.
export function addUserToChannelAsOwner(user: user, channelId: number, data: dataStore) {
  data.channels.find(channel => channel.channelId === channelId).ownerMembers.push(user);
  setData(data);
  addUserToChannel(user, channelId, getData());
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
