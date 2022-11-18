import { authResponse, channelId, channelMessagesOutput, dmId, messageId /** user */ } from '../../src/types';
import { AUTH_REGISTER, CHANNELS_CREATE, CHANNEL_INVITE, CHANNEL_JOIN, CHANNEL_MESSAGES, clearDataForTest, DM_CREATE, DM_MESSGES, DM_SEND, MESSAGE_DM_SEND, MESSAGE_EDIT, MESSAGE_REACT, MESSAGE_REMOVE, MESSAGE_SEND, MESSAGE_SEND_LATER, MESSAGE_UNREACT } from '../testBase';
import {
  OK,
  parseJsonResponse,
  sendDeleteRequestToEndpoint,
  sendGetRequestToEndpoint,
  sendPostRequestToEndpoint,
  sendPutRequestToEndpoint
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';
const TEST_MESSAGE = 'hello world :)';
const TEST_MESSAGE_2 = 'hello world :(';

const TEST_INVALID_CHANNELID = '99999';

// over 1000 characters
let VERY_LONG_MESSAGE = ':(';
for (let i = 0; i < 1000; i++) VERY_LONG_MESSAGE = VERY_LONG_MESSAGE + ':(';

let token: string; // token of test user 1
let token2: string; // token of test user 2
let authUserId: number; // token of test user 1
let authUserId2: number; // token of test user 1

beforeEach(() => {
  clearDataForTest();
  const res1 = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });
  token = (parseJsonResponse(res1) as unknown as authResponse).token;
  authUserId = (parseJsonResponse(res1) as unknown as authResponse).authUserId;

  const res2 = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: '2' + EMAIL,
    password: '2' + PASSWORD,
    nameFirst: 'b' + NAME_FIRST,
    nameLast: 'b' + NAME_LAST
  });
  token2 = (parseJsonResponse(res2) as unknown as authResponse).token;
  authUserId2 = (parseJsonResponse(res2) as unknown as authResponse).authUserId;
});

describe('HTTP tests for message/send', () => {
  let channel1Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });

  test('channelId does not refer to a valid channel', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: TEST_INVALID_CHANNELID,
      message: TEST_MESSAGE,
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('length of message is less than 1 characters', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: channel1Id,
      message: '',
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('length of message is over 1000 characters', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: channel1Id,
      message: VERY_LONG_MESSAGE,
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
    }, token2);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
    }, 'bad token');

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('correct input correct return', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messageId: expect.any(Number)
    });
  });

  test('correct input correct message', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
    }, token);

    const messageId = (parseJsonResponse(res) as unknown as messageId).messageId;

    const res2 = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: channel1Id,
      start: 0,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res2)).toStrictEqual({
      messages: [
        {
          messageId: messageId,
          uId: authUserId,
          message: TEST_MESSAGE,
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('correct input correct timeSent', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
    }, token);

    const res2 = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: channel1Id,
      start: 0,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect((parseJsonResponse(res2) as unknown as channelMessagesOutput).messages[0].timeSent).toBeLessThanOrEqual(Date.now() + 2);
  });
});

describe('HTTP tests for message/sendlater', () => {
  let channel1Id: number;
  beforeEach(() => {
    jest.useFakeTimers();
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('channelId does not refer to a valid channel', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND_LATER, {
      channelId: TEST_INVALID_CHANNELID,
      message: TEST_MESSAGE,
      timeSent: Date.now() + 10
    }, token);

    expect(res.statusCode).toBe(400);
  });

  test('length of message is less than 1 characters', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND_LATER, {
      channelId: channel1Id,
      message: '',
      timeSent: Date.now() + 10
    }, token);

    expect(res.statusCode).toBe(400);
  });

  test('length of message is over 1000 characters', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND_LATER, {
      channelId: channel1Id,
      message: 'long'.repeat(1000),
      timeSent: Date.now() + 10
    }, token);

    expect(res.statusCode).toBe(400);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND_LATER, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
      timeSent: Date.now() + 10
    }, token2);

    expect(res.statusCode).toBe(403);
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND_LATER, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
      timeSent: Date.now() + 10
    }, 'bad token');

    expect(res.statusCode).toBe(403);
  });

  test('correct time sent is before throws error', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND_LATER, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
      timeSent: Date.now() - 1
    }, token);

    expect(res.statusCode).toBe(400);
  });

  test('messageSendLater success', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_SEND_LATER, {
      channelId: channel1Id,
      message: TEST_MESSAGE,
      timeSent: Date.now() + 10000
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messageId: expect.any(Number)
    });
  });
});

describe('HTTP tests for message/remove', () => {
  let testChannelId: number;
  let testMessageId: number;
  beforeEach(() => {
    const channel = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);
    testChannelId = (parseJsonResponse(channel) as unknown as channelId).channelId;

    const res2 = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: testChannelId,
      message: TEST_MESSAGE,
    }, token);
    testMessageId = (parseJsonResponse(res2) as unknown as messageId).messageId;
  });

  test('token is invalid', () => {
    const res = sendDeleteRequestToEndpoint(MESSAGE_REMOVE, {
      messageId: testMessageId
    }, 'badtoken');

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const res = sendDeleteRequestToEndpoint(MESSAGE_REMOVE, {
      messageId: testMessageId
    }, token2);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    const joinRes = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: testChannelId
    }, token2);

    expect(joinRes.statusCode).toBe(OK);

    const res = sendDeleteRequestToEndpoint(MESSAGE_REMOVE, {
      messageId: testMessageId
    }, token2);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('correct input correct return', () => {
    const res = sendDeleteRequestToEndpoint(MESSAGE_REMOVE, {
      messageId: testMessageId
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('correct input correct channel/message', () => {
    sendDeleteRequestToEndpoint(MESSAGE_REMOVE, {
      messageId: testMessageId
    }, token);

    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: testChannelId,
      start: 0,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });
});

describe('HTTP tests for message/edit', () => {
  let testChannelId: number;
  let testMessageId: number;
  beforeEach(() => {
    const channel = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);
    testChannelId = (parseJsonResponse(channel) as unknown as channelId).channelId;

    const res2 = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: testChannelId,
      message: TEST_MESSAGE,
    }, token);
    testMessageId = (parseJsonResponse(res2) as unknown as messageId).messageId;
  });

  test('length of message is over 1000 characters', () => {
    const res = sendPutRequestToEndpoint(MESSAGE_EDIT, {
      messageId: testMessageId,
      message: VERY_LONG_MESSAGE
    }, token);

    expect(res.statusCode).toBe(400);
  });

  test('length of message is less than 1 characters', () => {
    const res = sendPutRequestToEndpoint(MESSAGE_EDIT, {
      messageId: testMessageId,
      message: ''
    }, token);

    expect(res.statusCode).toBe(400);
  });

  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const res = sendPutRequestToEndpoint(MESSAGE_EDIT, {
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    }, token2);

    expect(res.statusCode).toBe(403);
  });

  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: testChannelId
    }, token2);

    const res = sendPutRequestToEndpoint(MESSAGE_EDIT, {
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    }, token2);

    expect(res.statusCode).toBe(403);
  });

  test('token is invalid', () => {
    const res = sendPutRequestToEndpoint(MESSAGE_EDIT, {
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    }, 'bnfsdaf bad toen');

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('correct input, correct return', () => {
    const res = sendPutRequestToEndpoint(MESSAGE_EDIT, {
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('correct input, correct message', () => {
    const res = sendPutRequestToEndpoint(MESSAGE_EDIT, {
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    }, token);

    const res2 = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: testChannelId,
      start: 0,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res2)).toStrictEqual({
      messages: [
        {
          messageId: testMessageId,
          uId: authUserId,
          message: TEST_MESSAGE_2,
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('correct input, correct message (dm)', () => {
    const dmRes = parseJsonResponse(sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [authUserId2]
    }, token)) as unknown as dmId;
    const dmId = dmRes.dmId;

    const senddmRes = parseJsonResponse(sendPostRequestToEndpoint(MESSAGE_DM_SEND, {
      dmId: dmId,
      message: TEST_MESSAGE,
    }, token)) as unknown as messageId;
    const msgId = senddmRes.messageId;

    const res = sendPutRequestToEndpoint(MESSAGE_EDIT, {
      messageId: msgId,
      message: TEST_MESSAGE_2
    }, token);

    const res2 = sendGetRequestToEndpoint(DM_MESSGES, {
      dmId: dmId,
      start: 0,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res2)).toStrictEqual({
      messages: [
        {
          messageId: msgId,
          uId: authUserId,
          message: TEST_MESSAGE_2,
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }],
      start: 0,
      end: -1,
    });
  });
});

describe('HTTP tests for message react', () => {
  const PUBLIC_USER_EMAIL = 'Bob123@gmail.com';
  const PUBLIC_USER_PASSWORD = '11223344';
  const PUBLIC_USER_NAME_FIRST = 'Barty';
  const PUBLIC_USER_NAME_LAST = 'Potter';

  const PRIVATE_USER_EMAIL = '1Bob123@gmail.com';
  const PRIVATE_USER_PASSWORD = '1122334dd4';
  const PRIVATE_USER_NAME_FIRST = 'Baoty';
  const PRIVATE_USER_NAME_LAST = 'Pottter';

  const GLOBAL_USER_EMAIL = '1Bobd123@gmail.com';
  const GLOBAL_USER_PASSWORD = '11223d34dd4';
  const GLOBAL_USER_NAME_FIRST = 'aBaoty';
  const GLOBAL_USER_NAME_LAST = 'Pottster';

  const PUBLIC_CHANNEL_NAME = 'Test public channel';
  // const PRIVATE_CHANNEL_NAME = 'Test private channel';

  let privateChannelCreatorToken: string;
  let publicChannelCreatorToken: string;
  let globalOwnerToken: string;
  let privateChannelCreatorUserId: number;
  let publicChannelCreatorUserId: number;
  let globalOwnerUserId: number;

  // let publicChannelCreatorHandle: string;
  // let privateChannelCreatorHandle: string;
  // let globalOwnerHandle: string;

  let publicChannelId: number;
  // let privateChannelId: number;

  let publicChannelMessageId: number;
  let dmMessageId: number;

  // let dmCreatorId: number;
  let dmCreatorToken: string;
  let testDmId: number;

  beforeEach(() => {
    clearDataForTest();

    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: GLOBAL_USER_EMAIL,
      password: GLOBAL_USER_PASSWORD,
      nameFirst: GLOBAL_USER_NAME_FIRST,
      nameLast: GLOBAL_USER_NAME_LAST
    });
    let jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    globalOwnerUserId = jsonResponse.authUserId;
    globalOwnerToken = jsonResponse.token;

    res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: PUBLIC_USER_EMAIL,
      password: PUBLIC_USER_PASSWORD,
      nameFirst: PUBLIC_USER_NAME_FIRST,
      nameLast: PUBLIC_USER_NAME_LAST
    });
    jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    publicChannelCreatorUserId = jsonResponse.authUserId;
    publicChannelCreatorToken = jsonResponse.token;

    res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: PRIVATE_USER_EMAIL,
      password: PRIVATE_USER_PASSWORD,
      nameFirst: PRIVATE_USER_NAME_FIRST,
      nameLast: PRIVATE_USER_NAME_LAST
    });
    jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    privateChannelCreatorUserId = jsonResponse.authUserId;
    privateChannelCreatorToken = jsonResponse.token;
    // dmCreatorId = privateChannelCreatorUserId;
    dmCreatorToken = privateChannelCreatorToken;

    // // let userProfile;
    // res = sendGetRequestToEndpoint(USER_PROFILE,
    //   { uId: publicChannelCreatorUserId }, publicChannelCreatorToken);
    // // userProfile = (parseJsonResponse(res) as unknown as user);
    // // publicChannelCreatorHandle = userProfile.user.handleStr;
    // res = sendGetRequestToEndpoint(USER_PROFILE,
    //   { uId: privateChannelCreatorUserId }, privateChannelCreatorToken);
    // // userProfile = (parseJsonResponse(res) as unknown as user);
    // // privateChannelCreatorHandle = userProfile.user.handleStr;
    // res = sendGetRequestToEndpoint(USER_PROFILE,
    //   { uId: globalOwnerUserId }, globalOwnerToken);
    // // userProfile = (parseJsonResponse(res) as unknown as user);
    // // globalOwnerHandle = userProfile.user.handleStr;

    // res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
    //   name: PRIVATE_CHANNEL_NAME,
    //   isPublic: false
    // }, privateChannelCreatorToken);
    // privateChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;
  });

  test('messageReact new react to channel message succeeds', () => {
    let res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true
    }, publicChannelCreatorToken);
    publicChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

    res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: publicChannelId,
      message: 'Hello channel'
    }, publicChannelCreatorToken);
    publicChannelMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(200);

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      privateChannelCreatorToken
    );
    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('messageReact new react to dm message succeeds', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;

    res = sendPostRequestToEndpoint(DM_SEND, {
      dmId: testDmId,
      message: 'Hello DM',
    }, dmCreatorToken);
    dmMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: dmMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('messageReact react to channel message with existing reacts succeeds', () => {
    let res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true
    }, publicChannelCreatorToken);
    publicChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

    res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: publicChannelId,
      message: 'Hello channel'
    }, publicChannelCreatorToken);
    publicChannelMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId
    }, publicChannelCreatorToken);
    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: globalOwnerUserId
    }, publicChannelCreatorToken);

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      globalOwnerToken
    );

    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('messageReact react to dm message with existing reacts succeeds', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;

    res = sendPostRequestToEndpoint(DM_SEND, {
      dmId: testDmId,
      message: 'Hello DM',
    }, dmCreatorToken);
    dmMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: dmMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: dmMessageId, reactId: 1 },
      publicChannelCreatorToken
    );

    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('messageReact user already reacted to channel message throws error', () => {
    let res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true
    }, publicChannelCreatorToken);
    publicChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

    res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: publicChannelId,
      message: 'Hello channel'
    }, publicChannelCreatorToken);
    publicChannelMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId
    }, publicChannelCreatorToken);

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    expect(res.statusCode).toBe(400);
  });

  test('messageReact user already reacted to dm message throws error', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;

    res = sendPostRequestToEndpoint(DM_SEND, {
      dmId: testDmId,
      message: 'Hello DM',
    }, dmCreatorToken);
    dmMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: dmMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: dmMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    expect(res.statusCode).toBe(400);
  });

  test('messageReact invalid react ID throws error', () => {
    let res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true
    }, publicChannelCreatorToken);
    publicChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

    res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: publicChannelId,
      message: 'Hello channel'
    }, publicChannelCreatorToken);
    publicChannelMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId
    }, publicChannelCreatorToken);

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 323 },
      privateChannelCreatorToken
    );
    expect(res.statusCode).toBe(400);
  });

  test('messageReact invalid token throws forbidden', () => {
    let res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true
    }, publicChannelCreatorToken);
    publicChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

    res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: publicChannelId,
      message: 'Hello channel'
    }, publicChannelCreatorToken);
    publicChannelMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      '12312312'
    );
    expect(res.statusCode).toBe(403);
  });

  test('messageReact user not a member in channel throws error', () => {
    let res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true
    }, publicChannelCreatorToken);
    publicChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

    res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: publicChannelId,
      message: 'Hello channel'
    }, publicChannelCreatorToken);
    publicChannelMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId
    }, publicChannelCreatorToken);

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      globalOwnerToken
    );
    expect(res.statusCode).toBe(400);
  });

  test('messageReact user not a member in dm throws error', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;

    res = sendPostRequestToEndpoint(DM_SEND, {
      dmId: testDmId,
      message: 'Hello DM',
    }, dmCreatorToken);
    dmMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId
    }, publicChannelCreatorToken);

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: dmMessageId, reactId: 1 },
      globalOwnerToken
    );
    expect(res.statusCode).toBe(400);
  });
});

describe('HTTP tests for message unreact', () => {
  const PUBLIC_USER_EMAIL = 'Bob123@gmail.com';
  const PUBLIC_USER_PASSWORD = '11223344';
  const PUBLIC_USER_NAME_FIRST = 'Barty';
  const PUBLIC_USER_NAME_LAST = 'Potter';

  const PRIVATE_USER_EMAIL = '1Bob123@gmail.com';
  const PRIVATE_USER_PASSWORD = '1122334dd4';
  const PRIVATE_USER_NAME_FIRST = 'Baoty';
  const PRIVATE_USER_NAME_LAST = 'Pottter';

  const GLOBAL_USER_EMAIL = '1Bobd123@gmail.com';
  const GLOBAL_USER_PASSWORD = '11223d34dd4';
  const GLOBAL_USER_NAME_FIRST = 'aBaoty';
  const GLOBAL_USER_NAME_LAST = 'Pottster';

  const PUBLIC_CHANNEL_NAME = 'Test public channel';

  let privateChannelCreatorToken: string;
  let publicChannelCreatorToken: string;
  let privateChannelCreatorUserId: number;
  let publicChannelCreatorUserId: number;

  let publicChannelId: number;

  let publicChannelMessageId: number;
  let dmMessageId: number;
  let dmCreatorToken: string;
  let testDmId: number;

  beforeEach(() => {
    clearDataForTest();

    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: GLOBAL_USER_EMAIL,
      password: GLOBAL_USER_PASSWORD,
      nameFirst: GLOBAL_USER_NAME_FIRST,
      nameLast: GLOBAL_USER_NAME_LAST
    });
    let jsonResponse = (parseJsonResponse(res) as unknown as authResponse);

    res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: PUBLIC_USER_EMAIL,
      password: PUBLIC_USER_PASSWORD,
      nameFirst: PUBLIC_USER_NAME_FIRST,
      nameLast: PUBLIC_USER_NAME_LAST
    });
    jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    publicChannelCreatorUserId = jsonResponse.authUserId;
    publicChannelCreatorToken = jsonResponse.token;

    res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: PRIVATE_USER_EMAIL,
      password: PRIVATE_USER_PASSWORD,
      nameFirst: PRIVATE_USER_NAME_FIRST,
      nameLast: PRIVATE_USER_NAME_LAST
    });
    jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    privateChannelCreatorUserId = jsonResponse.authUserId;
    privateChannelCreatorToken = jsonResponse.token;
    dmCreatorToken = privateChannelCreatorToken;
  });

  test('messageUnreact unreact to channel message succeeds', () => {
    let res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true
    }, publicChannelCreatorToken);
    publicChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

    res = sendPostRequestToEndpoint(MESSAGE_SEND, {
      channelId: publicChannelId,
      message: 'Hello channel'
    }, publicChannelCreatorToken);
    publicChannelMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(200);

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    res = sendPostRequestToEndpoint(MESSAGE_UNREACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('messageUnreact unreact to dm message succeeds', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;

    res = sendPostRequestToEndpoint(DM_SEND, {
      dmId: testDmId,
      message: 'Hello DM',
    }, dmCreatorToken);
    dmMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: dmMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    res = sendPostRequestToEndpoint(MESSAGE_UNREACT,
      { messageId: dmMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('messageUnreact invalid message ID throws error', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;

    res = sendPostRequestToEndpoint(DM_SEND, {
      dmId: testDmId,
      message: 'Hello DM',
    }, dmCreatorToken);
    dmMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(MESSAGE_UNREACT,
      { messageId: 999999, reactId: 1 },
      dmCreatorToken
    );

    expect(res.statusCode).toBe(400);
  });

  test('messageUnreact unreact with invalid react ID throws error', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_UNREACT,
      { messageId: 1235, reactId: 13 },
      publicChannelCreatorToken
    );

    expect(res.statusCode).toBe(400);
  });

  test('messageUnreact invalid auth token throws forbidden', () => {
    const res = sendPostRequestToEndpoint(MESSAGE_UNREACT,
      { messageId: 1235, reactId: 1 },
      'bad token'
    );

    expect(res.statusCode).toBe(403);
  });

  test('messageUnreact user no reaction', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;

    res = sendPostRequestToEndpoint(DM_SEND, {
      dmId: testDmId,
      message: 'Hello DM',
    }, dmCreatorToken);
    dmMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;

    res = sendPostRequestToEndpoint(MESSAGE_UNREACT,
      { messageId: dmMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    expect(res.statusCode).toBe(400);
  });
});
