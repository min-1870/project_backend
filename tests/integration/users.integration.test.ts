import { authResponse } from '../../src/types';
import {
  parseJsonResponse,
  OK,
  sendGetRequestToEndpoint,
  sendDeleteRequestToEndpoint,
  sendPostRequestToEndpoint,
  sendPutRequestToEndpoint,
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';

let token: string;
let uId: number;
let uIdTwo: number;

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
  let res = sendPostRequestToEndpoint('/auth/register/v3', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });

  let jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  token = jsonResponse.token;
  uIdTwo = jsonResponse.authUserId;

  res = sendPostRequestToEndpoint('/auth/register/v3', {
    email: 'gomugomu@hotmail.com',
    password: PASSWORD,
    nameFirst: 'monkey',
    nameLast: 'luffy'
  });

  jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  uId = jsonResponse.authUserId;
});

describe('HTTP tests for /user/profile/v3', () => {
  // happy path
  test('Successful /user/profile/v3', () => {
    const res = sendGetRequestToEndpoint('/user/profile/v3', {
      uId: uId
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      user: {
        uId: uId,
        email: 'gomugomu@hotmail.com',
        nameFirst: 'monkey',
        nameLast: 'luffy',
        handleStr: 'monkeyluffy'
      }
    });
  });

  test('error passing invalid uId', () => {
    const res = sendGetRequestToEndpoint('/user/profile/v3', {
      uId: (uId + 12133)
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'uId is not valid' });
  });

  test('error passing invalid token', () => {
    const res = sendGetRequestToEndpoint('/user/profile/v3', {
      uId: uId
    }, (token + 69));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: 'invalid token' });
  });
});

describe('HTTP tests for /user/profile/sethandle/v1', () => {
  test('Failed due to invalid handleStr (length < 3)', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v1', {
      token: token,
      handleStr: 'ha'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Failed due to invalid handleStr (length > 20)', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v1', {
      token: token,
      handleStr: 'hahahahahahahahahahahahahahahahahahahaahahaha'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Failed due to invalid characters in handleStr', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v1', {
      token: token,
      handleStr: "ha'w'e<?*"
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Failed due to handleStr already in use', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v1', {
      token: token,
      handleStr: 'monkeyluffy'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Failed due to token invalid', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v1', {
      token: (token + 443),
      handleStr: 'monkeydamnluffy'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Successful implementation of user/profile/sethandle/v1', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v1', {
      token: token,
      handleStr: 'monkeydamnluffy'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('Tests for /user/profile/setemail/v1', () => {
  test('Successful update of email', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setemail/v1', {
      token: token,
      email: 'gomugomu1@hotmail.com'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Email is invalid', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setemail/v1', {
      token: token,
      email: 'notanemail'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Email is already in use', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setemail/v1', {
      token: token,
      email: 'gomugomu@hotmail.com'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Token is invalid', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setemail/v1', {
      token: (token + 443),
      email: 'gomugomu@hotmail.com'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});

describe('Tests for /user/profile/setname/v1', () => {
  test('Successful update of first and last name', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v1', {
      token: token,
      nameFirst: 'Steve',
      nameLast: 'Man'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
  test('First name too long', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v1', {
      token: token,
      nameFirst: 'Steveveveveveveveveveveveveveveveveveveveveveveveveveveve',
      nameLast: 'Man'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Last name too long', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v1', {
      token: token,
      nameFirst: 'Steve',
      nameLast: 'Manananananananananananananananananananananananananananananananananananananananan'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('First name too short', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v1', {
      token: token,
      nameFirst: '',
      nameLast: 'Man'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Last name too short', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v1', {
      token: token,
      nameFirst: 'Steve',
      nameLast: ''
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});

describe('Tests for /users/all/v2', () => {
  test('token is invalid', () => {
    const res = sendGetRequestToEndpoint('/users/all/v2', {
    }, (token + 999));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: 'Invalid token' });
  });
  test('A list of all users and their associated details is successfully returned.', () => {
    const res = sendGetRequestToEndpoint('/users/all/v2', {
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      users: [{
        uId: uIdTwo,
        email: 'Bob123@gmail.com',
        nameFirst: 'Barty',
        nameLast: 'Potter',
        handleStr: 'bartypotter'
      },
      {
        uId: uId,
        email: 'gomugomu@hotmail.com',
        nameFirst: 'monkey',
        nameLast: 'luffy',
        handleStr: 'monkeyluffy'
      }]
    });
  });
});
