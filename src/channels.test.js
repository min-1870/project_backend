import { channelsCreateV1, channelsListV1 } from './channels';
import { clearV1 } from './other';
import { getData, setData } from './dataStore';


describe('Test suite for channels functions', () => {
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

    beforeEach(() => {
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
  
    //happy path for channelsCreateV1
    test('create new public channel success', () => {
        const createChannelResult = channelsCreateV1(channelCreatorId, channelName, true)

        expect(createChannelResult).toStrictEqual({
            channelId: expect.any(Number)
        });
    });

    test('create new private channel success', () => {
        const createChannelResult = channelsCreateV1(channelCreatorId, channelName, false)

        expect(createChannelResult).toStrictEqual({
            channelId: expect.any(Number)
        });
    });

    //unhappy path for both Create and List
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