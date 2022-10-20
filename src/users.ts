import {
  getData,
} from './dataStore';

/**
 * <userProfileV1>
 * For a valid user, return info about their user ID, email, firstname , last name and handle
 *
 *
 * @param {number} authUserId - userId of user asking to view
 * @param {number} uID - userId of user to look at
 * * *
 * @returns {} - empty object
 */
// userProfileV1 function
export function userProfileV1(authUserId:number, uID:number): any {
  const data = getData();
  let i = 0; // checking if authUserId is valid
  while (true) {
    if (i >= data.users.length) {
      return { error: 'authUserId is not valid' };
    }
    // console.log(data.users[i]['uId']);
    // console.log(authUserId);
    if (data.users[i].uId === authUserId) {
      break;
    }
    i++;
  }

  i = 0; // checking if uID is valid
  while (true) {
    if (i >= data.users.length) {
      return { error: 'uId is not valid' };
    }
    if (data.users[i].uId === uID) {
      break;
    }
    i++;
  }

  return {
    uId: data.users[i].uId,
    email: data.users[i].email,
    nameFirst: data.users[i].nameFirst,
    nameLast: data.users[i].nameLast,
    handleStr: data.users[i].handleStr
  };
}
