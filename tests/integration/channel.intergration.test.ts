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

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
  const res3 = sendPostRequestToEndpoint('/auth/register/v2', {
    email: '3' + EMAIL,
    password: '3' + PASSWORD,
    nameFirst: 'c' + NAME_FIRST,
    nameLast: 'c' + NAME_LAST
  });
  const jsonResponse3 = (parseJsonResponse(res3) as unknown as authResponse);
  uId3 = jsonResponse3.authUserId;
  token3 = jsonResponse3.token;

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

describe('HTTP tests for channel/addowner/v1', () => {
  let privateChannelId: number;
  let publicChannelId: number;

  beforeEach(() => {
    const channel1CreateRes = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    publicChannelId = (parseJsonResponse(channel1CreateRes) as unknown as channelId).channelId;

    const channel2CreateRes = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: false
    });
    privateChannelId = (parseJsonResponse(channel2CreateRes) as unknown as channelId).channelId;

    sendPostRequestToEndpoint('/channel/invite/v2', {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });
    sendPostRequestToEndpoint('/channel/join/v2', {
      token: token2,
      channelId: publicChannelId,
    });
  });

  test('Add channel owner to public channel successful', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Add channel owner to private channel successful', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Add global owner to private channel successful', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token3,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Add global owner to public channel successful', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token3,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
  test('Add owner to invalid channel id returns fails', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token,
      channelId: 5676879809,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Add global owner to public with invalid channel id returns fails', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token3,
      channelId: 5676879809,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Add owner to private channel with invalid channel id returns fails', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token,
      channelId: 5676879809,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Add global owner to public with invalid channel id returns fails', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token3,
      channelId: 5676879809,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Add owner to public channel with channel uId not a member returns fails', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token2,
      channelId: publicChannelId,
      uId: 1234444
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Add owner to private channel with channel uId not a member returns fails', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token2,
      channelId: privateChannelId,
      uId: 2222222
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Owner add new existing owner returns fails', () => {
    const addNewOwner = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(addNewOwner.statusCode).toBe(OK);
    expect(parseJsonResponse(addNewOwner)).toStrictEqual({});

    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Non owner add new owner returns fails', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token2,
      channelId: privateChannelId,
      uId: 2222222
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
  test('Add owner with invalid uId returns fails', () => {
    const res = sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token,
      channelId: privateChannelId,
      uId: 2222222
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});

describe('HTTP tests for channel/leave/v1', () => {
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
    const res = sendPostRequestToEndpoint('/channel/leave/v1', {
      token: token,
      channelId: 99999999,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid channel ID'
    });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const res = sendPostRequestToEndpoint('/channel/leave/v1', {
      token: token2,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Permission denied, non-channel user cannot leave the channel'
    });
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint('/channel/leave/v1', {
      token: '99999999',
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: 'Invalid token'
    });
  });

  test('correct input correct return ', () => {
    const res = sendPostRequestToEndpoint('/channel/leave/v1', {
      token: token,
      channelId: channel1Id,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('HTTP tests for channel/removeowner/v1', () => {
  let privateChannelId: number;
  let publicChannelId: number;

  beforeEach(() => {
    const channel1CreateRes = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: true
    });
    publicChannelId = (parseJsonResponse(channel1CreateRes) as unknown as channelId).channelId;

    const channel2CreateRes = sendPostRequestToEndpoint('/channels/create/v2', {
      token: token,
      name: TEST_CHANNEL_NAME,
      isPublic: false
    });
    privateChannelId = (parseJsonResponse(channel2CreateRes) as unknown as channelId).channelId;

    sendPostRequestToEndpoint('/channel/invite/v2', {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });
    sendPostRequestToEndpoint('/channel/join/v2', {
      token: token2,
      channelId: publicChannelId,
    });
    sendPostRequestToEndpoint('/channel/addowner/v1', {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });
  });

  test('Remove channel owner remove themselves successful', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token,
      channelId: publicChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Remove channel owner remove other user successful', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token,
      channelId: publicChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
  test('Global owner remove another channel owner successful', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token3,
      channelId: publicChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Remove channel owner using channelId refer to invalid channel remove themselves returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token,
      channelId: 22222222,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Remove channel owner using channelId refer to invalid channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token,
      channelId: 22222222,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Global owner using channelId refer to invalid channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token3,
      channelId: 22222222,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Remove channel owner using invalid uId remove themselves returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token,
      channelId: publicChannelId,
      uId: 123123123
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Global owner using invalid uId remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token3,
      channelId: publicChannelId,
      uId: 123123123
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Channel owner using uId refer a user who is not an owner of the channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Global owner using uId refer a user who is not an owner of the channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token3,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Channel owner using uId refer a user who is not an owner of the channel remove other user returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token,
      channelId: privateChannelId,
      uId: uId2
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Channel owner using uId refer a user who is currently the only owner of the channel returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token,
      channelId: privateChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Channel owner using uId refer a user who is currently the only owner of the channel returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token3,
      channelId: privateChannelId,
      uId: uId3
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Authorised user does not have owner permissions in the channel returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token2,
      channelId: privateChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Authorised user does not have owner permissions in the channel returns fail', () => {
    const res = sendPostRequestToEndpoint('/channel/removeowner/v1', {
      token: token2,
      channelId: privateChannelId,
      uId: uId1
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});
