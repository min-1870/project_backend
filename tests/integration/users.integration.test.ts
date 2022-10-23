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

  res = sendPostRequestToEndpoint('/auth/register/v2', {
    email: 'gomugomu@hotmail.com',
    password: PASSWORD,
    nameFirst: 'monkey',
    nameLast: 'luffy'
  });

  jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  uId = jsonResponse.authUserId;
});

describe('HTTP tests for /user/profile/v2', () => {
  // happy path
  test('Successful /user/profile/v2', () => {
    const res = sendGetRequestToEndpoint('/user/profile/v2', {
      token: token,
      uId: uId
    });

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
    const res = sendGetRequestToEndpoint('/user/profile/v2', {
      token: token,
      uId: (uId + 12133)
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('error passing invalid token', () => {
    const res = sendGetRequestToEndpoint('/user/profile/v2', {
      token: (token + 434),
      uId: uId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
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
