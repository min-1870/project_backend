import { authResponse, channels, error } from '../../src/types';
import { parseJsonResponse, sendDeleteRequestToEndpoint, sendGetRequestToEndpoint, sendPostRequestToEndpoint } from './integrationTestUtils';

const EMAIL = 'adfadf@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';

describe('HTTP tests for /clear', () => {
  test('Clear data succeeds', () => {
    const registerResponse = sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const registerJsonResponse = parseJsonResponse(registerResponse) as unknown as authResponse;
    const token = registerJsonResponse.token;

    sendPostRequestToEndpoint('/channels/create/v3', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });

    let listChannelRes = sendGetRequestToEndpoint('/channels/list/v3', {
      token
    });

    const listChannelJsonRes = parseJsonResponse(listChannelRes) as unknown as channels;
    expect(listChannelJsonRes.channels.length).toStrictEqual(1);

    const clearRes = sendDeleteRequestToEndpoint('/clear/v1', {});

    expect(parseJsonResponse(clearRes)).toStrictEqual({});

    listChannelRes = sendGetRequestToEndpoint('/channels/list/v3', {
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
