import { authResponse, dmId } from '../../src/types';
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

describe('HTTP tests for /dm/create/v1', () => {
  // happy path
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
      error: expect.any(String)
    });
  });

  test('Failure due to duplicate uId', () => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: token,
      uIds: [uId, uId]
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Failure due to invalid tokens', () => {
    const res = sendPostRequestToEndpoint('/dm/create/v1', {
      token: (token + 999),
      uIds: [uId]
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
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
    // console.log(parseJsonResponse(res))
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
    // console.log(parseJsonResponse(res))
    expect(parseJsonResponse(res)).toStrictEqual({
      dms: [
        {
          dmId,
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
      error: expect.any(String)
    });
  });
});
