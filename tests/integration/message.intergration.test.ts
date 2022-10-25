import { authResponse, channelId, channelMessagesOutput, messageId } from '../../src/types';
import {
  OK,
  parseJsonResponse,
  sendDeleteRequestToEndpoint,
  sendGetRequestToEndpoint,
  sendPostRequestToEndpoint
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';
const TEST_MESSAGE = 'hello world :)';

const TEST_INVALID_TOKEN = '999999999999';
const TEST_INVALID_CHANNELID = '999999999999';

// over 1000 characters
let VERY_LONG_MESSAGE = ':(';
for (let i = 0; i < 1000; i++) VERY_LONG_MESSAGE = VERY_LONG_MESSAGE + ':(';

let token: string; // token of test user 1
let token2: string; // token of test user 2
let authUserId: number; // token of test user 1
// let authUserId2: number; // token of test user 2

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
  const res1 = sendPostRequestToEndpoint('/auth/register/v2', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });
  token = (parseJsonResponse(res1) as unknown as authResponse).token;
  authUserId = (parseJsonResponse(res1) as unknown as authResponse).authUserId;

  const res2 = sendPostRequestToEndpoint('/auth/register/v2', {
    email: '2' + EMAIL,
    password: '2' + PASSWORD,
    nameFirst: 'b' + NAME_FIRST,
    nameLast: 'b' + NAME_LAST
  });
  token2 = (parseJsonResponse(res2) as unknown as authResponse).token;
  // authUserId2 = (parseJsonResponse(res2) as unknown as authResponse).authUserId;
});

describe('HTTP tests for message/send/v1', () => {
  let channel1Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint('/channels/create/v2', {
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

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'channelId does not refer to a valid channel'
    });
  });

  test('length of message is less than 1 characters', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: channel1Id,
      message: '',
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'length of message is less than 1 or over 1000 characters'
    });
  });

  test('length of message is over 1000 characters', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token,
      channelId: channel1Id,
      message: VERY_LONG_MESSAGE,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'length of message is less than 1 or over 1000 characters'
    });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: token2,
      channelId: channel1Id,
      message: TEST_MESSAGE,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'channelId is valid and the authorised user is not a member of the channel'
    });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint('/message/send/v1', {
      token: TEST_INVALID_TOKEN,
      channelId: channel1Id,
      message: TEST_MESSAGE,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'token is invalid'
    });
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
    const channel = sendPostRequestToEndpoint('/channels/create/v2', {
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

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'token is invalid'
    });
  });

  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const res = sendDeleteRequestToEndpoint('/message/remove/v1', {
      token: token2,
      messageId: testMessageId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'
    });
  });

  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    sendPostRequestToEndpoint('/channel/join/v2', {
      token: token2,
      channelId: testChannelId
    });
    
    const res = sendDeleteRequestToEndpoint('/message/remove/v1', {
      token: token2,
      messageId: testMessageId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM'
    });
  });

  test('correct input correct return', () => {
    const res = sendDeleteRequestToEndpoint('/message/remove/v1', {
      token: token,
      messageId: testMessageId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('correct input correct channel/message', () => {
    sendDeleteRequestToEndpoint('/message/remove/v1', {
      token: token,
      messageId: testMessageId
    });

    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token,
      channelId: testChannelId,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });
});