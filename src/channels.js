import { getData } from './dataStore'

//channelsCreateV1 stub fucntion
function channelsCreateV1( authUserId, name, isPublic ){
    return {
      channelId: 1,
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

function isAuthUserIdValid(authUserId, data) {
    return getUser(authUserId, data) != null
}

function getUser(authUserId, data) {
    return data.users.find(user => user.uId == authUserId)
}