import { channelsCreateV1,channelsListV1, channelsListAllV1 } from '../src/channels.ts';
import { authRegisterV1 } from '../src/auth.js';
import { clearV1 } from '../src/other.js';

const channelCreatorId = 1;
const channelName = 'Cat Channel';
const channelCreator = {
    uId: channelCreatorId,
    namesFirst: 'Adam',
    namesLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
    password: 'test123'
}
const channelId = 10000;  

beforeEach(() => {
    // Before every test reset and add a new test user
    clearV1()
    authRegisterV1(channelCreator.email, channelCreator.password, channelCreator.namesFirst, channelCreator.namesLast);
});

describe('Test set for the function channelsCreate', () => {

    test('create new public channel success', () => {
        const createChannelResult = channelsCreateV1(channelCreatorId, channelName, true)
        expect(createChannelResult).toStrictEqual({
            channelId: expect.any(Number)
        });

        expect(channelsListV1(channelCreatorId)).toStrictEqual({
            channels: [
                {
                    channelId: createChannelResult.channelId,
                    name: channelName,
                }
            ]
        });

        expect(channelsListAllV1(channelCreatorId)).toStrictEqual({
            channels: [
                {
                    channelId: createChannelResult.channelId,
                    name: channelName
                }
            ]
        });
    });

    test('create new private channel success', () => {
        const createChannelResult = channelsCreateV1(channelCreatorId, channelName, false)

        expect(createChannelResult).toStrictEqual({
            channelId: expect.any(Number)
        });

        expect(channelsListV1(channelCreatorId)).toStrictEqual({
            channels: [
                {
                    channelId: createChannelResult.channelId,
                    name: channelName,
                }
            ]
        });

        expect(channelsListAllV1(channelCreatorId)).toStrictEqual({
            channels: [
                {
                    channelId: createChannelResult.channelId,
                    name: channelName
                }
            ]
        });
    });

    test('create new channel name less than 1 return error', () => {
        const createChannelResult = channelsCreateV1(channelCreatorId, '', false)

        expect(createChannelResult).toStrictEqual({
            error: 'error'
        });
    });

    test('create new channel name more than 20 return error', () => {
        const createChannelResult = channelsCreateV1(channelCreatorId, 'helloisitmeyoulookingforhelloagain', false)

        expect(createChannelResult).toStrictEqual({
            error: 'error'
        });
    });

    test('create new channel creator is invalid return error', () => {
        const createChannelResult = channelsCreateV1(24092001, channelName, false)

        expect(createChannelResult).toStrictEqual({
            error: 'error'
        });
    });
});



describe('Test set for the function channelsList', () => {

    test('channels list valid authUserId with channels returns list of channels', () => {
        let data = getData();
        data.channels.push({
            channelId,
            name: channelName,
            allMembers: [channelCreator]
        });
        setData(data);
        const channelListResult = channelsListV1(channelCreatorId)

        expect(channelListResult).toStrictEqual({
            channels: [
                {
                    channelId,
                    name: channelName
                }
            ]
        });
    }); 

    test('channels list valid authUserId with no channels returns empty list', () => {
        const channelListResult = channelsListV1(channelCreatorId)

        expect(channelListResult).toStrictEqual({
            channels: []
        });
    }); 

    test('channels list invalid authUserId', () => {
        const channelListResult = channelsListV1(24092001)

        expect(channelListResult).toStrictEqual({
            error: 'authUserId is not valid'
        });
    }); 
});



describe('Test set for the function channelsListAllV1', () => {
    
    test('channelsListAllV1 invalid authUserId', () => {

      expect(channelsListAllV1(24092001)).toStrictEqual({
          error: 'authUserId is not valid'
      });
    }); 

    test('channelsListAllV1 valid authUserId returns empty list', () => {

      expect(channelsListAllV1(channelCreatorId)).toStrictEqual({
        channels: []
      });
    }); 

    test('channelsListAllV1 valid authUserId returns list of all channels', () => {
        let data = getData();
        data.channels.push({
            channelId: channelId,
            isPublic: true,
            name: channelName,
            ownerMembers: [channelCreator],
            allMembers: [channelCreator]
        });
        data.channels.push({
            channelId: channelId+1,
            isPublic: false,
            name: channelName+'2',
            ownerMembers: [channelCreator],
            allMembers: [channelCreator]
        });
        setData(data);

        expect(channelsListAllV1(channelCreatorId)).toStrictEqual({
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

