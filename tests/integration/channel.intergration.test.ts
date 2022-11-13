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
let token3: string; // token of test user 3
let uId1: number; // uId of test user 1
let uId2: number; // uId of test user 2
let uId3: number; // uId of test user 3

const CHANNELS_CREATE = '/channels/create/v3';
const CHANNEL_JOIN = '/channel/join/v3';
const CHANNEL_INVITE = '/channel/invite/v3';
const CHANNEL_DETAILS = '/channel/details/v3';
const CHANNEL_ADD_OWNER = '/channel/addowner/v2';
const CHANNEL_LEAVE = '/channel/leave/v2';
const CHANNEL_REMOVE_OWNER = '/channel/removeowner/v2';
const AUTH_REGISTER = '/auth/register/v3';

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
  const res3 = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: '3' + EMAIL,
    password: '3' + PASSWORD,
    nameFirst: 'c' + NAME_FIRST,
    nameLast: 'c' + NAME_LAST
  });
  const jsonResponse3 = (parseJsonResponse(res3) as unknown as authResponse);
  uId3 = jsonResponse3.authUserId;
  token3 = jsonResponse3.token;

  const res1 = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });
  token = (parseJsonResponse(res1) as unknown as authResponse).token;

  const res2 = sendPostRequestToEndpoint(AUTH_REGISTER, {
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

describe('HTTP tests for channel/messages', () => {
  let channel1Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
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

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('start is greater than the total number of messages in the channel', () => {
    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token,
      channelId: channel1Id,
      start: 99999999,
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: token2,
      channelId: channel1Id,
      start: 0,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('token is invalid', () => {
    const res = sendGetRequestToEndpoint('/channel/messages/v2', {
      token: '99999999',
      channelId: channel1Id,
      start: 0,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('no messages success', () => {
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

  // TODO: update this test
  test('has more than 50 messages success', () => {
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

describe('HTTP tests for channel/join', () => {
  let channel1Id: number;
  let channel2Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
    const channel2Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME + '2',
      isPublic: false
    });
    channel2Id = (parseJsonResponse(channel2Res) as unknown as channelId).channelId;
  });

  test('channelId does not refer to a valid channel', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: token2,
      channelId: 99999999,
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('the authorised user is already a member of the channel', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: token,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: token2,
      channelId: channel2Id,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: '99999999',
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('correct input correct return ', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: token2,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('HTTP tests for channel/invite', () => {
  let channel1Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });

  test('channelId does not refer to a valid channel', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      token: token,
      channelId: 99999999,
      uId: uId2,
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('uId does not refer to a valid user', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      token: token,
      channelId: channel1Id,
      uId: 99999999,
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      token: token,
      channelId: channel1Id,
      uId: uId1,
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      token: token2,
      channelId: channel1Id,
      uId: uId2,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      token: '99999999',
      channelId: channel1Id,
      uId: uId2,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('correct input correct return ', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      token: token,
      channelId: channel1Id,
      uId: uId2,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('HTTP tests for channel/details', () => {
  let channelId: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    channelId = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });

  test('UserId is not a member of channel', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      token: token2,
      channelId,
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('ChannelId does not refer to a valid channel', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      token: token,
      channelId: 999999999999999
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Invalid Token', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      token: '99999999',
      channelId,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('correct input correct return for channel', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      token,
      channelId,
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
        uId: uId1
      }],
      allMembers: [{
        email: 'Bob123@gmail.com',
        handleStr: 'bartypotter',
        nameFirst: 'Barty',
        nameLast: 'Potter',
        uId: uId1
      }]
    });
  });
});

describe('HTTP tests for channel/addowner', () => {
  let privateChannelId: number;
  let publicChannelId: number;

  beforeEach(() => {
    const channel1CreateRes = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    publicChannelId = (parseJsonResponse(channel1CreateRes) as unknown as channelId).channelId;

    const channel2CreateRes = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: false
    });
    privateChannelId = (parseJsonResponse(channel2CreateRes) as unknown as channelId).channelId;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });
    sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: token2,
      channelId: publicChannelId,
    });
  });

  test('Add channel owner to public channel successful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Add channel owner to private channel successful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Add global owner to private channel successful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token3,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Add global owner to public channel successful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token3,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
  test('Add owner to invalid channel id returns fails', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: 5676879809,
      uId: uId1
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
  test('Add global owner to public with invalid channel id returns fails', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token3,
      channelId: 5676879809,
      uId: uId2
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
  test('Add owner to private channel with invalid channel id returns fails', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: 5676879809,
      uId: uId1
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
  test('Add global owner to public with invalid channel id returns fails', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token3,
      channelId: 5676879809,
      uId: uId2
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
  test('Add owner to public channel with channel uId not a member returns fails', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: publicChannelId,
      uId: 1234444
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
  test('Add owner to private channel with channel uId not a member returns fails', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: privateChannelId,
      uId: 2222222
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
  test('Owner add new existing owner returns fails', () => {
    const addNewOwner = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(addNewOwner.statusCode).toBe(OK);
    expect(parseJsonResponse(addNewOwner)).toStrictEqual({});

    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
  test('Non owner add new owner returns fails', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token2,
      channelId: privateChannelId,
      uId: 2222222
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
  test('Add owner with invalid uId returns fails', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: privateChannelId,
      uId: 2222222
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
});

describe('HTTP tests for channel/leave', () => {
  let channel1Id: number;
  beforeEach(() => {
    const channel1Res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;
  });

  test('channelId does not refer to a valid channel', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      token: token,
      channelId: 99999999,
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      token: token2,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      token: '99999999',
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('correct input correct return ', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      token: token,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('HTTP tests for channel/removeowner', () => {
  let privateChannelId: number;
  let publicChannelId: number;

  beforeEach(() => {
    const channel1CreateRes = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    publicChannelId = (parseJsonResponse(channel1CreateRes) as unknown as channelId).channelId;

    const channel2CreateRes = sendPostRequestToEndpoint(CHANNELS_CREATE, {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: false
    });
    privateChannelId = (parseJsonResponse(channel2CreateRes) as unknown as channelId).channelId;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });
    sendPostRequestToEndpoint(CHANNEL_JOIN, {
      token: token2,
      channelId: publicChannelId,
    });
    sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });
  });

  test('Remove channel owner remove themselves successful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token,
      channelId: publicChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Remove channel owner remove other user successful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Global owner remove another channel owner successful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token3,
      channelId: publicChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Remove channel owner using channelId refer to invalid channel remove themselves returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token,
      channelId: 22222222,
      uId: uId1
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Remove channel owner using channelId refer to invalid channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token,
      channelId: 22222222,
      uId: uId2
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Global owner using channelId refer to invalid channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token3,
      channelId: 22222222,
      uId: uId2
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Remove channel owner using invalid uId remove themselves returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token,
      channelId: publicChannelId,
      uId: 123123123
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Global owner using invalid uId remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token3,
      channelId: publicChannelId,
      uId: 123123123
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Channel owner using uId refer a user who is not an owner of the channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Global owner using uId refer a user who is not an owner of the channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token3,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Channel owner using uId refer a user who is not an owner of the channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Channel owner using uId refer a user who is currently the only owner of the channel returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token,
      channelId: privateChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Channel owner using uId refer a user who is currently the only owner of the channel returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token3,
      channelId: privateChannelId,
      uId: uId3
    });

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Authorised user does not have owner permissions in the channel returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token2,
      channelId: privateChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('Authorised user does not have owner permissions in the channel returns fail', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      token: token2,
      channelId: privateChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
});
