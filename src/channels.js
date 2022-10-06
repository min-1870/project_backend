<<<<<<< src/channels.js
import { getData } from './dataStore.js'

let nextChannelId = 1;
=======
import { getData } from './dataStore'
>>>>>>> src/channels.js

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

export function channelsListV1(authUserId){
    let data = getData()
    if (!isAuthUserIdValid(authUserId, data)) {
        return { error: 'error' }
    }
  
    const channels = data.channels
        .filter( channel => channel.allMembers
            .find(member => member.uId == authUserId) != null)
        .map(channel => (
            {
            channelId: channel.channelId,
            name: channel.name
            })) || []
  
    return {
      channels
    }
}

//channelsListAllV1 stub fucntion
export function channelsListAllV1( authUserId ){
    let data = getData()
    
    if (!isAuthUserIdValid(authUserId, data)){    //if the uesr ID is not valid return error
      return { error: 'error' }; 
    }

    return {        //return every channels in the data without  Id & name only
        channels: data.channels.map(({channelId, name}) => ({channelId, name}))
      }
  }

<<<<<<< src/channels.js


function isAuthUserIdValid(authUserId, data) {
    return getUser(authUserId, data) != null
}
  
=======
function isAuthUserIdValid(authUserId, data) {
    return getUser(authUserId, data) != null
}

>>>>>>> src/channels.js
function getUser(authUserId, data) {
    return data.users.find(user => user.uId == authUserId)
}