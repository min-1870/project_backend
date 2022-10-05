import { getData } from './dataStore.js'

let nextChannelId = 1;

//channelsCreateV1 stub fucntion
export function channelsCreateV1( authUserId, name, isPublic ){
    if (name.length < 1 || name.length > 20) {
        return { error: 'error' }
    }
  
    let data = getData()
    if (!isAuthUserIdValid(authUserId, data)) {
        return { error: 'error' }
    }
    const user = getUser(authUserId, data)
    const member = {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr
    }
    const newChannel = {
        channelId: nextChannelId,
        isPublic,
        name,
        ownerMembers: [member],
        allMembers: [member],
        messages: [],
    } 
    data.channels.push(newChannel)
    nextChannelId++;
    return {
        channelId: newChannel.channelId,
    }
}

//channelsListV1 stub fucntion
function channelsListV1( authUserId ){
    return {
        channels: [
          {
            channelId: 1,
            name: 'My Channel',
          }
        ],
      }
  }

//channelsListAllV1 stub fucntion
function channelsListAllV1( authUserId ){
    return {
        channels: [
          {
            channelId: 1,
            name: 'My Channel',
          }
        ],
      }
  }



function isAuthUserIdValid(authUserId, data) {
    return getUser(authUserId, data) != null
}
  
function getUser(authUserId, data) {
    return data.users.find(user => user.uId == authUserId)
}