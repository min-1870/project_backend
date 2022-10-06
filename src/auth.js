import {
  setData,
  getData,
} from './dataStore.js'
import validator from 'validator';

let uniqueuserID = 0;

// authLoginV1 stub function
export function authLoginV1(email, password) {
  let data = getData();

  let i = 0;  // checking if email has already been used
  while (true) {
    if (i >= data.users.length) {
      return {error: 'Email address is not registered'};
    }
    if (data.users[i]['email'] === email) {
      break;
    }  
    i ++;
  };
  if (data.users[i]['password'] !== password) {
    return {error: 'Wrong password'};
  } else {
    return {authUserId: data.users[i]['uId']};
  }



  
}
  

// authRegisterV1 function
export function authRegisterV1(email, password, nameFirst, nameLast) {
  let data = getData();

  if (!(validator.isEmail(email))) { //checking if email is valid
    return {error: 'Invalid Email'}
  };

  let i =0;  // checking if email has already been used
  while (true) {
    if (i >= data.users.length) {
      break;
    }
    if (data.users[i]['email'] === email) {
      return {error: 'Email address already in use'};
    }
    
    i ++;
  };

  if (password.length < 6) {
    return {error: 'password has to be six characters or longer'};
  };

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return {error: 'First name has to be between 1 and 50 characters in length'};
  };

  if (nameLast.length < 1 || nameLast.length > 50) {
    return {error: 'Last name has to be between 1 and 50 characters in length'};
  };
  let fullname = nameFirst.toLowerCase() + nameLast.toLowerCase();
  fullname = onlyalphanumeric(fullname);
  if (fullname.length > 20) {
    fullname = fullname.substring(0,20)
  };

  i = 0;  // checking if handleStr already exist and making unique if not already
  let j = 0;
  let finalchar = (fullname.length);
  while (true) {
    if (i >= data.users.length) {
      break;
    }
    if (data.users[i]['handleStr'] === fullname) {
      
      if (j !== 0) {
        fullname = fullname.substring(0, fullname.length - 1);
      }
      
      fullname = fullname + j;
      j ++;
      i = 0;
    }
    
    i ++;
  };


  let uuID = uniqueuserID;
  const temp = {
    uId: uuID,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: fullname
  }
  
  uniqueuserID ++;
  data.users.push(temp);
  setData(data);
  return {authUserId: uuID};
};

// Helper function to remove non alpha-numeric characters from string
function onlyalphanumeric(handle) {
  let i = 0;
  while (i < handle.length) {
    if (handle[i] < 'A' || handle[i] > 'Z' && handle[i] < 'a' || handle[i] > 'z') {
      handle = handle.substring(0, i) + handle.substring(i + 1);
      i--;
    }
    i++;
  };
  return handle;
};