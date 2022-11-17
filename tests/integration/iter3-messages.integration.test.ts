import { authResponse, channelId, messageId } from '../../src/types';
import {
  OK,
  parseJsonResponse,
  sendDeleteRequestToEndpoint,
  sendPostRequestToEndpoint
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';
const TEST_MESSAGE = 'hello world :)';

const TEST_INVALID_TOKEN = '999999';

// over 1000 characters
let VERY_LONG_MESSAGE = ':(';
for (let i = 0; i < 1000; i++) VERY_LONG_MESSAGE = VERY_LONG_MESSAGE + ':(';

let token: string; // token of test user 1
let token2: string; // token of test user 2

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
  const res1 = sendPostRequestToEndpoint('/auth/register/v3', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });
  token = (parseJsonResponse(res1) as unknown as authResponse).token;

  const res2 = sendPostRequestToEndpoint('/auth/register/v3', {
    email: '2' + EMAIL,
    password: '2' + PASSWORD,
    nameFirst: 'b' + NAME_FIRST,
    nameLast: 'b' + NAME_LAST
  });
  token2 = (parseJsonResponse(res2) as unknown as authResponse).token;
});

describe('HTTP tests for message/pin/v1', () => {
  let testChannelId: number;
  let testMessageId: number;
  beforeEach(() => {
    const channel = sendPostRequestToEndpoint('/channels/create/v3', {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);
    testChannelId = (parseJsonResponse(channel) as unknown as channelId).channelId;

    const res2 = sendPostRequestToEndpoint('/message/send/v2', {
      channelId: testChannelId,
      message: TEST_MESSAGE,
    }, token);
    testMessageId = (parseJsonResponse(res2) as unknown as messageId).messageId;
  });

  test('token is invalid', () => {
    const res = sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, TEST_INVALID_TOKEN);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: 'Invalid token.' });
  });

  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const res = sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token2);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'User is not part of the channel where this message is.' });
  });

  test('user does not have owner permissions in the channel/DM', () => {
    const joinRes = sendPostRequestToEndpoint('/channel/join/v3', {
      channelId: testChannelId
    }, token2);

    expect(joinRes.statusCode).toBe(OK);

    const res = sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token2);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: 'user does not have owner permissions in the channel/DM.' });
  });

  test('Message is already pinned', () => {
    sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token);
    const res = sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'Message is already pinned.' });
  });

  test('correct input correct return', () => {
    const res = sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('HTTP tests for message/unpin/v1', () => {
  let testChannelId: number;
  let testMessageId: number;
  beforeEach(() => {
    const channel = sendPostRequestToEndpoint('/channels/create/v3', {
      name: TEST_CHANNEL_NAME,
      isPublic: true
    }, token);
    testChannelId = (parseJsonResponse(channel) as unknown as channelId).channelId;

    const res2 = sendPostRequestToEndpoint('/message/send/v2', {
      channelId: testChannelId,
      message: TEST_MESSAGE,
    }, token);
    testMessageId = (parseJsonResponse(res2) as unknown as messageId).messageId;
  });

  test('Message is not pinned', () => {
    const res = sendPostRequestToEndpoint('/message/unpin/v1', {
      messageId: testMessageId
    }, token);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'Message is not pinned.' });
  });

  test('token is invalid', () => {
    sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token);

    const res = sendPostRequestToEndpoint('/message/unpin/v1', {
      messageId: testMessageId
    }, TEST_INVALID_TOKEN);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: 'Invalid token.' });
  });

  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token);

    const res = sendPostRequestToEndpoint('/message/unpin/v1', {
      messageId: testMessageId
    }, token2);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'User is not part of the channel where this message is.' });
  });

  test('user does not have owner permissions in the channel/DM', () => {
    const joinRes = sendPostRequestToEndpoint('/channel/join/v3', {
      channelId: testChannelId
    }, token2);

    expect(joinRes.statusCode).toBe(OK);

    sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token);

    const res = sendPostRequestToEndpoint('/message/unpin/v1', {
      messageId: testMessageId
    }, token2);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: 'user does not have owner permissions in the channel/DM.' });
  });

  test('correct input correct return', () => {
    sendPostRequestToEndpoint('/message/pin/v1', {
      messageId: testMessageId
    }, token);

    const res = sendPostRequestToEndpoint('/message/unpin/v1', {
      messageId: testMessageId
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});