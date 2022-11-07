import { channelsCreateV1, channelsListV1, channelsListAllV1 } from '../src/channels';
import { authRegisterV1 } from '../src/auth';
import { clearV1 } from '../src/other';
import { authUserId, channelId, error, user } from '../src/types';

let channelCreatorId: number;
let channelCreator: user;
const TEST_CHANNEL_NAME = 'Cat Channel';

const CHANNEL_CREATOR_NAME_FIRST = 'Adam';
const CHANNEL_CREATOR_NAME_LAST = 'Johnston';
const CHANNEL_CREATOR_EMAIL = 'test@gtmail.com';
const CHANNEL_CREATOR_HANDLESTR = 'adamjohnston';
const CHANNEL_CREATOR_PW = 'rtefdas1q23';

beforeEach(() => {
  // Before every test reset and add a new test user
  clearV1();
  const registerResult = authRegisterV1(CHANNEL_CREATOR_EMAIL, CHANNEL_CREATOR_PW, CHANNEL_CREATOR_NAME_FIRST, CHANNEL_CREATOR_NAME_LAST) as authUserId;
  channelCreatorId = registerResult.authUserId;

  channelCreator = {
    uId: channelCreatorId,
    email: CHANNEL_CREATOR_EMAIL,
    nameFirst: CHANNEL_CREATOR_NAME_FIRST,
    nameLast: CHANNEL_CREATOR_NAME_LAST,
    handleStr: CHANNEL_CREATOR_HANDLESTR
  };
});

describe('Test set for the function channelsCreate', () => {
  test('create new public channel success', () => {
    const createChannelResult = channelsCreateV1(channelCreator.uId, TEST_CHANNEL_NAME, true) as channelId;
    expect(createChannelResult).toStrictEqual({
      channelId: expect.any(Number)
    });

    expect(channelsListV1(channelCreatorId)).toStrictEqual({
      channels: [
        {
          channelId: createChannelResult.channelId,
          name: TEST_CHANNEL_NAME,
        }
      ]
    });

    expect(channelsListAllV1(channelCreatorId)).toStrictEqual({
      channels: [
        {
          channelId: createChannelResult.channelId,
          name: TEST_CHANNEL_NAME
        }
      ]
    });
  });

  test('create new private channel success', () => {
    const createChannelResult = channelsCreateV1(channelCreatorId, TEST_CHANNEL_NAME, false) as channelId;

    expect(createChannelResult).toStrictEqual({
      channelId: expect.any(Number)
    });

    expect(channelsListV1(channelCreatorId)).toStrictEqual({
      channels: [
        {
          channelId: createChannelResult.channelId,
          name: TEST_CHANNEL_NAME,
        }
      ]
    });

    expect(channelsListAllV1(channelCreatorId)).toStrictEqual({
      channels: [
        {
          channelId: createChannelResult.channelId,
          name: TEST_CHANNEL_NAME
        }
      ]
    });
  });

  test('create new channel name less than 1 return error', () => {
    const createChannelResult = channelsCreateV1(channelCreatorId, '', false) as error;

    expect(createChannelResult).toStrictEqual({
      error: 'name is not between 1 and 20 characters'
    });
  });

  test('create new channel name more than 20 return error', () => {
    const createChannelResult = channelsCreateV1(channelCreatorId, 'helloisitmeyoulookingforhelloagain', false) as error;

    expect(createChannelResult).toStrictEqual({
      error: 'name is not between 1 and 20 characters'
    });
  });

  test('create new channel creator is invalid return error', () => {
    const createChannelResult = channelsCreateV1(24092001, TEST_CHANNEL_NAME, false) as error;

    expect(createChannelResult).toStrictEqual({
      error: 'Invalid user ID'
    });
  });
});

describe('Test set for the function channelsList', () => {
  let channelId: number;

  beforeEach(() => {
    const createChannelResult = channelsCreateV1(channelCreatorId, TEST_CHANNEL_NAME, true) as channelId;
    channelId = createChannelResult.channelId;
  });

  test('channels list valid authUserId with channels returns list of channels', () => {
    const channelListResult = channelsListV1(channelCreatorId);

    expect(channelListResult).toStrictEqual({
      channels: [
        {
          channelId,
          name: TEST_CHANNEL_NAME
        }
      ]
    });
  });

  test('channels list valid authUserId with no channels returns empty list', () => {
    const registerSecondUser = authRegisterV1('53fads@gmail.com', '12312312', 'test', 'personlast') as authUserId;

    const channelListResult = channelsListV1(registerSecondUser.authUserId);

    expect(channelListResult).toStrictEqual({
      channels: []
    });
  });

  test('channels list invalid authUserId', () => {
    const channelListResult = channelsListV1(24092001);

    expect(channelListResult).toStrictEqual({
      error: 'authUserId is not valid'
    });
  });
});

describe('Test set for the function channelsListAllV1', () => {
  let channelId: number;

  beforeEach(() => {
    const createChannelResult = channelsCreateV1(channelCreatorId, TEST_CHANNEL_NAME, true) as channelId;
    channelId = createChannelResult.channelId;
  });

  test('channelsListAllV1 invalid authUserId', () => {
    expect(channelsListAllV1(24092001)).toStrictEqual({
      error: 'authUserId is not valid'
    });
  });

  test('channelsListAllV1 valid authUserId returns list of all channels', () => {
    const registerSecondUser = authRegisterV1('53fads@gmail.com', '12312312', 'test', 'personlast') as authUserId;
    const createChannelResult = channelsCreateV1(registerSecondUser.authUserId, 'test_channel2', true) as channelId;

    expect(channelsListAllV1(channelCreatorId)).toStrictEqual({
      channels: [
        {
          channelId: channelId,
          name: TEST_CHANNEL_NAME
        },
        {
          channelId: createChannelResult.channelId,
          name: 'test_channel2'
        }
      ]
    });
  });
});
