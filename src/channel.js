import { getData, setData } from './dataStore.js'

/**
  * <channelDetailsV1>
  * Given a channelId of a channel that the authorised user can join, 
  * adds them to that channel.
  * 
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel
  *  * ...
  * @returns {object} - An object containing basic details of the channel such as name, isPublic, ownerMembers and allMembers
*/
// channelDetailsV1 function
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

  let rightChannel = data.channels.find(channel => channel.channelId === channelId);

  return {
    name: rightChannel.name,
    isPublic: rightChannel.isPublic, 
    ownerMembers: rightChannel.ownerMembers, 
    allMembers: rightChannel.allMembers
  }
};

/**
  * <channelJoinV1>
  * Given a channelId of a channel that the authorised user can join, 
  * adds them to that channel.
  * 
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel 
  * *   ...
  * @returns {} - empty object returned
*/
// channelJoinV1 function
export function channelJoinV1(authUserId, channelId) {
  let data = getData(); 
  const user = data.users.find(user => user.uId == authUserId)
  const channel = data.channels.find(channel => channel.channelId == channelId)

  if (channel == null) {   //if the channel Id is not exist, return error
    return { error: "Invalid channel ID" }

  } else if (user == null) {           //if the user Id is not exist, return error
    return { error: "Invalid user ID" }

  } else if (channel.allMembers.find(user => user.uId == authUserId) != null){
    return { error: "User are in the channel"}

  } else if (channel.isPublic == false && user.isGlobalOwner == false){
    return { error: "This is a private server"}
  }

  let newMember = data.users.find(user => user.uId == authUserId)                //find the user data
  data.channels.find(channel => channel.channelId == channelId).allMembers.push(newMember) //find the channel and join the member
  //don't neet to setData

/*  
  let uIdList = data.users.filter((element) => {
    return element.uId === authUserId;
  });
  let cIdList = data.channels.filter((element) => {
    return element.channelId === channelId;
  });
  let memberInChannel = data.channels.filter((element) => {
    return (element.channelId === channelId && element.allMembers.includes(authUserId));
  });
  let privateChannel = data.channels.filter((element) => {
    return (element.channelId === channelId && element.isPublic === false);
  });
  let globalOwner = data.users.filter((element) => {
    return (element.uId === authUserId && element.isGlobalOwner);
  });
  if (uIdList.length === 0 ||
    cIdList.length === 0 ||
    memberInChannel.length === 1 ||
    (privateChannel.length === 1 && MemberInChannel.length === 0 && globalOwner.length === 0)) {
    return { error: 'error' };
  }
  console.log(data.channels.allMembers);
  for (const element of data.channels) {
    if (channelId === element.channelId) {
      element.allMembers.push(authUserId);
    }
  }
  */
  return {};
}

/**
  * <channelInviteV1>
  * Invites a user with ID uId to join a channel with ID channelId. 
  * Once invited, the user is added to the channel immediately. 
  * In both public and private channels, all members are able to invite users.
  * 
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel
  * @param {number} uId - uId in user
  * * *   ...
  * @returns {} - empty object returned
*/

//channelInviteV1 function
export function channelInviteV1(authUserId, channelId, uId) {
  let data = getData();
  // console.log(data);

  let i =0;  // checking if channelId exists
  while (true) {
    if (i >= data.channels.length) {
      return {error: 'Channel ID does not refer to a valid channel'};
    }
   
  
    if (data.channels[i]['channelId'] === channelId) {
      break;
    }
    
    i ++;
  };
  let channelIndex = i;

  i =0;  // checking if authId exists
  while (true) {
    if (i >= data.users.length) {
      return {error: 'authUserId does not exist'};
    }
    // console.log(authUserId);
    // console.log(uId);
    // console.log(data.channels[i]['uId']);
    if (data.users[i]['uId'] === authUserId) {
      break;
    }
    
    i ++;
  };

  i =0;  // checking if uId exists
  while (true) {
    if (i >= data.users.length) {
      return {error: 'User ID does not exist'};
    }
    if (data.users[i]['uId'] === uId) {
      break;
    }
    
    i ++;
  };
  let uIdmarker = i;
  // console.log(data.channels[channelIndex]['allMembers'][0].uId);
  // console.log(uId);
  for (const item of data.channels[channelIndex]['allMembers']) {
    // console.log(item.uId);
    
    if (item.uId === uId){
      return { error: 'user already member of channel' };
    }
    
  }

  i =0;  // checking if authId exists
  while (true) {
    if (i >= data.channels[channelIndex]['allMembers'].length) {
      return {error: 'authUserId is not member of channel'};
    }
    // console.log(authUserId);
    // console.log(uId);
    // console.log(data.channels[i]['uId']);
    if (data.channels[channelIndex]['allMembers'][i]['uId'] === authUserId) {
      break;
    }
    
    i ++;
  };

  data.channels[channelIndex]['allMembers'].push(data.users[uIdmarker]);
  // console.log(data.channels[channelIndex]['allMembers']);
  
   


  


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
    end: end
  }
}
