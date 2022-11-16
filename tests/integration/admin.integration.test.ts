import { authResponse } from '../../src/types';
import { ADMIN_USER_PERMISSION_CHANGE, ADMIN_USER_REMOVE, AUTH_REGISTER, CHANNELS_CREATE, clearDataForTest } from '../testBase';
import { OK, parseJsonResponse, sendDeleteRequestToEndpoint, sendPostRequestToEndpoint } from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';

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

describe('HTTP tests for admin/user/remove/v1', () => {
  // let channel1Id: number;
  beforeEach(() => {
    sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);
    // channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });
  test('invalid uID', () => {
    const res = sendDeleteRequestToEndpoint(ADMIN_USER_REMOVE, {
      uId: 99999999,
    }, token);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'uId is not valid'
      }
    });
  });
  test('uId is only global owner', () => {
    const res = sendDeleteRequestToEndpoint(ADMIN_USER_REMOVE, {
      uId: authUserId,
    }, token);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'uId is only global owner'
      }
    });
  });

  test('token is not global owner', () => {
    const res = sendDeleteRequestToEndpoint(ADMIN_USER_REMOVE, {
      uId: authUserId2,
    }, token2);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'authorised user is not global owner'
      }
    });
  });
  test('token is not valid', () => {
    const res = sendDeleteRequestToEndpoint(ADMIN_USER_REMOVE, {
      uId: authUserId2,
    }, '999999');

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'Invalid token.'
      }
    });
  });
  test('successful', () => {
    const res = sendDeleteRequestToEndpoint(ADMIN_USER_REMOVE, {
      uId: authUserId2,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});


describe('HTTP tests for admin/userpermission/change/v1', () => {
  // let channel1Id: number;
  beforeEach(() => {
    sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);
    // channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });
  test('invalid uID', () => {
    const res = sendPostRequestToEndpoint(ADMIN_USER_PERMISSION_CHANGE, {
      uId: 99999999,
      permissionId: 1
    }, token);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'uId is not valid'
      }
    });
  });
  test('uId is only global owner', () => {
    const res = sendPostRequestToEndpoint(ADMIN_USER_PERMISSION_CHANGE, {
      uId: authUserId,
      permissionId: 1
    }, token);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'uId is only global owner'
      }
    });
  });

  test('token is not global owner', () => {
    const res = sendPostRequestToEndpoint(ADMIN_USER_PERMISSION_CHANGE, {
      uId: authUserId2,
      permissionId: 1
    }, token2);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'authorised user is not global owner'
      }
    });
  });
  test('token is not valid', () => {
    const res = sendPostRequestToEndpoint(ADMIN_USER_PERMISSION_CHANGE, {
      uId: authUserId2,
      permissionId: 1
    }, '999999');

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'Invalid token.'
      }
    });
  });

  test('invalid permission id', () => {
    const res = sendPostRequestToEndpoint(ADMIN_USER_PERMISSION_CHANGE, {
      uId: authUserId2,
      permissionId: 3
    }, token);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: 'invalid permission id'
      }
    });
  });

  test('successful', () => {
    const res = sendPostRequestToEndpoint(ADMIN_USER_PERMISSION_CHANGE, {
      uId: authUserId2,
      permissionId: 1
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});