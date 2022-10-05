import {
    getData,
  } from './dataStore.js'

// userProfileV1 function
export function userProfileV1( authUserId, uID ){
    let data = getData();
    let i = 0;  // checking if authUserId is valid
    while (true) {
        if (i >= data.users.length) {
            return {error: 'authUserId is not valid'};
        }
        if (data.users[i]['uID'] === authUserId) {
            break;
        }  
        i ++;
    };

    i = 0;  // checking if uID is valid
    while (true) {
        if (i >= data.users.length) {
            return {error: 'uID is not valid'};
        }
        if (data.users[i]['uID'] === uID) {
            break;
        }  
        i ++;
    };


    
    return {
      uId: data.users[i]['uID'],
      email: data.users[i]['email'],
      nameFirst: data.users[i]['nameFirst'],
      nameLast: data.users[i]['nameLast'],
      handleStr: data.users[i]['handleStr']
    }
}