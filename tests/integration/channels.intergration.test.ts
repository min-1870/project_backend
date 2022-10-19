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
const TEST_CHANNEL_ID = '123VALID';
const TEST_INVALID_CHANNELID = '';
const TEST_INVALID_UID = '';
const TEST_UID = 'Bobby12345';
let token: string;
let authUserId: number;

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
  let channelId: number;
  beforeEach(() => {
    const res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });

    const jsonResponse = parseJsonResponse(res) as unknown as { channelId: number };
    channelId = jsonResponse.channelId;
  });

  test('channels list successful', () => {
    const res = sendPostRequestToEndpoint('/channels/list/v2', {
      token
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channels: [
        {
          channelId,
          name: TEST_CHANNEL_NAME
        }
      ]
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

describe('HTTP tests for /channels/addowner/v1', () => {
  test('Add owner with uId successful', () => {
    const res = sendPostRequestToEndpoint('/channels/addowner/v1', {
      token: token,
      channelId: TEST_CHANNEL_ID,
      uId: authUserId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Add owner with invalid channelID returns fail', () => {
    const res = sendPostRequestToEndpoint('/channels/addowner/v1', {
      token: token,
      channelId: TEST_INVALID_CHANNELID,
      uId: authUserId
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Add owner with invalid uID returns fail', () => {
    const res = sendPostRequestToEndpoint('/channels/addowner/v1', {
      token: token,
      channelId: TEST_CHANNEL_ID,
      uId: TEST_INVALID_UID
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Add owner with user who is not a member of the channel returns fail', () => {
    const res = sendPostRequestToEndpoint('/channels/addowner/v1', {
      token,
      channelId: TEST_CHANNEL_ID,
      uId: TEST_INVALID_UID
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channels: expect.any({})
    });
  });

  test('Add owner with invalid token returns fail', () => {
    const res = sendPostRequestToEndpoint('/channels/addowner/v1', {
      token: TEST_INVALID_TOKEN,
      channelId: TEST_CHANNEL_ID,
      uId: TEST_UID
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channels: expect.any({})
    });
  });
});
