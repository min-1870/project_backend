
import { channelsListV1, channelsListAllV1 } from './channels';
import { clearV1 } from './other';
import { getData, setData } from './dataStore';

describe('Test suite for channels functions', () => {
    const channelCreatorId = 1;          //test userID
    const channelName = 'Cat Channel';   //test channel
    const channelCreator = {  //profile of the test user
        uId: channelCreatorId,
        namesFirst: 'Adam',
        namesLast: 'Johnston',
        email: 'test@gmail.com',
        handleStr: 'adamjohnston',
        password: 'test123'
    }
    const channelId = 10000;  

    beforeEach(() => {       //before every test reset and add a new test user
        clearV1()
        let data = getData()
        data = {
            users: [
                channelCreator
            ],
            channels: []
        }
        setData(data)
    });

    test('channelsListAllV1 invalid authUserId', () => {

      expect(channelsListAllV1(24092001)).toStrictEqual({       //input random ID
          error: 'error'
      });
    }); 

    test('channelsListAllV1 valid authUserId returns empty list', () => {

      expect(channelsListAllV1(channelCreatorId)).toStrictEqual({   //did not add any test channel
        channels: []
      });
    }); 

    test('channelsListAllV1 valid authUserId returns list of all channels', () => {
        let data = getData();
        data.channels.push({            //added the test channel 1 (public)
            channelId: channelId,
            isPublic: true,
            name: channelName,
            ownerMembers: [channelCreator],
            allMembers: [channelCreator]
        });
        data.channels.push({            //added the test channel 2 (private)
            channelId: channelId+1,
            isPublic: false,
            name: channelName+'2',
            ownerMembers: [channelCreator],
            allMembers: [channelCreator]
        });
        setData(data);

        expect(channelsListAllV1(channelCreatorId)).toStrictEqual({ //received both test channel
            channels: [
                {
                    channelId: channelId,
                    name: channelName
                },
                {
                    channelId: channelId+1,
                    name: channelName+'2'
                }
            ]
        });

    }); 
    
});