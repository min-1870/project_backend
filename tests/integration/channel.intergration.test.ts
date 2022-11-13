import { authResponse, channelId, channelMessagesOutput } from '../../src/types';
import {AUTH_REGISTER, CHANNELS_CREATE, CHANNEL_ADD_OWNER, CHANNEL_DETAILS, CHANNEL_INVITE, CHANNEL_JOIN, CHANNEL_LEAVE, CHANNEL_MESSAGES, CHANNEL_REMOVE_OWNER, clearDataForTest, MESSAGE_SEND} from '../testBase';
import {
  OK,
  parseJsonResponse,
  sendDeleteRequestToEndpoint,
  sendGetRequestToEndpoint,
  sendPostRequestToEndpoint
} from './integrationTestUtils';

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
const PRIVATE_CHANNEL_NAME = 'Test public channel';

let privateChannelCreatorToken: string;
let publicChannelCreatorToken: string;
let globalOwnerToken: string;
let privateChannelCreatorUserId: number;
let publicChannelCreatorUserId: number;
let globalOwnerUserId: number;

let publicChannelId: number;
let privateChannelId: number;

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
});

describe('HTTP tests for channel/messages', () => {
  test('channelMessages invalid channelId throws error', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: 99999999,
      start: 0,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelMessages start is greater than the total messages number in channel throws error', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start: 99999999,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelMessages not a member of private channel throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: privateChannelId,
      start: 0,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelMessages not a member of public channel throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start: 0,
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelMessages with invalid token throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start: 0,
    }, '9312423avbad token');

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelMessages public channel success', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start: 0,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('channelMessages private channel success', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: privateChannelId,
      start: 0,
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('channelMessages global owner not a member of public channel throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start: 0,
    }, globalOwnerToken)

    expect(res.statusCode).toBe(403);
  });

  test('channelMessages global owner not a member of private channel throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: privateChannelId,
      start: 0,
    }, globalOwnerToken);

    expect(res.statusCode).toBe(403);
  });

  test('channelMessages more than 50 messages success', () => {
    let expectedMessages = []
    for(let i = 0; i < 100; i++) {
      expectedMessages.push(`hello ${i}`)
      sendPostRequestToEndpoint(MESSAGE_SEND, {
        channelId: publicChannelId,
        message: `hello ${i}`
      },
      publicChannelCreatorToken)
    }

    const start = 0;
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    let resBody = parseJsonResponse(res) as unknown as channelMessagesOutput
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: expect.any(Array),
      start,
      end: start + 50
    });
    expectedMessages = [...expectedMessages].reverse().slice(start, start + 50)
    const actualMessages = resBody.messages.map(m => m.message)
    expect(expectedMessages).toStrictEqual(actualMessages)
  });

  test('channelMessages less than 50 messages success', () => {
    let expectedMessages = []
    for(let i = 0; i < 11; i++) {
      expectedMessages.push(`hello ${i}`)

      sendPostRequestToEndpoint(MESSAGE_SEND,
        {
          channelId: publicChannelId,
          message: `hello ${i}`
        },
        publicChannelCreatorToken
      )
    }

    const start = 0;
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start
    }, publicChannelCreatorToken);

    expect(parseJsonResponse(res)).toStrictEqual({
      messages: expect.any(Array),
      start,
      end: -1
    });
    let resBody = parseJsonResponse(res) as unknown as channelMessagesOutput
    expectedMessages = expectedMessages.slice(0, 11).reverse()
    const actualMessages = resBody.messages.map(m => m.message)
    expect(expectedMessages).toStrictEqual(actualMessages)
  });

  test('channelMessages start from middle more than 50 messages success', () => {
    let expectedMessages = []
    for(let i = 0; i < 100; i++) {
      expectedMessages.push(`hello ${i}`)
      let res = sendPostRequestToEndpoint(MESSAGE_SEND, {
        channelId: publicChannelId,
        message: `hello ${i}`
      }, publicChannelCreatorToken)
      expect(res.statusCode).toBe(OK)
    }

    const start = 11;
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start
    },
    publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expectedMessages = expectedMessages.slice().reverse().slice(start, start + 50),
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: expect.any(Array),
      start,
      end: start + 50
    });
    let resBody = parseJsonResponse(res) as unknown as channelMessagesOutput
    const actualMessages = resBody.messages.map(m => m.message)
    expect(expectedMessages).toStrictEqual(actualMessages)
  });

  test('channelMessages start from middle less than 50 messages success', () => {
    let expectedMessages = []
    for(let i = 0; i < 11; i++) {
      expectedMessages.push(`hello ${i}`)
      let res = sendPostRequestToEndpoint(MESSAGE_SEND,
        {
           channelId: publicChannelId,
            message: `hello ${i}`
          },
        publicChannelCreatorToken)
      expect(res.statusCode).toBe(OK)
    }

    const start = 3;
    const res = sendGetRequestToEndpoint(CHANNEL_MESSAGES, {
      channelId: publicChannelId,
      start
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      messages: expect.any(Array),
      start,
      end: -1
    });
    let resBody = parseJsonResponse(res) as unknown as channelMessagesOutput
    expectedMessages = [...expectedMessages].reverse().slice(3)
    const actualMessages = resBody.messages.map(m => m.message)
    expect(expectedMessages).toStrictEqual(actualMessages)
  });
});

describe('HTTP tests for channel/join', () => {
  test('channelJoin invalid channel ID throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: 99999999,
    },
    privateChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelJoin already a memeber throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: publicChannelId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelJoin non-global owner join private channel throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: privateChannelId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelJoin invalid token throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: publicChannelId,
    }, 'some bad token');

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelJoin non-global owner join public channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: publicChannelId,
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelJoin global owner join public channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: publicChannelId,
    }, globalOwnerToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelJoin global owner join private channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: privateChannelId,
    }, globalOwnerToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('HTTP tests for channel/invite', () => {
  let normalUserId: number;
  let normalUserToken: string;
  const NORMAL_USER_EMAIL = 'imnormnal@gmail.com'
  const NORMAL_USER_PW = 'imnorm233'
  const NORMAL_USER_NAME_FIRST = 'normalpers'
  const NORMAL_USER_NAME_LAST = 'ffas'
  beforeEach(() => {
    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: NORMAL_USER_EMAIL,
      password: NORMAL_USER_PW,
      nameFirst: NORMAL_USER_NAME_FIRST,
      nameLast: NORMAL_USER_NAME_LAST
    });
    let jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    normalUserId = jsonResponse.authUserId;
    normalUserToken = jsonResponse.token;
  });

  test('channelInvite invalid channel ID throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: 999993123111999,
      uId: normalUserId,
    },
    privateChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelInvite invalid uId throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: 99999999,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelInvite invited uId is already a member throws error.', () => {
    let res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(200);

    res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelInvite invited uId is already an owner throws error.', () => {
    let res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelCreatorUserId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(200);

    res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: publicChannelCreatorUserId,
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelInvite inviter is not a member of public channel throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: normalUserId,
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelInvite inviter is not a member of private channel throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: normalUserId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelInvite invitor invalid token throws fobidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: normalUserId,
    }, 'some bad token');

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelInvite invite normal user to public channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: normalUserId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelInvite invite normal user to private channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: normalUserId,
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelInvite invite global owner to public channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: globalOwnerUserId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelInvite invite global owner to private channel success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: globalOwnerUserId,
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelInvite global owner not a member invite to public channel throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: normalUserId,
    }, globalOwnerToken);

    expect(res.statusCode).toBe(403);
  });

  test('channelInvite global owner not a member invite to private channel throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: normalUserId,
    }, globalOwnerToken);

    expect(res.statusCode).toBe(403);
  });

  test('channelInvite normal member invite to public channel throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: globalOwnerUserId,
    }, normalUserToken);

    expect(res.statusCode).toBe(403);
  });

  test('channelInvite normal member invite to private channel throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: globalOwnerUserId,
    }, normalUserToken);

    expect(res.statusCode).toBe(403);
  });

  test('channelInvite global owner added as a member then can invite in private channel success', () => {
    let res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: globalOwnerUserId,
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(OK);

    res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: normalUserId,
    }, globalOwnerToken);

    expect(res.statusCode).toBe(OK);
  });

  test('channelInvite global owner added as a member then can invite in public channel success', () => {
    let res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: globalOwnerUserId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);

    res = sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: normalUserId,
    }, globalOwnerToken);

    expect(res.statusCode).toBe(OK);
  });
});

describe('HTTP tests for channel/details', () => {
  test('channelDetails caller not a member of channel throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      channelId: publicChannelId
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelDetails invalid channel ID throws error', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      channelId: 999999999999999
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelDetails invalid token throws forbidden', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      channelId: publicChannelId,
    }, 'bad token here');

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelDetails public channel success', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      channelId: publicChannelId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true,
      ownerMembers: [{
        email: PUBLIC_USER_EMAIL,
        handleStr: expect.any(String),
        nameFirst: PUBLIC_USER_NAME_FIRST,
        nameLast: PUBLIC_USER_NAME_LAST,
        uId: publicChannelCreatorUserId
      }],
      allMembers: [{
        email: PUBLIC_USER_EMAIL,
        handleStr: expect.any(String),
        nameFirst: PUBLIC_USER_NAME_FIRST,
        nameLast: PUBLIC_USER_NAME_LAST,
        uId: publicChannelCreatorUserId
      }]
    });
  });

  test('channelDetails private channel success', () => {
    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      channelId: privateChannelId
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      name: PRIVATE_CHANNEL_NAME,
      isPublic: false,
      ownerMembers: [{
        email: PRIVATE_USER_EMAIL,
        handleStr: expect.any(String),
        nameFirst: PRIVATE_USER_NAME_FIRST,
        nameLast: PRIVATE_USER_NAME_LAST,
        uId: privateChannelCreatorUserId
      }],
      allMembers: [{
        email: PRIVATE_USER_EMAIL,
        handleStr: expect.any(String),
        nameFirst: PRIVATE_USER_NAME_FIRST,
        nameLast: PRIVATE_USER_NAME_LAST,
        uId: privateChannelCreatorUserId
      }]
    });
  });

  test('channelDetails after invite success', () => {
    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: globalOwnerUserId,
    }, privateChannelCreatorToken);

    const res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      channelId: privateChannelId
    }, globalOwnerToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      name: PRIVATE_CHANNEL_NAME,
      isPublic: false,
      ownerMembers: [{
        email: PRIVATE_USER_EMAIL,
        handleStr: expect.any(String),
        nameFirst: PRIVATE_USER_NAME_FIRST,
        nameLast: PRIVATE_USER_NAME_LAST,
        uId: privateChannelCreatorUserId
      }],
      allMembers: [
        {
          email: PRIVATE_USER_EMAIL,
          handleStr: expect.any(String),
          nameFirst: PRIVATE_USER_NAME_FIRST,
          nameLast: PRIVATE_USER_NAME_LAST,
          uId: privateChannelCreatorUserId
        },
        {
          email: GLOBAL_USER_EMAIL,
          handleStr: expect.any(String),
          nameFirst: GLOBAL_USER_NAME_FIRST,
          nameLast: GLOBAL_USER_NAME_LAST,
          uId: globalOwnerUserId
        }
    ]
    });
  })
});

describe('HTTP tests for channel/addowner', () => {
  let normalUserId: number;

  const NORMAL_USER_EMAIL = 'imnormnal@gmail.com'
  const NORMAL_USER_PW = 'imnorm233'
  const NORMAL_USER_NAME_FIRST = 'normalpers'
  const NORMAL_USER_NAME_LAST = 'ffas'

  let publicChannelMemberId;
  let privateChannelMemberId;

  beforeEach(() => {
    publicChannelMemberId = privateChannelCreatorUserId
    privateChannelMemberId = publicChannelCreatorUserId

    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: NORMAL_USER_EMAIL,
      password: NORMAL_USER_PW,
      nameFirst: NORMAL_USER_NAME_FIRST,
      nameLast: NORMAL_USER_NAME_LAST
    });
    let jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    normalUserId = jsonResponse.authUserId;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: publicChannelMemberId
    }, publicChannelCreatorToken)
    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: privateChannelMemberId
    }, privateChannelCreatorToken)
  });

  test('channelAddOwner add member to public channel owner success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelMemberId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelAddOwner add member to private channel owner successful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: privateChannelId,
      uId: privateChannelMemberId
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelAddOwner add non-member global owner to private channel throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: privateChannelId,
      uId: globalOwnerUserId
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(400);
  });

  test('channelAddOwner add non-member global owner to public channel throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: publicChannelId,
      uId: globalOwnerUserId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
  });

  test('channelAddOwner add non-member to private channel throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: privateChannelId,
      uId: normalUserId
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(400);
  });

  test('channelAddOwner add non-member public channel throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: publicChannelId,
      uId: normalUserId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
  });

  test('channelAddOwner global owner as adder not a member throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelMemberId
    }, globalOwnerToken);

    expect(res.statusCode).toBe(403);
  })

  test('channelAddOwner invalid channel ID throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: 5676879809,
      uId: publicChannelMemberId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelAddOwner existing owner throws error', () => {
    let res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelMemberId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);

    res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelMemberId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelAddOwner invalid uId throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: privateChannelId,
      uId: 2222222
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
});

describe('HTTP tests for channel/leave', () => {
  let normalUserId: number;
  let normalUserToken: string;
  const NORMAL_USER_EMAIL = 'imnormnal@gmail.com'
  const NORMAL_USER_PW = 'imnorm233'
  const NORMAL_USER_NAME_FIRST = 'normalpers'
  const NORMAL_USER_NAME_LAST = 'ffas'

  let publicChannelMemberId;
  let publicChannelMemberToken;

  let privateChannelMemberId;
  let privateChannelMemberToken;
  beforeEach(() => {
    publicChannelMemberId = privateChannelCreatorUserId;
    publicChannelMemberToken = privateChannelCreatorToken;

    privateChannelMemberId = publicChannelCreatorUserId;
    privateChannelMemberToken = publicChannelCreatorToken;

    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: NORMAL_USER_EMAIL,
      password: NORMAL_USER_PW,
      nameFirst: NORMAL_USER_NAME_FIRST,
      nameLast: NORMAL_USER_NAME_LAST
    });
    let jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    normalUserId = jsonResponse.authUserId;
    normalUserToken = jsonResponse.token;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: publicChannelMemberId
    }, publicChannelCreatorToken)
    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: privateChannelId,
      uId: privateChannelMemberId
    }, privateChannelCreatorToken)
  });

  test('channelLeave invalid channel ID throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      channelId: 99999999,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelLeave not a member of channel throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      channelId: publicChannelId,
    }, normalUserToken);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelLeave invalid token throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      channelId: publicChannelId,
    }, 'bad token lol');

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelLeave public channel member leave succesful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      channelId: publicChannelId,
    }, publicChannelMemberToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelLeave private channel member leave succesful', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      channelId: privateChannelId,
    }, privateChannelMemberToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelLeave only owners leave channel remains', () => {
    let res = sendPostRequestToEndpoint(CHANNEL_LEAVE, {
      channelId: publicChannelId,
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);

    res = sendGetRequestToEndpoint(CHANNEL_DETAILS, {
      channelId: publicChannelId
    }, publicChannelMemberToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      name: PUBLIC_CHANNEL_NAME,
      isPublic: true,
      ownerMembers: [],
      allMembers: [{
        email: expect.any(String),
        handleStr: expect.any(String),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        uId: publicChannelMemberId
      }]
    });
  });
});

describe('HTTP tests for channel/removeowner', () => {
  let normalUserId: number;
  let normalUserToken: string;
  const NORMAL_USER_EMAIL = 'imnormnal@gmail.com'
  const NORMAL_USER_PW = 'imnorm233'
  const NORMAL_USER_NAME_FIRST = 'normalpers'
  const NORMAL_USER_NAME_LAST = 'ffas'

  let publicChannelMemberId;
  let secondPublicChannelOwnerToken;

  let privateChannelMemberId;
  let privateChannelMemberToken;
  beforeEach(() => {
    publicChannelMemberId = privateChannelCreatorUserId;
    secondPublicChannelOwnerToken = privateChannelCreatorToken;

    privateChannelMemberId = publicChannelCreatorUserId;
    privateChannelMemberToken = publicChannelCreatorToken;

    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: NORMAL_USER_EMAIL,
      password: NORMAL_USER_PW,
      nameFirst: NORMAL_USER_NAME_FIRST,
      nameLast: NORMAL_USER_NAME_LAST
    });
    let jsonResponse = (parseJsonResponse(res) as unknown as authResponse);
    normalUserId = jsonResponse.authUserId;
    normalUserToken = jsonResponse.token;

    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: publicChannelMemberId
    }, publicChannelCreatorToken)
    sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelMemberId
    }, publicChannelCreatorToken)
    sendPostRequestToEndpoint(CHANNEL_INVITE, {
      channelId: publicChannelId,
      uId: privateChannelMemberId
    }, privateChannelCreatorToken)
  });

  test('channelRemoveOwner self remove success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelCreatorUserId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelRemoveOwner remove another user success', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelCreatorUserId
    }, secondPublicChannelOwnerToken);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('channelRemoveOwner non-member global owner remove another owner throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelCreatorToken
    }, globalOwnerToken);

    expect(res.statusCode).toBe(403);
  });

  test('channelRemoveOwner owner global owner remove another owner success', () => {
    sendPostRequestToEndpoint(CHANNEL_JOIN, {
      channelId: publicChannelId
    }, globalOwnerToken)
    let res = sendPostRequestToEndpoint(CHANNEL_ADD_OWNER, {
      channelId: publicChannelId,
      uId: globalOwnerUserId
    }, globalOwnerToken)

    expect(res.statusCode).toBe(200);

    res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: publicChannelId,
      uId: publicChannelCreatorUserId
    }, globalOwnerToken);

    expect(res.statusCode).toBe(200);
  });

  test('channelRemoveOwner invalid channel ID throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: 22222222,
      uId: publicChannelCreatorUserId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelRemoveOwner invalid uId throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: publicChannelId,
      uId: 123123123
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelRemoveOwner target not a member throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: publicChannelId,
      uId: normalUserId
    }, publicChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelRemoveOwner target not an owner throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: privateChannelId,
      uId: privateChannelMemberId
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelRemoveOwner only owner left throws error', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: privateChannelId,
      uId: privateChannelCreatorUserId
    }, privateChannelCreatorToken);

    expect(res.statusCode).toBe(400);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });

  test('channelOwner remover has no owner permission throws forbidden', () => {
    const res = sendPostRequestToEndpoint(CHANNEL_REMOVE_OWNER, {
      channelId: privateChannelId,
      uId: privateChannelCreatorToken
    }, privateChannelMemberToken);

    expect(res.statusCode).toBe(403);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: {
        message: expect.any(String)
      }
    });
  });
});
