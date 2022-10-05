import { channelsListV1 } from './channels';
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
    const channelId = 10000;

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

    test('channels list valid authUserId with channels returns list of channels', () => {
        let data = getData();
        data.channels.append({
            channelId,
            name: channelName
        });
        setData(data);
        const channelListResult = channelsListV1(channelCreatorId)

        expect(channelListResult).toStrictEqual({
            channels: []
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
            error: 'error'
        });
    }); 
});