import { data } from './dataStore.js';
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
function channelJoinV1(authUserId, channelId) {
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
    return (element.uId === authUserId && element.GlobalOwner === true);
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

//channelInviteV1 stub function
function channelInviteV1(authUserId, channelId) {
  return {
  }
}

//channelMessagesV1 stub function
function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [
      {
        messageId: 1,
        uId: 1,
        message: 'Hello world',
        timeSent: 1582426789,
      }
    ],
    start: 0,
    end: 50,
  }
}
