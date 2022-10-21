import { setData } from './dataStore';
import { channel, channels, dataStore, dataStoreChannel, dataStoreUser, user } from './types';

export function isAuthUserIdValid(authUserId: number, data: dataStore): boolean {
  return getUser(authUserId, data) != null;
}

export function getUser(userId: number, data: dataStore): dataStoreUser {
  return data.users.find(user => user.uId === userId);
}

export function getDataStoreChannel(channelId: number, data: dataStore): dataStoreChannel {
  return data.channels.find(channel => channel.channelId === channelId);
}

export function isUserMemberInChannel(channel: dataStoreChannel, userId: number): boolean {
  return channel.allMembers.some(member => member.uId === userId);
}

export function isEmailUsed(email: string, users: dataStoreUser[]): boolean {
  return users.some(user => user.email === email);
}

export function isHandleStrExist(handleStr: string, users: dataStoreUser[]): boolean {
  return users.some(user => user.handleStr === handleStr);
}

export function toOutputUser(user: dataStoreUser): user {
  return {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr
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
export function addUserToChannel(user: dataStoreUser, channelId: number, data: dataStore) {
  data.channels.find(channel => channel.channelId === channelId).allMembers.push(toOutputUser(user));
  setData(data);
}
