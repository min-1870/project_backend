import {
  sendPostRequestToEndpoint,
  parseJsonResponse,
  OK,
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_INVALID_TOKEN = '';
const TEST_CHANNEL_NAME = 'Test channel';
const LONG_CHANNEL_NAME = 'This is a very long channel name';
const SHORT_CHANNEL_NAME = '';
let token: string;

beforeEach(() => {
  const res = sendPostRequestToEndpoint('/auth/register/v2', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });

  const jsonResponse = parseJsonResponse(res) as unknown as { token: string, authUserId: number };
  token = jsonResponse.token;
});

describe('HTTP tests for /channels/create/v2', () => {
  // happy path
  test('Create public channel successful', () => {
    const res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channelId: expect.any(Number)
    });
  });

  test('Create private channel successful', () => {
    const res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: false
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channelId: expect.any(Number)
    });
  });

  test('Create channel name more than 20 characters returns fail', () => {
    const res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: LONG_CHANNEL_NAME,
      isPublic: false
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Create channel name less than 1 characters returns fail', () => {
    const res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: SHORT_CHANNEL_NAME,
      isPublic: false
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Create channel name with invalid token returns fail', () => {
    const res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: TEST_INVALID_TOKEN,
      name: SHORT_CHANNEL_NAME,
      isPublic: false
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});

describe('HTTP tests for /channels/list/v2', () => {
  test('channels list successful', () => {
    const res = sendPostRequestToEndpoint('/channels/list/v2', {
      token
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channels: expect.any(String)
    });
  });

  test('channels list with invalid token fail', () => {
    const res = sendPostRequestToEndpoint('/channels/list/v2', {
      token: TEST_INVALID_TOKEN
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});
