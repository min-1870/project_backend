import { getData, setData } from './dataStore';
import { dataStore, dataStoreUser, error, messages } from './types';
import { dataStoreUserToUser, duplicateValueCheck, getAuthUserIdFromToken, getDataStoreChannel, getDataStoreDm, getDataStoreUser, isAuthUserIdValid, isDataStoreDmValid, isUserMemberInDm, toOutputDms } from './utils';

let uniqueDmId = 0;

export function dmCreation(token:string, uIds: [number]) {
  const data: dataStore = getData();

  if (!isAuthUserIdValid(getAuthUserIdFromToken(token), data)) {
    return { error: 'Token is Invalid' };
  }

  for (const item of uIds) {
    if (data.users.find(user => user.uId === item) == null) {
      return { error: 'Invalid uId in uIds' };
    }
  }
  if (duplicateValueCheck(uIds) === true) {
    return { error: 'Duplicate uId values entered' };
  }

  const DmName = dmNameGenerator(token, uIds);
  const ownerMembers = dataStoreUserToUser(getDataStoreUser(getAuthUserIdFromToken(token), data));
  const allMembers = [ownerMembers];

  for (const item of uIds) {
    allMembers.push(dataStoreUserToUser(getDataStoreUser(item, data)));
  }

  for (let i = 0; i < data.users.length; i++) {
    const user: dataStoreUser = data.users[i];
    for (let j = 0; j < user.sessionTokens.length; j++) {
      if (user.sessionTokens[j] === token) {
        data.dms.push({
          dmId: uniqueDmId,
          name: DmName,
          ownerMembers: [ownerMembers],
          allMembers: allMembers,
          messages: []
        });
        const ret = uniqueDmId;
        uniqueDmId++;
        setData(data);
        return { dmId: ret };
      }
    }
  }
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

  const ret = arr.join(', ');

  return ret;
}

export function dmlist(token:string) {
  const data: dataStore = getData();
  if (!isAuthUserIdValid(getAuthUserIdFromToken(token), data)) {
    // console.log(token);
    return { error: 'Token is Invalid' };
  }
  const authUserId = getAuthUserIdFromToken(token);
  // let ret: dmInfo[];
  const dms = data.dms
    .filter(dm => dm.allMembers
      .find(member => member.uId === authUserId) != null) || [];

  return toOutputDms(dms);
}

export function deleteDm(token:string, dmId:number) {
  const data: dataStore = getData();
  // console.log(dmId);
  const authUserId = getAuthUserIdFromToken(token);
  if (!isAuthUserIdValid(getAuthUserIdFromToken(token), data)) {
    return { error: 'Token is Invalid' };
  }
  if (!isDataStoreDmValid(dmId, data)) {
    return { error: 'dmId is Invalid' };
  }
  for (const item of data.dms) {
    if (item.dmId.toString() === dmId.toString()) {
      if (item.ownerMembers[0].uId !== getAuthUserIdFromToken(token)) {
        return { error: 'user is not owner of dm' };
      }
    }
  }
  for (const item of data.dms) {
    if (item.dmId.toString() === dmId.toString()) {
      if (item.allMembers.find(user => user.uId.toString() === authUserId.toString()) == null) {
        return { error: 'user is not part of dm' };
      }
    }
  }

  const index = data.dms.findIndex(dm => dm.dmId.toString() === dmId.toString());
  data.dms.splice(index, 1);
  setData(data);
  return {};
}

export function dmLeave(token:string, dmId:number) {
  const data: dataStore = getData();
  // console.log(dmId);
  const authUserId = getAuthUserIdFromToken(token);
  if (!isAuthUserIdValid(getAuthUserIdFromToken(token), data)) {
    return { error: 'Token is Invalid' };
  }
  if (!isDataStoreDmValid(dmId, data)) {
    return { error: 'dmId is Invalid' };
  }
  for (const item of data.dms) {
    if (item.dmId.toString() === dmId.toString()) {
      if (item.allMembers.find(user => user.uId.toString() === authUserId.toString()) == null) {
        return { error: 'user is not part of dm' };
      }
    }
  }
  // console.log(data.dms);
  const indexOne = data.dms.findIndex(dm => dm.dmId.toString() === dmId.toString());
  const indexTwo = data.dms[indexOne].allMembers.findIndex(member => member.uId.toString() === getAuthUserIdFromToken(token).toString());
  data.dms[indexOne].allMembers.splice(indexTwo, 1);
  setData(data);
  // console.log(data.dms);
  return {};
}

export function dmMessages(authUserId: number, dmId: number, start: number): ({ messages: messages[], start: number, end: number } | error) {
  const data = getData();
  const dm = getDataStoreDm(dmId, data);
  if (dm == null) {
    return { error: 'dmId is Invalid' };
  } else if (!isAuthUserIdValid(authUserId, data)) {
    return { error: 'Invalid user ID' };
  } else if (start < 0 || start > dm.messages.length) {
    return { error: 'Invalid start' };
  } else if (!isUserMemberInDm(authUserId, dmId, data)) {
    return { error: 'user is not part of dm' };
  }

  const messages = dm.messages;
  let slicedMessages: messages[];
  let end: number;

  if (start + 50 >= messages.length) {
    end = -1;
    slicedMessages = messages.slice(start);
  } else {
    end = start + 50;
    slicedMessages = messages.slice(start, end);
  }

  return {
    messages: slicedMessages,
    start: start,
    end: end
  };
}