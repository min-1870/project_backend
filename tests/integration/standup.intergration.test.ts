import { authResponse, channelId /** user */ } from '../../src/types';
import { AUTH_REGISTER, CHANNELS_CREATE, clearDataForTest, STANDUP_SEND, STANDUP_START, CHANNEL_MESSAGES, STANDUP_ACTIVE } from '../testBase';
import {
  parseJsonResponse,
  sendDeleteRequestToEndpoint,
  sendGetRequestToEndpoint,
  sendPostRequestToEndpoint,
  sendPutRequestToEndpoint
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
const TEST_CHANNEL_NAME = 'Test channel';
const TEST_MESSAGE = 'hello world :)';
const TEST_MESSAGE_2 = 'hello world :(';

const TEST_INVALID_CHANNELID = '99999';

// over 1000 characters
let VERY_LONG_MESSAGE = ':(';
for (let i = 0; i < 1000; i++) VERY_LONG_MESSAGE = VERY_LONG_MESSAGE + ':(';

let TOKEN1: string; // token of test user 1
let TOKEN2: string; // token of test user 2

let CHANNELID: number;
let input: any;
let result: any;

beforeEach(() => {
  clearDataForTest();
  const res1 = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });
  TOKEN1 = (parseJsonResponse(res1) as unknown as authResponse).token;

  const res2 = sendPostRequestToEndpoint(AUTH_REGISTER, {
    email: '2' + EMAIL,
    password: '2' + PASSWORD,
    nameFirst: 'b' + NAME_FIRST,
    nameLast: 'b' + NAME_LAST
  });
  TOKEN2 = (parseJsonResponse(res2) as unknown as authResponse).token;

  const res = sendPostRequestToEndpoint(CHANNELS_CREATE, {
    name: TEST_CHANNEL_NAME,
    isPublic: true
  }, TOKEN1);

  CHANNELID = (parseJsonResponse(res) as unknown as channelId).channelId;
});

function sendReqParseRes(TYPE: string, FUNC: any, input1: any, input2: any) {
  let request;
  let response;
  let statusCode;
  if (TYPE === 'post') {
    request = sendPostRequestToEndpoint(FUNC, input1, input2);
    statusCode = request.statusCode;
    response = parseJsonResponse(request);
  } else if (TYPE === 'get') {
    request = sendGetRequestToEndpoint(FUNC, input1, input2);
    statusCode = request.statusCode;
    response = parseJsonResponse(request);
  } else if (TYPE === 'put') {
    request = sendPutRequestToEndpoint(FUNC, input1, input2);
    statusCode = request.statusCode;
    response = parseJsonResponse(request);
  } else if (TYPE === 'delete') {
    request = sendDeleteRequestToEndpoint(FUNC, input1, input2);
    statusCode = request.statusCode;
    response = parseJsonResponse(request);
  }
  return {
    return: response,
    statusCode: statusCode
  };
}

function sleep(ms: number) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) { input = null; }
}

describe('HTTP tests for standup/start', () => {
  test('correct input correct output', () => {
    input = {
      channelId: CHANNELID,
      length: 1
    };
    const timeFinish = Math.round((new Date()).getTime() / 1000) + input.length - 3;
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN1);

    expect(result.statusCode).toBe(200);
    expect(result.return.timeFinish).toBeGreaterThanOrEqual(timeFinish);

    input = {
      channelId: CHANNELID,
      message: TEST_MESSAGE
    };
    sendReqParseRes('post', STANDUP_SEND, input, TOKEN1);

    input = {
      channelId: CHANNELID,
      message: TEST_MESSAGE_2
    };
    sendReqParseRes('post', STANDUP_SEND, input, TOKEN1);

    sleep(1000);

    input = {
      channelId: CHANNELID,
      start: 0
    };
    result = sendReqParseRes('get', CHANNEL_MESSAGES, input, TOKEN1);

    expect(result.statusCode).toBe(200);
    expect(result.return.messages[0].message).toStrictEqual(NAME_FIRST.toLowerCase() + NAME_LAST.toLowerCase() + ': ' + TEST_MESSAGE + '\n' + NAME_FIRST.toLowerCase() + NAME_LAST.toLowerCase() + ': ' + TEST_MESSAGE_2);
  });

  test('channelId does not refer to a valid channel', () => {
    input = {
      channelId: TEST_INVALID_CHANNELID,
      length: 0
    };
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN1);

    expect(result.statusCode).toBe(400);
    expect(result.return.error).toStrictEqual({ message: 'channelId does not refer to a valid channel' });
  });

  test('length is a negative integer', () => {
    input = {
      channelId: CHANNELID,
      length: -1
    };
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN1);

    expect(result.statusCode).toBe(400);
    expect(result.return.error).toStrictEqual({ message: 'length is a negative integer' });
  });

  test('an active standup is currently running in the channel', () => {
    input = {
      channelId: CHANNELID,
      length: 2
    };
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN1);

    input = {
      channelId: CHANNELID,
      length: 2
    };
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN1);

    expect(result.statusCode).toBe(400);
    expect(result.return.error).toStrictEqual({ message: 'an active standup is currently running in the channel' });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    input = {
      channelId: CHANNELID,
      length: 1
    };
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN2);

    expect(result.statusCode).toBe(403);
    expect(result.return.error).toStrictEqual({ message: 'channelId is valid and the authorised user is not a member of the channel' });
  });
});

describe('HTTP tests for standup/send', () => {
  test('correct input correct output', () => {
    input = {
      channelId: CHANNELID,
      length: 1
    };
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN1);

    // sleep(500)

    input = {
      channelId: CHANNELID,
      message: TEST_MESSAGE
    };

    result = sendReqParseRes('post', STANDUP_SEND, input, TOKEN1);

    expect(result.statusCode).toBe(200);
    expect(result.return).toStrictEqual({});
    sleep(1000);
  });

  test('channelId does not refer to a valid channel', () => {
    input = {
      channelId: TEST_INVALID_CHANNELID,
      message: TEST_MESSAGE
    };
    result = sendReqParseRes('post', STANDUP_SEND, input, TOKEN1);

    expect(result.statusCode).toBe(400);
    expect(result.return.error).toStrictEqual({ message: 'channelId does not refer to a valid channel' });
  });

  test('length of message is over 1000 characters', () => {
    input = {
      channelId: CHANNELID,
      message: VERY_LONG_MESSAGE
    };
    result = sendReqParseRes('post', STANDUP_SEND, input, TOKEN1);

    expect(result.statusCode).toBe(400);
    expect(result.return.error).toStrictEqual({ message: 'length of message is over 1000 characters' });
  });

  test('an active standup is not currently running in the channel', () => {
    input = {
      channelId: CHANNELID,
      message: TEST_MESSAGE
    };
    result = sendReqParseRes('post', STANDUP_SEND, input, TOKEN1);

    expect(result.statusCode).toBe(400);
    expect(result.return.error).toStrictEqual({ message: 'an active standup is not currently running in the channel' });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    input = {
      channelId: CHANNELID,
      length: 1
    };
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN1);

    input = {
      channelId: CHANNELID,
      message: TEST_MESSAGE
    };
    result = sendReqParseRes('post', STANDUP_SEND, input, TOKEN2);

    expect(result.statusCode).toBe(403);
    expect(result.return.error).toStrictEqual({ message: 'channelId is valid and the authorised user is not a member of the channel' });
    sleep(2000);
  });
});

describe('HTTP tests for standup/active', () => {
  test('correct input correct return (true)', () => {
    input = {
      channelId: CHANNELID,
      length: 1
    };
    result = sendReqParseRes('post', STANDUP_START, input, TOKEN1);
    const timeFinish = Math.round((new Date()).getTime() / 1000) + input.length - 3;

    sleep(500);

    input = {
      channelId: CHANNELID
    };
    result = sendReqParseRes('get', STANDUP_ACTIVE, input, TOKEN1);

    expect(result.statusCode).toBe(200);
    expect(result.return).toStrictEqual({
      isActive: true,
      timeFinish: expect.any(Number)
    });
    expect(result.return.timeFinish).toBeGreaterThanOrEqual(timeFinish);
    sleep(500);
  });

  test('correct input correct return (false)', () => {
    input = {
      channelId: CHANNELID
    };
    result = sendReqParseRes('get', STANDUP_ACTIVE, input, TOKEN1);

    expect(result.statusCode).toBe(200);
    expect(result.return).toStrictEqual({
      isActive: false,
      timeFinish: null
    });
  });

  test('channelId does not refer to a valid channel', () => {
    input = {
      channelId: TEST_INVALID_CHANNELID
    };
    result = sendReqParseRes('get', STANDUP_ACTIVE, input, TOKEN1);

    expect(result.statusCode).toBe(400);
    expect(result.return.error).toStrictEqual({ message: 'channelId does not refer to a valid channel' });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    input = {
      channelId: CHANNELID
    };
    result = sendReqParseRes('get', STANDUP_ACTIVE, input, TOKEN2);

    expect(result.statusCode).toBe(403);
    expect(result.return.error).toStrictEqual({ message: 'channelId is valid and the authorised user is not a member of the channel' });
  });
});
