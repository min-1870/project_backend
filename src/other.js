import {
    setData,
} from './dataStore.js'

export function clearV1(){
    
    const data = {
        users: [   
        ],
        channels: [
        ]    
    };
    setData(data);
    return;
};