import { authResponse, channels, error } from '../../src/types';
import { parseJsonResponse, sendDeleteRequestToEndpoint, sendGetRequestToEndpoint, sendPostRequestToEndpoint } from './integrationTestUtils';

const EMAIL = 'adfadf@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';

describe('HTTP tests for /clear/v1', () => {
  test('Clear data succeeds', () => {
    const registerResponse = sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const registerJsonResponse = parseJsonResponse(registerResponse) as unknown as authResponse;
    const token = registerJsonResponse.token;

    sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });

    let listChannelRes = sendGetRequestToEndpoint('/channels/list/v2', {
      token
    });

    const listChannelJsonRes = parseJsonResponse(listChannelRes) as unknown as channels;
    expect(listChannelJsonRes.channels.length).toStrictEqual(1);

    const clearRes = sendDeleteRequestToEndpoint('/clear/v1', {});

    expect(parseJsonResponse(clearRes)).toStrictEqual({});

    listChannelRes = sendGetRequestToEndpoint('/channels/list/v2', {
      token
    });

    const listChannelJsonResError = parseJsonResponse(listChannelRes) as unknown as error;
    expect(listChannelJsonResError).toStrictEqual({
      error: expect.any(String)
    });
  });
});
