import { authResponse, channelId } from '../../src/types';
import { AUTH_REGISTER, CHANNELS_CREATE, CHANNELS_LIST, CHANNELS_LIST_ALL, clearDataForTest } from '../testBase';
import {
  sendPostRequestToEndpoint,
  parseJsonResponse,
  OK,
  sendGetRequestToEndpoint,
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
  clearDataForTest();

  const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });

  const jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  token = jsonResponse.token;
});

describe('HTTP tests for /channels/create', () => {
  test('channelCreate public channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channelId: expect.any(Number)
    });
  });

  test('channelCreate private channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: false
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channelId: expect.any(Number)
    });
  });

  test('channelCreate with channel name more than 20 characters throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: LONG_CHANNEL_NAME,
      isPublic: false
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelCreate with channel name less than 1 characters returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: SHORT_CHANNEL_NAME,
      isPublic: false
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelCreate with invalid token throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: TEST_INVALID_TOKEN,
      name: SHORT_CHANNEL_NAME,
      isPublic: false
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
});

describe('HTTP tests for /channels/list', () => {
  let channelId: number;

  test('channelsList no channels success', () => {
    const res = sendGetRequestToEndpoint(CHANNELS_LIST, {
      token
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channels: []
    });
  });

  test('channelsList success', () => {
    let res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });

    const jsonResponse = parseJsonResponse(res) as unknown as channelId;
    channelId = jsonResponse.channelId;

    res = sendGetRequestToEndpoint(CHANNELS_LIST, {
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

  test('channelsList with invalid token throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNELS_LIST, {
      token: TEST_INVALID_TOKEN
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
});

describe('HTTP tests for /channels/listAll', () => {
  test('channelsListAll multipleChannel from different users including private success', () => {
    // test user 2
    const user2Res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: '2' + EMAIL,
      password: '2' + PASSWORD,
      nameFirst: NAME_FIRST + 'b',
      nameLast: NAME_LAST + 'b'
    });
    const token2 = (parseJsonResponse(user2Res) as unknown as authResponse).token;

    // test user 1's public channel
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    const channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;

    // test user 2's private channel
    const channel2Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token2,
      name: TEST_CHANNEL_NAME + '2',
      isPublic: false
    });
    const channel2Id = (parseJsonResponse(channel2Res) as unknown as channelId).channelId;

    const res = sendGetRequestToEndpoint(CHANNELS_LIST_ALL, {
      token: token
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      channels: [
        {
          channelId: channel1Id,
          name: TEST_CHANNEL_NAME
        },
        {
          channelId: channel2Id,
          name: TEST_CHANNEL_NAME + '2'
        }
      ]
    });
  });

  test('channelsListAll with invalid token throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNELS_LIST_ALL, {
      token: TEST_INVALID_TOKEN
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
});
