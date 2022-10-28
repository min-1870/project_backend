import { dataStore } from './types';
import fs from 'fs';

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: dataStore = {
  users: [
    /*
    uId: number,
    email: string,
    password: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string,
    isGlobalOwner: boolean
    sessionTokens: [string]
    */
  ],
  channels: [
    /*
    channelId: number,
    isPublic (boolean),
    name (string),
    ownerMembers: [object],
    allMembers: [object],
    messages: [object]
    */
  ],
  dms: [
    /*
    dmId: number,
    name: string,
    ownerMembers: [object],
    allMembers: [object],
    messages: [object]
    */
  ],

};

// save function
const saveDataStore = () => {
  const jsonstr = JSON.stringify(data);
  fs.writeFileSync('./database.json', jsonstr);
};
// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): dataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataStore) {
  data = newData;
  saveDataStore();
}

export { getData, setData };
