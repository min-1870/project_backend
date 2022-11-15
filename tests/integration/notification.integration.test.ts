import { authResponse, channelId, dmDetailResponse, dmId, messageId, notficationResponse, user } from '../../src/types';
import { AUTH_REGISTER, CHANNELS_CREATE, CHANNEL_INVITE, clearDataForTest, DM_CREATE, DM_DETAILS, DM_SEND, MESSAGE_REACT, MESSAGE_SEND, NOTIFICATION_GET, USER_PROFILE } from '../testBase';
import { parseJsonResponse, sendGetRequestToEndpoint, sendPostRequestToEndpoint } from './integrationTestUtils';

const PUBLIC_USER_EMAIL = 'Bob123@gmail.com';
const PUBLIC_USER_PASSWORD = '11223344';
const PUBLIC_USER_NAME_FIRST = 'Barty';
const PUBLIC_USER_NAME_LAST = 'Potter';

const PRIVATE_USER_EMAIL = '1Bob123@gmail.com';
const PRIVATE_USER_PASSWORD = '1122334dd4';
const PRIVATE_USER_NAME_FIRST = 'Baoty';
const PRIVATE_USER_NAME_LAST = 'Pottter';

const GLOBAL_USER_EMAIL = '1Bobd123@gmail.com';
const GLOBAL_USER_PASSWORD = '11223d34dd4';
const GLOBAL_USER_NAME_FIRST = 'aBaoty';
const GLOBAL_USER_NAME_LAST = 'Pottster';

const PUBLIC_CHANNEL_NAME = 'Test public channel';
const PRIVATE_CHANNEL_NAME = 'Test private channel';

let privateChannelCreatorToken: string;
let publicChannelCreatorToken: string;
let globalOwnerToken: string;
let privateChannelCreatorUserId: number;
let publicChannelCreatorUserId: number;
let globalOwnerUserId: number;

let publicChannelCreatorHandle: string;
let privateChannelCreatorHandle: string;
let globalOwnerHandle: string;

let publicChannelId: number;
let privateChannelId: number;

let publicChannelMessageId: number;
let dmMessageId: number;

let dmCreatorId: number;
let dmCreatorToken: string;
let testDmId: number;

beforeEach(() => {
  clearDataForTest();

  let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: GLOBAL_USER_EMAIL,
    password: GLOBAL_USER_PASSWORD,
    nameFirst: GLOBAL_USER_NAME_FIRST,
    nameLast: GLOBAL_USER_NAME_LAST
  });
  let jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
  globalOwnerUserId = jsonResponse.authUserId;
  globalOwnerToken = jsonResponse.token;

  res = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: PUBLIC_USER_EMAIL,
    password: PUBLIC_USER_PASSWORD,
    nameFirst: PUBLIC_USER_NAME_FIRST,
    nameLast: PUBLIC_USER_NAME_LAST
  });
  jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
  publicChannelCreatorUserId = jsonResponse.authUserId;
  publicChannelCreatorToken = jsonResponse.token;

  res = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: PRIVATE_USER_EMAIL,
    password: PRIVATE_USER_PASSWORD,
    nameFirst: PRIVATE_USER_NAME_FIRST,
    nameLast: PRIVATE_USER_NAME_LAST
  });
  jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
  privateChannelCreatorUserId = jsonResponse.authUserId;
  privateChannelCreatorToken = jsonResponse.token;
  dmCreatorId = privateChannelCreatorUserId;
  dmCreatorToken = privateChannelCreatorToken;

  let userProfile;
  res = sendGetRequestToEndpoint(USER_PROFILE,
    { uId: publicChannelCreatorUserId }, publicChannelCreatorToken);
  userProfile = (parseJsonResponse(res) as unknown as user);
  publicChannelCreatorHandle = userProfile.user.handleStr;
  res = sendGetRequestToEndpoint(USER_PROFILE,
    { uId: privateChannelCreatorUserId }, privateChannelCreatorToken);
  userProfile = (parseJsonResponse(res) as unknown as user);
  privateChannelCreatorHandle = userProfile.user.handleStr;
  res = sendGetRequestToEndpoint(USER_PROFILE,
    { uId: globalOwnerUserId }, globalOwnerToken);
  userProfile = (parseJsonResponse(res) as unknown as user);
  globalOwnerHandle = userProfile.user.handleStr;

  res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
    name: PUBLIC_CHANNEL_NAME,
    isPublic: true
  }, publicChannelCreatorToken);
  publicChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

  res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
    name: PRIVATE_CHANNEL_NAME,
    isPublic: false
  }, privateChannelCreatorToken);
  privateChannelId = (parseJsonResponse(res) as unknown as channelId).channelId;

  res = sendPostRequestToEndpoint(MESSAGE_SEND, {
    channelId: publicChannelId,
    message: 'Hello world'
  }, publicChannelCreatorToken);
  publicChannelMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;
});

describe('HTTP tests for /notifications/get', () => {
  test('notificationsGet no notifications for user succeeds', () => {
    const res = sendGetRequestToEndpoint(NOTIFICATION_GET, {}, publicChannelCreatorToken);

    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({
      notifications: []
    });
  });

  test('notificationsGet invited to channel notifications', () => {
    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: publicChannelCreatorUserId
    }, privateChannelCreatorToken);

    const res = sendGetRequestToEndpoint(NOTIFICATION_GET, {}, publicChannelCreatorToken);

    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({
      notifications: [{
        channelId: privateChannelId,
        dmId: -1,
        notificationMessage: `${privateChannelCreatorHandle} added you to ${PRIVATE_CHANNEL_NAME}`
      }]
    });
  });

  test('notificationGet create dm notification', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;
    res = sendGetRequestToEndpoint(DM_DETAILS, { dmId: testDmId }, dmCreatorToken);
    const dmName = (parseJsonResponse(res) as unknown as dmDetailResponse).name;

    res = sendGetRequestToEndpoint(NOTIFICATION_GET, {}, privateChannelCreatorToken);

    expect(res.statusCode).toBe(200);
    expect(parseJsonResponse(res)).toStrictEqual({
      notifications: [{
        channelId: -1,
        dmId: testDmId,
        notificationMessage: `${privateChannelCreatorHandle} added you to ${dmName}`
      }]
    });
  });

  test('notificationsGet channel message react notifications', () => {
    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId
    }, publicChannelCreatorToken);
    sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: publicChannelMessageId, reactId: 1 },
      privateChannelCreatorToken
    );

    const res = sendGetRequestToEndpoint(NOTIFICATION_GET, {}, publicChannelCreatorToken);

    expect(res.statusCode).toBe(200);
    const notifResponse = parseJsonResponse(res) as unknown as notficationResponse;
    console.log(notifResponse)
    expect(notifResponse.notifications[0]).toStrictEqual({
        channelId: publicChannelId,
        dmId: -1,
        notificationMessage: `${privateChannelCreatorHandle} reacted to your message in ${PUBLIC_CHANNEL_NAME}`
    })
  });

  test('notificationGet dm message react notification', () => {
    let res = sendPostRequestToEndpoint(DM_CREATE, {
      uIds: [privateChannelCreatorUserId, publicChannelCreatorUserId]
    }, dmCreatorToken);
    testDmId = (parseJsonResponse(res) as undefined as dmId).dmId;
    res = sendGetRequestToEndpoint(DM_DETAILS, { dmId: testDmId }, dmCreatorToken);
    const dmName = (parseJsonResponse(res) as unknown as dmDetailResponse).name;
    res = sendPostRequestToEndpoint(DM_SEND, {
      dmId: testDmId,
      message: '0'.repeat(30),
    }, dmCreatorToken);
    expect(res.statusCode).toBe(200);
    dmMessageId = (parseJsonResponse(res) as undefined as messageId).messageId;
    res = sendPostRequestToEndpoint(MESSAGE_REACT,
      { messageId: dmMessageId, reactId: 1 },
      publicChannelCreatorToken
    );
    expect(res.statusCode).toBe(200);

    res = sendGetRequestToEndpoint(NOTIFICATION_GET, {}, dmCreatorToken);

    console.log(parseJsonResponse(res))
    expect(res.statusCode).toBe(200);
    const notifResponse = parseJsonResponse(res) as unknown as notficationResponse;
    expect(notifResponse.notifications[0]).toStrictEqual({
        channelId: -1,
        dmId: testDmId,
        notificationMessage: `${publicChannelCreatorHandle} reacted to your message in ${dmName}`
    })
  });

  test('notificationsGet more than 20 notifications only most recent 20 and order from recent to least recent', () => {
    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: publicChannelCreatorUserId
    }, privateChannelCreatorToken);
    for (let i = 1; i < 31; i++) {
      const name = `This is channel ${i}.`;
      const res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
        name,
        isPublic: false
      }, privateChannelCreatorToken);
      const channelId = (parseJsonResponse(res) as unknown as channelId).channelId;
      sendPostRequestToEndpoint(CHANNEL_INVITE, {
        channelId,
        uId: publicChannelCreatorUserId
      }, privateChannelCreatorToken);
    }

    const res = sendGetRequestToEndpoint(NOTIFICATION_GET, {}, publicChannelCreatorToken);
    console.log(publicChannelCreatorHandle);
    console.log(globalOwnerHandle);
    console.log(publicChannelMessageId);
    console.log(dmCreatorId);

    expect(res.statusCode).toBe(200);
    const notifResponse = parseJsonResponse(res) as unknown as notficationResponse;
    expect(notifResponse.notifications.length).toBe(20);
    expect(notifResponse.notifications[0].notificationMessage).toBe(`${privateChannelCreatorHandle} added you to This is channel 30.`);
    expect(notifResponse.notifications[notifResponse.notifications.length - 1].notificationMessage).toBe(`${privateChannelCreatorHandle} added you to This is channel 11.`);
  });
});
