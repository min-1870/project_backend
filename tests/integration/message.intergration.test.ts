import { authResponse, channelId, channelMessagesOutput, dmId, messageId } from '../../src/types';
import { AUTH_REGISTER, CHANNEL_MESSAGES, DM_CREATE, DM_MESSGES, MESSAGE_DM_SEND, MESSAGE_EDIT, MESSAGE_REMOVE, MESSAGE_SEND } from '../testBase';
import {
  OK,
  parseJsonResponse,
  sendDeleteRequestToEndpoint,
  sendGetRequestToEndpoint,
  sendPostRequestToEndpoint,
  sendPutRequestToEndpoint
} from './integrationTestUtils';

const CHANNELS_CREATE = '/channels/create/v3';
const CHANNEL_JOIN = '/channel/join/v3';

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
  sendDeleteRequestToEndpoint('/clear/v1', {});
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
      messages: [{ messageId: messageId, uId: authUserId, message: TEST_MESSAGE, timeSent: expect.any(Number) }],
      start: 0,
      end: -1
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
    expect(res.statusCode).toBe(400);
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
      messages: [{ messageId: testMessageId, uId: authUserId, message: TEST_MESSAGE_2, timeSent: expect.any(Number) }],
      start: 0,
      end: -1
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
      messages: [{ messageId: msgId, uId: authUserId, message: TEST_MESSAGE_2, timeSent: expect.any(Number) }],
      start: 0,
      end: -1
    });
  });
});
