import { getData } from './dataStore'
// channelDetailsV1 stub function
function channelDetailsV1(authUserId, channelId) {
  return {
    name: 'Hayden',
    ownerMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
    allMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
  }
}

// channelJoinV1 function
export function channelJoinV1(authUserId, channelId) {
  let data = getData();
  let uIdList = data.users.filter((element) => {
    return element.uId === authUserId;
  });
  let cIdList = data.channels.filter((element) => {
    return element.channelId === channelId;
  });
  let MemberInChannel = data.channels.filter((element) => {
    return (element.channelId === channelId && element.allMembers.includes(authUserId));
  });
  let privateChannel = data.channels.filter((element) => {
    return (element.channelId === channelId && element.isPublic === false);
  });
  let GlobalOwner = data.users.filter((element) => {
    return (element.uId === authUserId && element.isGlobalOwner === true);
  });
  if (uIdList.length === 0 ||
    cIdList.length === 0 ||
    MemberInChannel === 1 ||
    (privateChannel === 1 && MemberInChannel === 0 && GlobalOwner === 0)) {
    return { error: 'error' };
  }
  for (const element of data.channels) {
    if (channelId === element.channelId) {
      element.allMembers.push(authUserId);
    }
  }
  return {};
}

//channelInviteV1 function
export function channelInviteV1(authUserId, channelId, uId) {
  let data = getData();
  let uIdList = data.users.filter((element) => {
    return element.uId === uId;
  });
  let authIdList = data.users.filter((element) => {
    return element.uId === authUserId;
  });
  let cIdList = data.channels.filter((element) => {
    return element.channelId === channelId;
  });
  let MemberInChannel = data.channels.filter((element) => {
    return (element.channelId === channelId && element.allMembers.includes(uId));
  });
  let authorisedUserNotMember = data.channels.filter((element) => {
    return (element.channelId === channelId && !element.allMembers.includes(authUserId));
  });
  if (uIdList.length === 0 ||
    authIdList.length === 0 ||
    cIdList.length === 0 ||
    MemberInChannel === 1 ||
    authorisedUserNotMember === 1) {
    return { error: 'error' };
  }
  for (const element of data.channels) {
    if (channelId === element.channelId) {
      element.allMembers.push(uId);
    }
  }
  return {};
}

/** <channelMessagesV1>
  * Given a channel with ID channelId that the authorised user
  * is a member of, returns up to 50 messages between index
  * "start" and "start + 50". Message with index 0 (i.e. the
  * first element in the returned array of messages) is the
  * most recent message in the channel. This function returns
  * a new index "end". If there are more messages to return
  * after this function call, "end" equals "start + 50". If
  * this function has returned the least recent messages in
  * the channel, "end" equals -1 to indicate that there are no
  * more messages to load after this return.
  * 
  * @param {number} authUserId - a user ID in the dataStore
  * @param {number} channelId - a channel ID in the dataStore
  * @param {number} start - the index of the starting point
  * @returns {{messages: array, start: number, end: number}} - an object contains the messages and information of pages
*/
export function channelMessagesV1(authUserId, channelId, start) {
  let data = getData()

  if (data.channels.find(channel => channel.channelId == channelId) == null) {   //if the channel Id is not exist, return error
    return { error: "Invalid channel ID" }

  } else if (data.users.find(user => user.uId == authUserId) == null) {           //if the user Id is not exist, return error
    return { error: "Invalid user ID" }

  } else if (start < 0 || start > data.channels.find(channel => channel.channelId == channelId).messages.length) {                //if starting point is out of range, return error
    return { error: "Invalid start" }

  } else if (data.channels.find(channel => channel.channelId == channelId).allMembers.find(user => user.uId == authUserId) == null) {    //if the user is not the member of the channel, return error
    return { error: "Not a member of the channel" }

  }

  let messages = data.channels.find(channel => channel.channelId == channelId).messages
  let slicedMessages
  let end;

  if (start + 50 >= messages.length) {
    end = -1
    slicedMessages = messages.slice(start)
  } else {
    end = start + 50
    slicedMessages = messages.slice(start, end)
  }

  return {
    messages: slicedMessages,
    start: start,
    end: end,
  }
}
