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

describe('HTTP tests for channel/messages/v2', () => {
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
      channelId: 9999999,
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
      token: '999999',
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
