import { getData, setData } from './dataStore';
import { channel, channels, dataStore, dataStoreChannel, dataStoreUser, user, error } from './types';

let uniqueDmId = 0;

export function isAuthUserIdValid(authUserId: number, data: dataStore): boolean {
  return getDataStoreUser(authUserId, data) != null;
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
  data.channels.find(channel => channel.channelId === channelId).allMembers.push(user);
  setData(data);
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

export function userProfileHandleChange(token: string, handleStr: string): (Record<string, never> | error) {
  const data: dataStore = getData();
  if (handleStr.length < 3 || handleStr.length > 20) {
    return { error: 'handleStr is not correct size' };
  }
  if (!(/^[A-Za-z0-9]*$/.test(handleStr))) {
    return { error: 'handleStr has non-alphanumeric characters' };
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    if (user.handleStr === handleStr) {
      return { error: 'handle is already in use' };
    }
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (user.sessionTokens[j] === token) {
        user.handleStr = handleStr;
        setData(data);
        return {};
      }
    }
  }
  return { error: 'Token is Invalid' };
}

export function dmCreation(token:string, uIds: [number]) {
  const data: dataStore = getData();

  for (const item of uIds) {
    if (data.users.find(user => user.uId === item) == null) {
      return { error: 'Invalid uId in uIds'};
    }
  }
  if (duplicateValueCheck(uIds) == true) {
    return { error: 'Duplicate uId values entered'};
  };

  let DmName = dmNameGenerator(token, uIds);

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (user.sessionTokens[j] === token) {
        data.dms.push({
          dmId: uniqueDmId,
          name: DmName
        });
        const ret = uniqueDmId;
        uniqueDmId ++;
        setData(data);
        return { dmId: ret};
      }
    }
  }
  return { error: 'Token is Invalid' };
}

function dmNameGenerator(token:string, uIds: [number]) {
  const data: dataStore = getData();
  const owner = getAuthUserIdFromToken(token);

  let arr = [];
  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    if (user.uId === owner) {
      arr.push(user.handleStr);

    }
  }


  for (const item of uIds) {
    for (let i = 0; i < data.users.length; i++) {
      const user: dataStoreUser = data.users[i];
      if (user.uId === item) {
        arr.push(user.handleStr);
      }
    }
  }
  arr = arr.sort();

  let ret = arr.join(', ')

  return ret;
}

function duplicateValueCheck(array) {
  if (array.length !== new Set(array).size) {
    return true;
  }

  return false;
}
