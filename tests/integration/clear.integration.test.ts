import { authResponse } from '../../src/types';
import { parseJsonResponse, sendDeleteRequestToEndpoint, sendPostRequestToEndpoint } from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';

let token: string;

beforeEach(() => {
  const registerResponse = sendPostRequestToEndpoint('/auth/register/v2', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });

  const registerJsonResponse = parseJsonResponse(registerResponse) as unknown as authResponse;
  token = registerJsonResponse.token;

  sendPostRequestToEndpoint('/channels/create/v2', {
    token: token,
    name: TEST_CHANNEL_NAME,
    isPublic: true
  });
});

describe('HTTP tests for /clear/v1', () => {
  test('Clear data succeeds', () => {
    let listChannelRes = sendPostRequestToEndpoint('/channels/list/v2', {
      token
    });

    // expect(parseJsonResponse(listChannelRes).length).toStrictEqual(1);

    const clearRes = sendDeleteRequestToEndpoint('/clear/v1', {});
    expect(parseJsonResponse(clearRes)).toStrictEqual({});

    listChannelRes = sendPostRequestToEndpoint('/channels/list/v2', {
      token
    });

    // expect(parseJsonResponse(listChannelRes).length).toStrictEqual(0);
  });
});
