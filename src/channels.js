import { getData } from './dataStore.js'

let nextChannelId = 1;

/**
 * Creates a new channel with the given name, that is either a public or private channel. 
 * The user who created it automatically joins the channel.
 * 
 * @param {number} authUserId - The creator's user ID.
 * @param {string} name - The name of the channel to create.
 * @param {boolean} isPublic - Whether the new channel is a public channel or not.
 * @returns { channelId: number } object.
 */
export function channelsCreateV1(authUserId, name, isPublic){
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

/**
 * Provides an array of all channels (and their associated details) 
 * that the authorised user is part of.
 * 
 * @param {number} authUserId - The user ID to list the channels for.
 * @returns { channels: [{channelId: number, name: string }] } object.
 */
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
      channels: channels
    }
}

/** <channelsListAllV1>
  * Provides an array of all channels, including private
  * channels (and their associated details)
  * 
  * @param {number} authUserId - a user ID in the dataStore
  * @returns {{channels}} - Array of objects, where each object contains types { channelId, name }
*/
export function channelsListAllV1( authUserId ){
    let data = getData()
    
    // If the uesr ID is not valid return error
    if (!isAuthUserIdValid(authUserId, data)) {
        return { error: 'error' }; 
    }
    
     // Return every channels in the data without Id & name only
    return {
        channels: data.channels.map(({channelId, name}) => ({channelId, name}))
    }
  }

function isAuthUserIdValid(authUserId, data) {
    return getUser(authUserId, data) != null
}

function getUser(authUserId, data) {
    return data.users.find(user => user.uId == authUserId)
}
