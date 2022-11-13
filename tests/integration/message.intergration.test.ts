import { authResponse, channelId, channelMessagesOutput, dmId, messageId } from '../../src/types';
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

const TEST_INVALID_TOKEN = '999999';
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
  const res1 = sendPostRequestToEndpoint('/auth/register/v3', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });
  token = (parseJsonResponse(res1) as unknown as authResponse).token;
  authUserId = (parseJsonResponse(res1) as unknown as authResponse).authUserId;

  const res2 = sendPostRequestToEndpoint('/auth/register/v3', {
    email: '2' + EMAIL,
    password: '2' + PASSWORD,
    nameFirst: 'b' + NAME_FIRST,
    nameLast: 'b' + NAME_LAST
  });
  token2 = (parseJsonResponse(res2) as unknown as authResponse).token;
  authUserId2 = (parseJsonResponse(res2) as unknown as authResponse).authUserId;
});

describe('HTTP tests for message/send/v1', () => {
  let channel1Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });

  test('channelId does not refer to a valid channel', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: TEST_INVALID_CHANNELID,
      message: TEST_MESSAGE,
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('length of message is less than 1 characters', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: channel1Id,
      message: '',
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('length of message is over 1000 characters', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: channel1Id,
      message: VERY_LONG_MESSAGE,
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token2,
      channelId: channel1Id,
      message: TEST_MESSAGE,
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: TEST_INVALID_TOKEN,
      channelId: channel1Id,
      message: TEST_MESSAGE,
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('correct input correct return', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: channel1Id,
      message: TEST_MESSAGE,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messageId: expect.any(Number)
    });
  });

  test('correct input correct message', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: channel1Id,
      message: TEST_MESSAGE,
    });

    const messageId = (parseJsonResponse(res) as unknown as messageId).messageId;

    const res2 = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token,
      channelId: channel1Id,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res2)).toStrictEqual({
      messages: [{ messageId: messageId, uId: authUserId, message: TEST_MESSAGE, timeSent: expect.any(Number) }],
      start: 0,
      end: -1
    });
  });

  test('correct input correct timeSent', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: channel1Id,
      message: TEST_MESSAGE,
    });

    const res2 = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token,
      channelId: channel1Id,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect((parseJsonResponse(res2) as unknown as channelMessagesOutput).messages[0].timeSent).toBeLessThanOrEqual(Date.now() + 2);
  });
});

describe('HTTP tests for message/remove/v1', () => {
  let testChannelId: number;
  let testMessageId: number;
  beforeEach(() => {
    const channel = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    testChannelId = (parseJsonResponse(channel) as unknown as channelId).channelId;

    const res2 = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: testChannelId,
      message: TEST_MESSAGE,
    });
    testMessageId = (parseJsonResponse(res2) as unknown as messageId).messageId;
  });

  test('token is invalid', () => {
    const res = sendDeleteRequestToEndpoint('/message/remove/v1', {
      token: TEST_INVALID_TOKEN,
      messageId: testMessageId
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const res = sendDeleteRequestToEndpoint('/message/remove/v1', {
      token: token2,
      messageId: testMessageId
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    const joinRes = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: token2,
      channelId: testChannelId
    });

    expect(joinRes.statusCode).toBe(OK);

    const res = sendDeleteRequestToEndpoint('/message/remove/v1', {
      token: token2,
      messageId: testMessageId
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('correct input correct return', () => {
    const res = sendDeleteRequestToEndpoint('/message/remove/v1', {
      token,
      messageId: testMessageId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  // test('correct input correct channel/message', () => {
  //   sendDeleteRequestToEndpoint('/message/remove/v1', {
  //     token: token,
  //     messageId: testMessageId
  //   });

  //   const res = sendGetRequestToEndpoint('/channel/messages/v2', {
  //     token: token,
  //     channelId: testChannelId,
  //     start: 0,
  //   });

  //   expect(res.statusCode).toBe(OK);
  //   expect(parseJsonResponse(res)).toStrictEqual({
  //     messages: [],
  //     start: 0,
  //     end: -1
  //   });
  // });
});

describe('HTTP tests for message/edit/v1', () => {
  let testChannelId: number;
  let testMessageId: number;
  beforeEach(() => {
    const channel = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    testChannelId = (parseJsonResponse(channel) as unknown as channelId).channelId;

    const res2 = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: testChannelId,
      message: TEST_MESSAGE,
    });
    testMessageId = (parseJsonResponse(res2) as unknown as messageId).messageId;
  });

  test('length of message is over 1000 characters', () => {
    const res = sendPutRequestToEndpoint('/message/edit/v1', {
      token: token,
      messageId: testMessageId,
      message: VERY_LONG_MESSAGE
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'length of message is less than 1 or over 1000 characters'
    });
  });

  test('length of message is less than 1 characters', () => {
    const res = sendPutRequestToEndpoint('/message/edit/v1', {
      token: token,
      messageId: testMessageId,
      message: ''
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'length of message is less than 1 or over 1000 characters'
    });
  });

  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const res = sendPutRequestToEndpoint('/message/edit/v1', {
      token: token2,
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'
    });
  });

  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: token2,
      channelId: testChannelId
    });

    const res = sendPutRequestToEndpoint('/message/edit/v1', {
      token: token2,
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM'
    });
  });

  test('token is invalid', () => {
    const res = sendPutRequestToEndpoint('/message/edit/v1', {
      token: TEST_INVALID_TOKEN,
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('correct input, correct return', () => {
    const res = sendPutRequestToEndpoint('/message/edit/v1', {
      token: token,
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('correct input, correct message', () => {
    const res = sendPutRequestToEndpoint('/message/edit/v1', {
      token: token,
      messageId: testMessageId,
      message: TEST_MESSAGE_2
    });

    const res2 = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token,
      channelId: testChannelId,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res2)).toStrictEqual({
      messages: [{ messageId: testMessageId, uId: authUserId, message: TEST_MESSAGE_2, timeSent: expect.any(Number) }],
      start: 0,
      end: -1
    });
  });

  test('correct input, correct message (dm)', () => {
    const dmRes = parseJsonResponse(sendPostRequestToEndpoint('/dm/create/v2', {
      uIds: [authUserId2]
    }, token)) as unknown as dmId;
    const dmId = dmRes.dmId;

    const senddmRes = parseJsonResponse(sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: dmId,
      message: TEST_MESSAGE,
    }, token)) as unknown as messageId;
    const msgId = senddmRes.messageId;

    const res = sendPutRequestToEndpoint('/message/edit/v1', {
      token: token,
      messageId: msgId,
      message: TEST_MESSAGE_2
    });

    const res2 = sendGetRequestToEndpoint('/dm/messages/v2', {
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
