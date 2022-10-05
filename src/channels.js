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