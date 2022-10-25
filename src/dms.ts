import { getData, setData } from './dataStore';
import { dataStore, dataStoreUser } from './types';
import { dataStoreUserToUser, duplicateValueCheck, getAuthUserIdFromToken, getDataStoreUser, isAuthUserIdValid, isDataStoreDmValid, toOutputDms } from './utils';

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

  if (!isAuthUserIdValid(getAuthUserIdFromToken(token), data)) {
    return { error: 'Token is Invalid' };
  }
  if (!isDataStoreDmValid(dmId, data)) {
    return { error: 'dmId is Invalid' };
  }
  for (const item of data.dms) {
    console.log(item.dmId);
    console.log(dmId);
    if (item.dmId.toString() === dmId.toString()) {
      if (item.ownerMembers[0].uId !== getAuthUserIdFromToken(token)) {
        return { error: 'user is not owner of dm' };
      }
    }
  }
  for (const item of data.dms) {
    if (item.dmId.toString() === dmId.toString()) {
      if (item.allMembers.find(user => user.uId === getAuthUserIdFromToken(token) == null)) {
        return { error: 'user is no longer part of dm' };
      }
    }
  }

  const index = data.dms.findIndex(dm => dm.dmId.toString() === dmId.toString());
  data.dms.splice(index, 1);
  setData(data);
  return {};
}
