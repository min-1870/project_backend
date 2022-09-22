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

// channelJoinV1 stub function
function channelJoinV1(authUserId, channelId) {
  return {

  }
}

//channelInviteV1 stub function
function channelInviteV1(authUserId, channelId) {
  return {
  }
}

//channelMessagesV1 stub function
function channelMessagesV1 ( authUserId, channelId, start ) {
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
