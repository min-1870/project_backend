import { getData, setData } from "./dataStore";
import { dataStore, dataStoreUser } from "./types";
import { dataStoreUserToUser, duplicateValueCheck, getAuthUserIdFromToken, getDataStoreUser, isAuthUserIdValid } from "./utils";

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
