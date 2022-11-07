import { authResponse, channelMessagesOutput, dmId, messageId } from '../../src/types';
import {
  parseJsonResponse,
  OK,
  sendDeleteRequestToEndpoint,
  sendPostRequestToEndpoint,
  sendGetRequestToEndpoint,
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';

let token: string;
let tokenTwo: string;
let tokenThree: string;
let uId: number;
let uIdTwo: number;

const TEST_MESSAGE = 'hello world :)';
// over 1000 characters
let VERY_LONG_MESSAGE = ':(';
for (let i = 0; i < 1000; i++) VERY_LONG_MESSAGE = VERY_LONG_MESSAGE + ':(';

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
  let res = sendPostRequestToEndpoint('/auth/register/v2', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });

  let jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  token = jsonResponse.token;
  uIdTwo = jsonResponse.authUserId;

  res = sendPostRequestToEndpoint('/auth/register/v2', {
    email: 'gomugomu@hotmail.com',
    password: PASSWORD,
    nameFirst: 'monkey',
    nameLast: 'luffy'
  });

  jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  uId = jsonResponse.authUserId;
  tokenTwo = jsonResponse.token;

  res = sendPostRequestToEndpoint('/auth/register/v2', {
    email: 'gomugomu1@hotmail.com',
    password: PASSWORD,
    nameFirst: 'fake',
    nameLast: 'user'
  });

  jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  tokenThree = jsonResponse.token;
});

describe('HTTP tests for /dm/create/v1', () => {
  test('Successful /dm/create/v1', () => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId]
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      dmId: expect.any(Number)
    });
  });

  test('Successful /dm/create/v1 with only owner', () => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: []
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      dmId: expect.any(Number)
    });
  });

  test('Failure due to invalid uId', () => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId + 9999]
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid uId in uIds'
    });
  });

  test('Failure due to duplicate uId', () => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId, uId]
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Duplicate uId values entered'
    });
  });

  test('Failure due to invalid tokens', () => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: (token + 999),
      uIds: [uId]
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Token is Invalid'
    });
  });
});

describe('HTTP tests for /dm/list/v1', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId]
    });

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('dm list successful', () => {
    const res = sendGetRequestToEndpoint('/dm/list/v1', {
      token
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      dms: [
        {
          dmId,
          name: expect.any(String)
        }
      ]
    });
  });

  test('dm list successful with multiple lists', () => {
    sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: []
    });

    const res = sendGetRequestToEndpoint('/dm/list/v1', {
      token
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      dms: [
        {
          dmId: expect.any(Number),
          name: expect.any(String)
        },
        {
          dmId: expect.any(Number),
          name: expect.any(String)
        }
      ]
    });
  });

  test('dm list with invalid token fail', () => {
    const res = sendGetRequestToEndpoint('/dm/list/v1', {
      token: (token + 643535)
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Token is Invalid'
    });
  });
});

describe('HTTP tests for /dm/remove/v1', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId]
    });

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('dm delete successful', () => {
    const res = sendDeleteRequestToEndpoint('/dm/remove/v1', {
      token: token,
      dmId: dmId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('dm/remove with invalid token fail', () => {
    const res = sendDeleteRequestToEndpoint('/dm/remove/v1', {
      token: (token + 643535),
      dmId: dmId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Token is Invalid'
    });
  });

  test('dm/remove with invalid dmId', () => {
    const res = sendDeleteRequestToEndpoint('/dm/remove/v1', {
      token: token,
      dmId: (dmId + 104340)
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'dmId is Invalid'
    });
  });

  test('dm/remove failure, user not owner of dm', () => {
    const res = sendDeleteRequestToEndpoint('/dm/remove/v1', {
      token: tokenTwo,
      dmId: dmId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'user is not owner of dm'
    });
  });

  test('dm/remove failure, user not member of dm', () => {
    sendPostRequestToEndpoint('/dm/leave/v1', {
      token: token,
      dmId: dmId
    });

    const res = sendDeleteRequestToEndpoint('/dm/remove/v1', {
      token: token,
      dmId: dmId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'user is not part of dm'
    });
  });
});

describe('HTTP tests for /dm/leave/v1', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId]
    });

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('dm leave successful', () => {
    const res = sendPostRequestToEndpoint('/dm/leave/v1', {
      token: token,
      dmId: dmId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('dm/leave with invalid token fail', () => {
    const res = sendPostRequestToEndpoint('/dm/leave/v1', {
      token: (token + 643535),
      dmId: dmId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Token is Invalid'
    });
  });

  test('dm/leave with invalid dmId', () => {
    const res = sendPostRequestToEndpoint('/dm/leave/v1', {
      token: token,
      dmId: (dmId + 104340)
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'dmId is Invalid'
    });
  });

  test('dm/leave failure, user not part of dm', () => {
    const res = sendPostRequestToEndpoint('/dm/leave/v1', {
      token: tokenThree,
      dmId: dmId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'user is not part of dm'
    });
  });
});

describe('HTTP tests for /dm/messages/v1', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId]
    });

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('dm/messages successful', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v1', {
      token: token,
      dmId: dmId,
      start: 0
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('dm/messages with invalid token fail', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v1', {
      token: (token + 643535),
      dmId: dmId,
      start: 0
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Token is Invalid'
    });
  });

  test('dm/messages with invalid dmId', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v1', {
      token: token,
      dmId: (dmId + 104340),
      start: 0
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'dmId is Invalid'
    });
  });

  test('dm/messages failure, user not part of dm', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v1', {
      token: tokenThree,
      dmId: dmId,
      start: 0
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'user is not part of dm'
    });
  });

  test('start is greater than the total number of messages in the dm', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v1', {
      token: token,
      dmId: dmId,
      start: 9999999999
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid start'
    });
  });
});

describe('HTTP tests for message/senddm/v1', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId]
    });

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('message/senddm with invalid dmId', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v1', {
      token: token,
      dmId: (dmId + 104340),
      message: TEST_MESSAGE
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'dmId is Invalid'
    });
  });

  test('length of message is less than 1 characters', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v1', {
      token: token,
      dmId: dmId,
      message: ''
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'length of message is less than 1 or over 1000 characters'
    });
  });

  test('length of message is over 1000 characters', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v1', {
      token: token,
      dmId: dmId,
      message: VERY_LONG_MESSAGE
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'length of message is less than 1 or over 1000 characters'
    });
  });

  test('failure, user not part of dm', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v1', {
      token: tokenThree,
      dmId: dmId,
      message: TEST_MESSAGE
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'user is not part of dm'
    });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v1', {
      token: (token + 999999),
      dmId: dmId,
      message: TEST_MESSAGE,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Token is Invalid'
    });
  });

  test('correct input correct return', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v1', {
      token: token,
      dmId: dmId,
      message: TEST_MESSAGE,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messageId: expect.any(Number)
    });
  });

  test('correct input correct message', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v1', {
      token: token,
      dmId: dmId,
      message: TEST_MESSAGE,
    });

    const messageId = (parseJsonResponse(res) as unknown as messageId).messageId;

    const res2 = sendGetRequestToEndpoint('/dm/messages/v1', {
      token: token,
      dmId: dmId,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res2)).toStrictEqual({
      messages: [{ messageId: messageId, uId: uIdTwo, message: TEST_MESSAGE, timeSent: expect.any(Number) }],
      start: 0,
      end: -1
    });
  });

  test('correct input correct timeSent', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v1', {
      token: token,
      dmId: dmId,
      message: TEST_MESSAGE,
    });

    const res2 = sendGetRequestToEndpoint('/dm/messages/v1', {
      token: token,
      dmId: dmId,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect((parseJsonResponse(res2) as unknown as channelMessagesOutput).messages[0].timeSent).toBeLessThanOrEqual(Date.now() + 2);
  });
});
describe('HTTP tests for dm/details/v1', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId]
    });

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });
  test('UserId is not a member of DM', () => {
    const res = sendGetRequestToEndpoint('/dm/details/v1', {
      token: tokenThree,
      dmId: dmId,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'user is not part of dm'
    });
  });
  test('user is not part of dm', () => {
    const res = sendGetRequestToEndpoint('/dm/details/v1', {
      token: token,
      dmId: 999999999999999
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'dmId is Invalid'
    });
  });
  test('Invalid Token', () => {
    const res = sendGetRequestToEndpoint('/dm/details/v1', {
      token: '99999999',
      dmId: dmId,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Token is Invalid'
    });
  });
  test('valid dmDetails', () => {
    const res = sendGetRequestToEndpoint('/dm/details/v1', {
      token: token,
      dmId: dmId,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      name: 'bartypotter, monkeyluffy',
      members: [{
        email: 'Bob123@gmail.com',
        handleStr: 'bartypotter',
        nameFirst: 'Barty',
        nameLast: 'Potter',
        uId: uIdTwo
      },
      {
        email: 'gomugomu@hotmail.com',
        handleStr: 'monkeyluffy',
        nameFirst: 'monkey',
        nameLast: 'luffy',
        uId: uId
      }],
    });
  });
});
