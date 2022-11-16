import { database } from './dataStore';
import HTTPError from 'http-errors';

export function deleteUser(token:string, uId: number) {
  const authUser = database.getUserByToken(token);

  if (database.isUserGlobalOwner(authUser.uId) === false) {
    throw HTTPError(403, 'authorised user is not global owner');
  }

  if (!database.isUserIdValid(uId)) {
    throw HTTPError(400, 'uId is not valid');
  }

  if (database.howManyGlobalOwners() === 1) {
    throw HTTPError(400, 'uId is only global owner');
  }
  console.log("hi");
  console.log(database.getUserById(uId));
  database.removeUserName(uId);
  console.log(database.getUserById(uId));
  // should fix it showing up on users/all

  for (const item of database.dms) {
    if (database.isUserInDm(uId, item.dmId)) {
      database.removeUserFromDm(uId, item.dmId);
      for (const message of item.messages) {
        if (message.uId === uId) {
          database.removeUserDmMessage(message.uId);
        }
      }
    }
  }
  for (const item of database.channels) {
    if (database.isUserMemberInChannel(uId, item.channelId)) {
      database.removeUserFromChannel(uId, item.channelId);
      for (const message of item.messages) {
        if (message.uId === uId) {
          database.removeUserChannelMessage(message.uId);
        }
      }
    }
  }
  return {};
}
