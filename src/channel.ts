import { getData, setData } from './dataStore.js'
import {
  error,
  message,
  dataStore,
  dataStoreUser,
  dataStoreChannel
} from './types';

/**
  * Given a channelId of a channel that the authorised user can join,
  * adds them to that channel.
  *
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel
  *
  * @returns {object} - An object containing basic details of the channel such as name, isPublic, ownerMembers and allMembers
*/
export function channelDetailsV1(authUserId: number, channelId: number): ({name: string, isPublic: boolean, ownerMembers: dataStoreUser[], allMembers: dataStoreUser[]} | error) {
  const data = getData();
  if (data.channels.find(channel => channel.channelId === channelId) == null) {
    return { error: "Channel ID does not refer to a valid channel" }
  } else if (data.users.find(user => user.uId === authUserId) == null) {
    return {error: "User ID does not exist"}
  } else if(data.channels.find(channel => channel.channelId === channelId).allMembers.find(user => user.uId === authUserId) == null){    //if the user is not the member of the channel, return error
    return { error: "User is not a member of channel" }
  }

  const rightChannel = data.channels.find(channel => channel.channelId === channelId);

  return {
    name: rightChannel.name,
    isPublic: rightChannel.isPublic, 
    ownerMembers: rightChannel.ownerMembers, 
    allMembers: rightChannel.allMembers
  }
};

/**
  * Given a channelId of a channel that the authorised user can join,
  * adds them to that channel.
  *
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel
  *
  * @returns {} - empty object returned
*/
export function channelJoinV1(authUserId: number, channelId: number): ({} | error) {
  const data: dataStore = getData(); 
  const user: dataStoreUser | null = data.users.find(user => user.uId == authUserId)
  const channel: dataStoreChannel = data.channels.find(channel => channel.channelId == channelId)

  if (channel == null) {
    return { error: "Invalid channel ID" }
  } else if (user == null) {
    return { error: "Invalid user ID" }
  } else if (channel.allMembers.find(user => user.uId == authUserId) != null){
    return { error: "User are in the channel"}
  } else if (!channel.isPublic && !user.isGlobalOwner){
    return { error: "This is a private server" }
  }
  
  data.channels.find(channel => channel.channelId == channelId)
    .allMembers.push(user)
  return {};
}

/**
  * Invites a user with ID uId to join a channel with ID channelId. 
  * Once invited, the user is added to the channel immediately. 
  * In both public and private channels, all members are able to invite users.
  *
  * @param {number} authUserId - uId in user
  * @param {number} channelId - channelId in channel
  * @param {number} uId - uId in user
  *
  * @returns {} - empty object returned
*/
export function channelInviteV1(authUserId: number, channelId: number, uId: number): ({} | error) {
  let data: dataStore = getData();

  let i: number = 0;
  while (true) {
    if (i >= data.channels.length) {
      return { error: 'Channel ID does not refer to a valid channel' };
    }
   
  
    if (data.channels[i]['channelId'] === channelId) {
      break;
    }
    
    i++;
  }
  let channelIndex: number = i;

  i = 0;
  while (true) {
    if (i >= data.users.length) {
      return {error: 'authUserId does not exist'};
    }
    if (data.users[i]['uId'] === authUserId) {
      break;
    }
    
    i++;
  }

  i = 0;
  while (true) {
    if (i >= data.users.length) {
      return {error: 'User ID does not exist'};
    }
    if (data.users[i]['uId'] === uId) {
      break;
    }
    i++;
  }
  let uIdmarker: number = i;
  for (const item of data.channels[channelIndex]['allMembers']) {
    if (item.uId === uId){
      return { error: 'user already member of channel' };
    }
  }

  i = 0;
  while (true) {
    if (i >= data.channels[channelIndex]['allMembers'].length) {
      return { error: 'authUserId is not member of channel' };
    }
    if (data.channels[channelIndex]['allMembers'][i]['uId'] === authUserId) {
      break;
    }
    i++;
  }
  data.channels[channelIndex]['allMembers'].push(data.users[uIdmarker]);
  return {};
}

/**
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
export function channelMessagesV1(authUserId: number, channelId: number, start: number): ( {messages: message[], start: number, end: number } | error) {
  let data: dataStore= getData()
  if (data.channels.find(channel => channel.channelId == channelId) == null) {
    return { error: "Invalid channel ID" }

  } else if (data.users.find(user => user.uId == authUserId) == null) {
    return { error: "Invalid user ID" }

  } else if (start < 0 || start > data.channels.find(channel => channel.channelId == channelId).messages.length) {                //if starting point is out of range, return error
    return { error: "Invalid start" }

  } else if (data.channels.find(channel => channel.channelId == channelId).allMembers.find(user => user.uId == authUserId) == null) {    //if the user is not the member of the channel, return error
    return { error: "Not a member of the channel" }
  }

  let messages: message[] = data.channels.find(channel => channel.channelId == channelId).messages
  let slicedMessages: message[];
  let end: number;

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
