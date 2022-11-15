import { authResponse, channelMessagesOutput, dmId, messageId } from '../../src/types';
import { AUTH_REGISTER, clearDataForTest, DM_CREATE } from '../testBase';
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
  clearDataForTest();
  let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });

  let jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  token = jsonResponse.token;
  uIdTwo = jsonResponse.authUserId;

  res = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: 'gomugomu@hotmail.com',
    password: PASSWORD,
    nameFirst: 'monkey',
    nameLast: 'luffy'
  });

  jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  uId = jsonResponse.authUserId;
  tokenTwo = jsonResponse.token;

  res = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: 'gomugomu1@hotmail.com',
    password: PASSWORD,
    nameFirst: 'fake',
    nameLast: 'user'
  });

  jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  tokenThree = jsonResponse.token;
});

describe('HTTP tests for /dm/create', () => {
  test('Successful /dm/create', () => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId]
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      dmId: expect.any(Number)
    });
  });

  test('Successful /dm/create/v2 with only owner', () => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: []
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      dmId: expect.any(Number)
    });
  });

  test('Failure due to invalid uId', () => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId + 99123123199]
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Failure due to duplicate uId', () => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId, uId]
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Failure due to invalid tokens', () => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId]
    }, (token + 69));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for /dm/list', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId]
    }, token);

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('dm list successful', () => {
    const res = sendGetRequestToEndpoint('/dm/list/v2', {}, token);

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
    sendPostRequestToEndpoint(DM_CREATE, {
      uIds: []
    }, token);

    const res = sendGetRequestToEndpoint('/dm/list/v2', {}, token);

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
    const res = sendGetRequestToEndpoint('/dm/list/v2', {}, (token + 77));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for /dm/remove/v2', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId]
    }, token);

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('dm delete successful', () => {
    const res = sendDeleteRequestToEndpoint('/dm/remove/v2', {
      dmId: dmId
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('dm/remove with invalid token fail', () => {
    const res = sendDeleteRequestToEndpoint('/dm/remove/v2', {
      dmId: dmId
    }, (token + 4432));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm/remove with invalid dmId', () => {
    const res = sendDeleteRequestToEndpoint('/dm/remove/v2', {
      dmId: (dmId + 44)
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm/remove failure, user not owner of dm', () => {
    const res = sendDeleteRequestToEndpoint('/dm/remove/v2', {
      dmId: dmId
    }, tokenTwo);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm/remove failure, user not member of dm', () => {
    sendPostRequestToEndpoint('/dm/leave/v2', {
      dmId: dmId
    }, token);

    const res = sendDeleteRequestToEndpoint('/dm/remove/v2', {
      dmId: dmId
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for /dm/leave/v2', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId]
    }, token);

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('dm leave successful', () => {
    const res = sendPostRequestToEndpoint('/dm/leave/v2', {
      dmId: dmId
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('dm/leave with invalid token fail', () => {
    const res = sendPostRequestToEndpoint('/dm/leave/v2', {
      dmId: dmId
    }, (token + 99));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm/leave with invalid dmId', () => {
    const res = sendPostRequestToEndpoint('/dm/leave/v2', {
      dmId: (dmId + 104340)
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm/leave failure, user not part of dm', () => {
    const res = sendPostRequestToEndpoint('/dm/leave/v2', {
      dmId: dmId
    }, tokenThree);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for /dm/messages/v2', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId]
    }, token);

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('dm/messages successful', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v2', {
      dmId: dmId,
      start: 0
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('dm/messages with invalid token fail', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v2', {
      dmId: dmId,
      start: 0
    }, (token + 643535));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm/messages with invalid dmId', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v2', {
      dmId: (dmId + 104340),
      start: 0
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dm/messages failure, user not part of dm', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v2', {
      dmId: dmId,
      start: 0
    }, tokenThree);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('start is greater than the total number of messages in the dm', () => {
    const res = sendGetRequestToEndpoint('/dm/messages/v2', {
      dmId: dmId,
      start: 9999999999
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for message/senddm/v1', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId]
    }, token);

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });

  test('message/senddm with invalid dmId', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: (dmId + 104340),
      message: TEST_MESSAGE
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('length of message is less than 1 characters', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: dmId,
      message: ''
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('length of message is over 1000 characters', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: dmId,
      message: VERY_LONG_MESSAGE
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('failure, user not part of dm', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: dmId,
      message: TEST_MESSAGE
    }, tokenThree);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: dmId,
      message: TEST_MESSAGE,
    }, (token + 99999));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('correct input correct return', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: dmId,
      message: TEST_MESSAGE,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messageId: expect.any(Number)
    });
  });

  test('correct input correct message', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: dmId,
      message: TEST_MESSAGE,
    }, token);

    const messageId = (parseJsonResponse(res) as unknown as messageId).messageId;

    const res2 = sendGetRequestToEndpoint('/dm/messages/v2', {
      dmId: dmId,
      start: 0,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res2)).toStrictEqual({
      messages: [{ messageId: messageId, uId: uIdTwo, message: TEST_MESSAGE, timeSent: expect.any(Number) }],
      start: 0,
      end: -1
    });
  });

  test('correct input correct timeSent', () => {
    const res = sendPostRequestToEndpoint('/message/senddm/v2', {
      dmId: dmId,
      message: TEST_MESSAGE,
    }, token);

    const res2 = sendGetRequestToEndpoint('/dm/messages/v2', {
      dmId: dmId,
      start: 0,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect((parseJsonResponse(res2) as unknown as channelMessagesOutput).messages[0].timeSent).toBeLessThanOrEqual(Date.now() + 2);
  });
});
describe('HTTP tests for dm/details/v1', () => {
  let dmId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [uId]
    }, token);

    const jsonResponse = parseJsonResponse(res) as unknown as dmId;
    dmId = jsonResponse.dmId;
  });
  test('UserId is not a member of DM', () => {
    const res = sendGetRequestToEndpoint('/dm/details/v2', {
      dmId: dmId,
    }, tokenThree);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('user is not part of dm', () => {
    const res = sendGetRequestToEndpoint('/dm/details/v2', {
      dmId: 999999999999999
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('Invalid Token', () => {
    const res = sendGetRequestToEndpoint('/dm/details/v2', {
      dmId: dmId,
    }, (token + 99));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('valid dmDetails', () => {
    const res = sendGetRequestToEndpoint('/dm/details/v2', {
      dmId: dmId,
    }, token);

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
