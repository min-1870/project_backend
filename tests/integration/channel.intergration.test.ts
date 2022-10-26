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
let uId1: number; // uId of test user 1
let uId2: number; // uId of test user 2

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

  const jsonResponse1 = parseJsonResponse(res1) as unknown as authResponse;
  uId1 = jsonResponse1.authUserId;
  const jsonResponse2 = parseJsonResponse(res2) as unknown as authResponse;
  uId2 = jsonResponse2.authUserId;
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

describe('HTTP tests for channel/join/v2', () => {
  let channel1Id: number;
  let channel2Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
    const channel2Res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME + '2',
      isPublic: false
    });
    channel2Id = (parseJsonResponse(channel2Res) as unknown as channelId).channelId;
  });

  test('channelId does not refer to a valid channel', () => {
    const res = sendPostRequestToEndpoint('/channel/join/v2', {
      token: token2,
      channelId: 99999999,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid channel ID'
    });
  });

  test('the authorised user is already a member of the channel', () => {
    const res = sendPostRequestToEndpoint('/channel/join/v2', {
      token: token,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'User already in channel'
    });
  });

  test('channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner', () => {
    const res = sendPostRequestToEndpoint('/channel/join/v2', {
      token: token2,
      channelId: channel2Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Permission denied, non-global owner is not allowed to access private channel'
    });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint('/channel/join/v2', {
      token: '99999999',
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid token'
    });
  });

  test('correct input correct return ', () => {
    const res = sendPostRequestToEndpoint('/channel/join/v2', {
      token: token2,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('HTTP tests for channel/invite/v2', () => {
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
    const res = sendPostRequestToEndpoint('/channel/invite/v2', {
      token: token,
      channelId: 99999999,
      uId: uId2,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid channel ID'
    });
  });

  test('uId does not refer to a valid user', () => {
    const res = sendPostRequestToEndpoint('/channel/invite/v2', {
      token: token,
      channelId: channel1Id,
      uId: 99999999,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid user ID'
    });
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const res = sendPostRequestToEndpoint('/channel/invite/v2', {
      token: token,
      channelId: channel1Id,
      uId: uId1,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'User already in channel'
    });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendPostRequestToEndpoint('/channel/invite/v2', {
      token: token2,
      channelId: channel1Id,
      uId: uId2,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Permission denied, non-channel user cannot invite other user to the channel'
    });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint('/channel/invite/v2', {
      token: '99999999',
      channelId: channel1Id,
      uId: uId2,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid token'
    });
  });

  test('correct input correct return ', () => {
    const res = sendPostRequestToEndpoint('/channel/invite/v2', {
      token: token,
      channelId: channel1Id,
      uId: uId2,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('HTTP tests for channel/details/v2', () => {
  let channel1Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });
  test('UserId is not a member of channel', () => {
    const res = sendGetRequestToEndpoint('/channel/details/v2', {
      token: token2,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'User ID is not a member of channel'
    });
  });
  test('ChannelId does not refer to a valid channel', () => {
    const res = sendGetRequestToEndpoint('/channel/details/v2', {
      token: token,
      channelId: 999999999999999
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Channel ID does not refer to a valid channel'
    });
  });
  test('Invalid Token', () => {
    const res = sendGetRequestToEndpoint('/channel/details/v2', {
      token: '99999999',
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Token is invalid'
    });
  });
  test('correct input correct return for channel', () => {
    const res = sendGetRequestToEndpoint('/channel/details/v2', {
      token: token,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      name: TEST_CHANNEL_NAME,
      isPublic: true,
      ownerMembers: [{
        email: 'Bob123@gmail.com',
        handleStr: 'bartypotter',
        nameFirst: 'Barty',
        nameLast: 'Potter',
        uId: 38
      }],
      allMembers: [{
        email: 'Bob123@gmail.com',
        handleStr: 'bartypotter',
        nameFirst: 'Barty',
        nameLast: 'Potter',
        uId: 38
      }]
    });
  });
});
