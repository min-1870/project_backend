import { authResponse, channelId } from '../../src/types';
import {
  OK,
  parseJsonResponse,
  sendDeleteRequestToEndpoint,
  sendGetRequestToEndpoint,
  sendPostRequestToEndpoint
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';

let token: string; // token of test user 1
let token2: string; // token of test user 2

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
  const res1 = sendPostRequestToEndpoint('/auth/register/v2', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });
  token = (parseJsonResponse(res1) as unknown as authResponse).token;

  const res2 = sendPostRequestToEndpoint('/auth/register/v2', {
    email: '2' + EMAIL,
    password: '2' + PASSWORD,
    nameFirst: 'b' + NAME_FIRST,
    nameLast: 'b' + NAME_LAST
  });
  token2 = (parseJsonResponse(res2) as unknown as authResponse).token;
});

describe('HTTP tests for channel/messages/v2', () => {
  let channel1Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });

  test('channelId does not refer to a valid channel', () => {
    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token,
      channelId: 99999999,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid channel ID'
    });
  });

  test('start is greater than the total number of messages in the channel', () => {
    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token,
      channelId: channel1Id,
      start: 99999999,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid start'
    });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token2,
      channelId: channel1Id,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Not a member of the channel'
    });
  });

  test('token is invalid', () => {
    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: '99999999',
      channelId: channel1Id,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'invalid token'
    });
  });

  test('correct input correct return ', () => { // need to add some messages and test when we have message function
    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token,
      channelId: channel1Id,
      start: 0,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });
});