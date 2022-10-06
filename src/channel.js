import { getData } from './dataStore'
// channelDetailsV1 stub function
export function channelDetailsV1(authUserId, channelId) {
  let data = getData();
  if (data.channels.find(channel => channel.channelId === channelId) == null){   //if the channel Id is not exist, return error
    return {error: "Channel ID does not refer to a valid channel"}
  }
  else if (data.users.find(user => user.uId === authUserId) == null){           //if the user Id is not exist, return error
    return {error: "User ID does not exist"}
  }
  else if(data.channels.find(channel => channel.channelId === channelId).allMembers.find(user => user.uId === authUserId) == null){    //if the user is not the member of the channel, return error
    return {error: "User is not a member of channel"}
  }
  else {
    const rightChannel = data.channels.find(channel => channel.channelId === channelId);
  }
  const details = {
    name: rightChannel.name,
    isPublic: rightChannel.isPublic, 
    ownerMembers: rightChannel.ownerMembers, 
    allMembers: rightChannel.allMembers,
  };
  return {details}
};
  /*
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
  */


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
export function channelMessagesV1 ( authUserId, channelId, start ) {
  let data = getData()

  if (data.channels.find(channel => channel.channelId == channelId) == null){   //if the channel Id is not exist, return error
    return {error: "Invalid channel ID"}

  }else if (data.users.find(user => user.uId == authUserId) == null){           //if the user Id is not exist, return error
    return {error: "Invalid user ID"}

  }else if(start < 0 || start > data.channels.find(channel => channel.channelId == channelId).messages.length){                //if starting point is out of range, return error
    return {error: "Invalid start"}

  }else if(data.channels.find(channel => channel.channelId == channelId).allMembers.find(user => user.uId == authUserId) == null){    //if the user is not the member of the channel, return error
    return {error: "Not a member of the channel"}

  }

  let messages = data.channels.find(channel => channel.channelId == channelId).messages
  let slicedMessages
  let end;

  if(start + 50 >= messages.length){
    end = -1
    slicedMessages = messages.slice(start)
  }else{
    end = start + 50
    slicedMessages = messages.slice(start, end)
  }

  return {
    messages: slicedMessages,
    start: start,
    end: end,
  }
}
