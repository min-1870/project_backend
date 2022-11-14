import { authResponse, channels } from '../../src/types';
import { AUTH_REGISTER, CHANNELS_CREATE, CHANNELS_LIST, CLEAR } from '../testBase';
import { parseJsonResponse, sendDeleteRequestToEndpoint, sendGetRequestToEndpoint, sendPostRequestToEndpoint } from './integrationTestUtils';

const EMAIL = 'adfadf@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';

describe('HTTP tests for /clear', () => {
  test('Clear data succeeds', () => {
    const registerResponse = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const registerJsonResponse = parseJsonResponse(registerResponse) as unknown as authResponse;
    const token = registerJsonResponse.token;

    sendPostRequestToEndpoint(CHANNELS_CREATE, {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);

    let listChannelRes = sendGetRequestToEndpoint(CHANNELS_LIST, {
    }, token);

    const listChannelJsonRes = parseJsonResponse(listChannelRes) as unknown as channels;
    expect(listChannelJsonRes.channels.length).toStrictEqual(1);

    const clearRes = sendDeleteRequestToEndpoint(CLEAR, {});

    expect(parseJsonResponse(clearRes)).toStrictEqual({});

    listChannelRes = sendGetRequestToEndpoint(CHANNELS_LIST, {
      token
    });

    expect(listChannelRes.statusCode).toBe(403);
    expect(parseJsonResponse(listChannelRes)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
});
