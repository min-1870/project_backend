import { channelJoinV1, channelInviteV1, channelMessagesV1, channelDetailsV1, channelAddOwnersV1 } from '../src/channel';
import { clearV1 } from '../src/other';
import { getData, setData } from '../src/dataStore';
import { authRegisterV1 } from '../src/auth';
import { authUserId, channel, channelId, dataStoreChannel, error, user } from '../src/types';
import { channelsCreateV1 } from '../src/channels';

const TEST_USER_1_EMAIL = 'TEST1@gmail.com';
const TEST_USER_2_EMAIL = 'TEST2@gmail.com';
const TEST_USER_3_EMAIL = 'TEST3@gmail.com';

const TEST_PASSWORD_1 = 'fasdfadsff1';
const TEST_PASSWORD_2 = 'fasdfadsff2';
const TEST_PASSWORD_3 = 'fasdfadsff3';

const TEST_NAME_FIRST_1 = 'fasdfds';
const TEST_NAME_FIRST_2 = 'aasdfds';
const TEST_NAME_FIRST_3 = 'afsdfds';

const TEST_NAME_LAST_1 = 'aaaa';
const TEST_NAME_LAST_2 = 'gggg';
const TEST_NAME_LAST_3 = 'ahhfds';

let testUserId1: number; // This user begins with owning a private and a public channel.
let testUserId2: number; // This user begins with owning no channel.
let testUserId3: number; // This user begins with owning no channel, but is global owner.

let publicChannelId: number;
let privateChannelId: number;

const PUBLIC_CHANNEL_NAME = 'publicchanneL';
const PRIVATE_CHANNEL_NAME = 'privateChannel';

let testUser1: user;
let testUser2: user;
let testUser3: user;

beforeEach(() => {
  clearV1();

  // Register user 3 first to make them a global owner.
  const user3RegisterResult = authRegisterV1(TEST_USER_3_EMAIL, TEST_PASSWORD_3, TEST_NAME_FIRST_3, TEST_NAME_LAST_3) as authUserId;
  testUserId3 = user3RegisterResult.authUserId;

  const user1RegisterResult = authRegisterV1(TEST_USER_1_EMAIL, TEST_PASSWORD_1, TEST_NAME_FIRST_1, TEST_NAME_LAST_1) as authUserId;
  testUserId1 = user1RegisterResult.authUserId;

  const user2RegisterResult = authRegisterV1(TEST_USER_2_EMAIL, TEST_PASSWORD_2, TEST_NAME_FIRST_2, TEST_NAME_LAST_2) as authUserId;
  testUserId2 = user2RegisterResult.authUserId;

  const channelCreateResult1 = channelsCreateV1(testUserId1, PUBLIC_CHANNEL_NAME, true) as channelId;
  publicChannelId = channelCreateResult1.channelId;
  const channelCreateResult2 = channelsCreateV1(testUserId1, PRIVATE_CHANNEL_NAME, false) as channelId;
  privateChannelId = channelCreateResult2.channelId;

  testUser1 = {
    uId: testUserId1,
    nameFirst: TEST_NAME_FIRST_1,
    nameLast: TEST_NAME_LAST_1,
    handleStr: TEST_NAME_FIRST_1 + TEST_NAME_LAST_1,
    email: TEST_USER_1_EMAIL
  };

  testUser2 = {
    uId: testUserId2,
    nameFirst: TEST_NAME_FIRST_2,
    nameLast: TEST_NAME_LAST_2,
    handleStr: TEST_NAME_FIRST_2 + TEST_NAME_LAST_2,
    email: TEST_USER_2_EMAIL
  };

  testUser3 = {
    uId: testUserId3,
    nameFirst: TEST_NAME_FIRST_3,
    nameLast: TEST_NAME_LAST_3,
    handleStr: TEST_NAME_FIRST_3 + TEST_NAME_LAST_3,
    email: TEST_USER_3_EMAIL
  };
});

describe('Test set for the function channelJoinV1', () => {
  test('not valid User ID fails', () => {
    expect(channelJoinV1(999, publicChannelId)).toStrictEqual({ error: 'Invalid token' });
  });

  test('not valid channel ID fails', () => {
    expect(channelJoinV1(testUserId2, 999)).toStrictEqual({ error: 'Invalid channel ID' });
  });

  test('normal user join private channel fails', () => {
    expect(channelJoinV1(testUserId2, privateChannelId)).toStrictEqual({ error: 'Permission denied, non-global owner is not allowed to access private channel' });
  });

  test('globalowner user join private channel success', () => {
    expect(channelJoinV1(testUserId3, privateChannelId)).toStrictEqual({});

    const result = channelDetailsV1(testUserId3, privateChannelId) as channel;
    expect(result.allMembers).toStrictEqual([testUser1, testUser3]);
  });

  test('normal user join public channel success', () => {
    expect(channelJoinV1(testUserId2, publicChannelId)).toStrictEqual({});

    const result = channelDetailsV1(testUserId2, publicChannelId) as channel;
    expect(result.allMembers).toStrictEqual([testUser1, testUser2]);
  });
});

describe('Test set for the function channelInviteV1', () => {
  test('channelId does not refer to a valid channel', () => {
    expect(channelInviteV1(testUserId1, 765, testUserId2)).toStrictEqual({ error: 'Invalid channel ID' });
  });

  test('authUserId is invalid', () => {
    expect(channelInviteV1(639, publicChannelId, testUserId2)).toStrictEqual({ error: 'Invalid token' });
  });

  test('uId is invalid', () => {
    expect(channelInviteV1(testUserId1, publicChannelId, 243)).toStrictEqual({ error: 'Invalid user ID' });
  });

  test('uId refers to a user who is already a member of the channel', () => {
    expect(channelInviteV1(testUserId1, publicChannelId, testUserId1)).toStrictEqual({ error: 'User already in channel' });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    expect(channelInviteV1(testUserId2, publicChannelId, testUserId3)).toStrictEqual({ error: 'Permission denied, non-channel user cannot invite other user to the channel' });
  });

  test('successful public channelInviteV1', () => {
    expect(channelInviteV1(testUserId1, publicChannelId, testUserId2)).toStrictEqual({});
  });

  test('successful private channelInviteV1', () => {
    expect(channelInviteV1(testUserId1, privateChannelId, testUserId2)).toStrictEqual({});
  });
});

describe('Test set for the function channelMessagesV1', () => {
  const testUser = {
    uId: 1,
    nameFirst: 'Adam',
    nameLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
    password: 'test123',
    sessionTokens: [] as string[],
    isGlobalOwner: false
  };
  const testUserOutput = {
    uId: 1,
    nameFirst: 'Adam',
    nameLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
  };
  const testUser2 = {
    uId: 2,
    nameFirst: 'Adamm',
    nameLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adammjohnston',
    password: 'test1234',
    sessionTokens: [] as string[],
    isGlobalOwner: false
  };
  const testChannel = {
    channelId: 1,
    isPublic: true,
    name: 'testChannel',
    ownerMembers: [testUserOutput],
    allMembers: [testUserOutput],
    messages: [{ messageId: 0, uId: 0, message: '0', timeSent: 0 }, { messageId: 1, uId: 1, message: '1', timeSent: 1 }, { messageId: 2, uId: 2, message: '2', timeSent: 2 }, { messageId: 3, uId: 3, message: '3', timeSent: 3 }, { messageId: 4, uId: 4, message: '4', timeSent: 4 }, { messageId: 5, uId: 5, message: '5', timeSent: 5 }, { messageId: 6, uId: 6, message: '6', timeSent: 6 }, { messageId: 7, uId: 7, message: '7', timeSent: 7 }, { messageId: 8, uId: 8, message: '8', timeSent: 8 }, { messageId: 9, uId: 9, message: '9', timeSent: 9 }, { messageId: 10, uId: 10, message: '10', timeSent: 10 }, { messageId: 11, uId: 11, message: '11', timeSent: 11 }, { messageId: 12, uId: 12, message: '12', timeSent: 12 }, { messageId: 13, uId: 13, message: '13', timeSent: 13 }, { messageId: 14, uId: 14, message: '14', timeSent: 14 }, { messageId: 15, uId: 15, message: '15', timeSent: 15 }, { messageId: 16, uId: 16, message: '16', timeSent: 16 }, { messageId: 17, uId: 17, message: '17', timeSent: 17 }, { messageId: 18, uId: 18, message: '18', timeSent: 18 }, { messageId: 19, uId: 19, message: '19', timeSent: 19 }, { messageId: 20, uId: 20, message: '20', timeSent: 20 }, { messageId: 21, uId: 21, message: '21', timeSent: 21 }, { messageId: 22, uId: 22, message: '22', timeSent: 22 }, { messageId: 23, uId: 23, message: '23', timeSent: 23 }, { messageId: 24, uId: 24, message: '24', timeSent: 24 }, { messageId: 25, uId: 25, message: '25', timeSent: 25 }, { messageId: 26, uId: 26, message: '26', timeSent: 26 }, { messageId: 27, uId: 27, message: '27', timeSent: 27 }, { messageId: 28, uId: 28, message: '28', timeSent: 28 }, { messageId: 29, uId: 29, message: '29', timeSent: 29 }, { messageId: 30, uId: 30, message: '30', timeSent: 30 }, { messageId: 31, uId: 31, message: '31', timeSent: 31 }, { messageId: 32, uId: 32, message: '32', timeSent: 32 }, { messageId: 33, uId: 33, message: '33', timeSent: 33 }, { messageId: 34, uId: 34, message: '34', timeSent: 34 }, { messageId: 35, uId: 35, message: '35', timeSent: 35 }, { messageId: 36, uId: 36, message: '36', timeSent: 36 }, { messageId: 37, uId: 37, message: '37', timeSent: 37 }, { messageId: 38, uId: 38, message: '38', timeSent: 38 }, { messageId: 39, uId: 39, message: '39', timeSent: 39 }, { messageId: 40, uId: 40, message: '40', timeSent: 40 }, { messageId: 41, uId: 41, message: '41', timeSent: 41 }, { messageId: 42, uId: 42, message: '42', timeSent: 42 }, { messageId: 43, uId: 43, message: '43', timeSent: 43 }, { messageId: 44, uId: 44, message: '44', timeSent: 44 }, { messageId: 45, uId: 45, message: '45', timeSent: 45 }, { messageId: 46, uId: 46, message: '46', timeSent: 46 }, { messageId: 47, uId: 47, message: '47', timeSent: 47 }, { messageId: 48, uId: 48, message: '48', timeSent: 48 }, { messageId: 49, uId: 49, message: '49', timeSent: 49 }, { messageId: 50, uId: 50, message: '50', timeSent: 50 }, { messageId: 51, uId: 51, message: '51', timeSent: 51 }, { messageId: 52, uId: 52, message: '52', timeSent: 52 }, { messageId: 53, uId: 53, message: '53', timeSent: 53 }, { messageId: 54, uId: 54, message: '54', timeSent: 54 }, { messageId: 55, uId: 55, message: '55', timeSent: 55 }, { messageId: 56, uId: 56, message: '56', timeSent: 56 }, { messageId: 57, uId: 57, message: '57', timeSent: 57 }, { messageId: 58, uId: 58, message: '58', timeSent: 58 }, { messageId: 59, uId: 59, message: '59', timeSent: 59 }, { messageId: 60, uId: 60, message: '60', timeSent: 60 }, { messageId: 61, uId: 61, message: '61', timeSent: 61 }, { messageId: 62, uId: 62, message: '62', timeSent: 62 }, { messageId: 63, uId: 63, message: '63', timeSent: 63 }, { messageId: 64, uId: 64, message: '64', timeSent: 64 }, { messageId: 65, uId: 65, message: '65', timeSent: 65 }, { messageId: 66, uId: 66, message: '66', timeSent: 66 }, { messageId: 67, uId: 67, message: '67', timeSent: 67 }, { messageId: 68, uId: 68, message: '68', timeSent: 68 }, { messageId: 69, uId: 69, message: '69', timeSent: 69 }, { messageId: 70, uId: 70, message: '70', timeSent: 70 }, { messageId: 71, uId: 71, message: '71', timeSent: 71 }, { messageId: 72, uId: 72, message: '72', timeSent: 72 }, { messageId: 73, uId: 73, message: '73', timeSent: 73 }, { messageId: 74, uId: 74, message: '74', timeSent: 74 }, { messageId: 75, uId: 75, message: '75', timeSent: 75 }, { messageId: 76, uId: 76, message: '76', timeSent: 76 }, { messageId: 77, uId: 77, message: '77', timeSent: 77 }, { messageId: 78, uId: 78, message: '78', timeSent: 78 }, { messageId: 79, uId: 79, message: '79', timeSent: 79 }, { messageId: 80, uId: 80, message: '80', timeSent: 80 }, { messageId: 81, uId: 81, message: '81', timeSent: 81 }, { messageId: 82, uId: 82, message: '82', timeSent: 82 }, { messageId: 83, uId: 83, message: '83', timeSent: 83 }, { messageId: 84, uId: 84, message: '84', timeSent: 84 }, { messageId: 85, uId: 85, message: '85', timeSent: 85 }, { messageId: 86, uId: 86, message: '86', timeSent: 86 }, { messageId: 87, uId: 87, message: '87', timeSent: 87 }, { messageId: 88, uId: 88, message: '88', timeSent: 88 }, { messageId: 89, uId: 89, message: '89', timeSent: 89 }, { messageId: 90, uId: 90, message: '90', timeSent: 90 }, { messageId: 91, uId: 91, message: '91', timeSent: 91 }, { messageId: 92, uId: 92, message: '92', timeSent: 92 }, { messageId: 93, uId: 93, message: '93', timeSent: 93 }, { messageId: 94, uId: 94, message: '94', timeSent: 94 }, { messageId: 95, uId: 95, message: '95', timeSent: 95 }, { messageId: 96, uId: 96, message: '96', timeSent: 96 }, { messageId: 97, uId: 97, message: '97', timeSent: 97 }, { messageId: 98, uId: 98, message: '98', timeSent: 98 }, { messageId: 99, uId: 99, message: '99', timeSent: 99 }, { messageId: 100, uId: 100, message: '100', timeSent: 100 }, { messageId: 101, uId: 101, message: '101', timeSent: 101 }, { messageId: 102, uId: 102, message: '102', timeSent: 102 }, { messageId: 103, uId: 103, message: '103', timeSent: 103 }, { messageId: 104, uId: 104, message: '104', timeSent: 104 }, { messageId: 105, uId: 105, message: '105', timeSent: 105 }, { messageId: 106, uId: 106, message: '106', timeSent: 106 }, { messageId: 107, uId: 107, message: '107', timeSent: 107 }, { messageId: 108, uId: 108, message: '108', timeSent: 108 }, { messageId: 109, uId: 109, message: '109', timeSent: 109 }, { messageId: 110, uId: 110, message: '110', timeSent: 110 }, { messageId: 111, uId: 111, message: '111', timeSent: 111 }, { messageId: 112, uId: 112, message: '112', timeSent: 112 }, { messageId: 113, uId: 113, message: '113', timeSent: 113 }, { messageId: 114, uId: 114, message: '114', timeSent: 114 }, { messageId: 115, uId: 115, message: '115', timeSent: 115 }, { messageId: 116, uId: 116, message: '116', timeSent: 116 }, { messageId: 117, uId: 117, message: '117', timeSent: 117 }, { messageId: 118, uId: 118, message: '118', timeSent: 118 }, { messageId: 119, uId: 119, message: '119', timeSent: 119 }, { messageId: 120, uId: 120, message: '120', timeSent: 120 }, { messageId: 121, uId: 121, message: '121', timeSent: 121 }, { messageId: 122, uId: 122, message: '122', timeSent: 122 }, { messageId: 123, uId: 123, message: '123', timeSent: 123 }]
  };

  beforeEach(() => {
    clearV1();
    const data = getData();
    data.users.push(testUser);
    data.users.push(testUser2);
    data.channels.push(testChannel);

    setData(data);
  });

  test('Checks the function return error for an invalid channelId', () => {
    expect(channelMessagesV1(testUser.uId, 123144, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for bigger or smaller input on the argument start', () => {
    expect(channelMessagesV1(testUser.uId, testChannel.channelId, 1235123)).toStrictEqual({ error: expect.any(String) });
    expect(channelMessagesV1(testUser.uId, testChannel.channelId, -1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for unauthorised user', () => {
    expect(channelMessagesV1(testUser2.uId, testChannel.channelId, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for invalid userId', () => {
    expect(channelMessagesV1(14134124, testChannel.channelId, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return correct message', () => {
    expect(channelMessagesV1(testUser.uId, testChannel.channelId, 0)).toStrictEqual({ messages: [{ messageId: 0, uId: 0, message: '0', timeSent: 0 }, { messageId: 1, uId: 1, message: '1', timeSent: 1 }, { messageId: 2, uId: 2, message: '2', timeSent: 2 }, { messageId: 3, uId: 3, message: '3', timeSent: 3 }, { messageId: 4, uId: 4, message: '4', timeSent: 4 }, { messageId: 5, uId: 5, message: '5', timeSent: 5 }, { messageId: 6, uId: 6, message: '6', timeSent: 6 }, { messageId: 7, uId: 7, message: '7', timeSent: 7 }, { messageId: 8, uId: 8, message: '8', timeSent: 8 }, { messageId: 9, uId: 9, message: '9', timeSent: 9 }, { messageId: 10, uId: 10, message: '10', timeSent: 10 }, { messageId: 11, uId: 11, message: '11', timeSent: 11 }, { messageId: 12, uId: 12, message: '12', timeSent: 12 }, { messageId: 13, uId: 13, message: '13', timeSent: 13 }, { messageId: 14, uId: 14, message: '14', timeSent: 14 }, { messageId: 15, uId: 15, message: '15', timeSent: 15 }, { messageId: 16, uId: 16, message: '16', timeSent: 16 }, { messageId: 17, uId: 17, message: '17', timeSent: 17 }, { messageId: 18, uId: 18, message: '18', timeSent: 18 }, { messageId: 19, uId: 19, message: '19', timeSent: 19 }, { messageId: 20, uId: 20, message: '20', timeSent: 20 }, { messageId: 21, uId: 21, message: '21', timeSent: 21 }, { messageId: 22, uId: 22, message: '22', timeSent: 22 }, { messageId: 23, uId: 23, message: '23', timeSent: 23 }, { messageId: 24, uId: 24, message: '24', timeSent: 24 }, { messageId: 25, uId: 25, message: '25', timeSent: 25 }, { messageId: 26, uId: 26, message: '26', timeSent: 26 }, { messageId: 27, uId: 27, message: '27', timeSent: 27 }, { messageId: 28, uId: 28, message: '28', timeSent: 28 }, { messageId: 29, uId: 29, message: '29', timeSent: 29 }, { messageId: 30, uId: 30, message: '30', timeSent: 30 }, { messageId: 31, uId: 31, message: '31', timeSent: 31 }, { messageId: 32, uId: 32, message: '32', timeSent: 32 }, { messageId: 33, uId: 33, message: '33', timeSent: 33 }, { messageId: 34, uId: 34, message: '34', timeSent: 34 }, { messageId: 35, uId: 35, message: '35', timeSent: 35 }, { messageId: 36, uId: 36, message: '36', timeSent: 36 }, { messageId: 37, uId: 37, message: '37', timeSent: 37 }, { messageId: 38, uId: 38, message: '38', timeSent: 38 }, { messageId: 39, uId: 39, message: '39', timeSent: 39 }, { messageId: 40, uId: 40, message: '40', timeSent: 40 }, { messageId: 41, uId: 41, message: '41', timeSent: 41 }, { messageId: 42, uId: 42, message: '42', timeSent: 42 }, { messageId: 43, uId: 43, message: '43', timeSent: 43 }, { messageId: 44, uId: 44, message: '44', timeSent: 44 }, { messageId: 45, uId: 45, message: '45', timeSent: 45 }, { messageId: 46, uId: 46, message: '46', timeSent: 46 }, { messageId: 47, uId: 47, message: '47', timeSent: 47 }, { messageId: 48, uId: 48, message: '48', timeSent: 48 }, { messageId: 49, uId: 49, message: '49', timeSent: 49 }], start: 0, end: 50 });
    expect(channelMessagesV1(testUser.uId, testChannel.channelId, 50)).toStrictEqual({ messages: [{ messageId: 50, uId: 50, message: '50', timeSent: 50 }, { messageId: 51, uId: 51, message: '51', timeSent: 51 }, { messageId: 52, uId: 52, message: '52', timeSent: 52 }, { messageId: 53, uId: 53, message: '53', timeSent: 53 }, { messageId: 54, uId: 54, message: '54', timeSent: 54 }, { messageId: 55, uId: 55, message: '55', timeSent: 55 }, { messageId: 56, uId: 56, message: '56', timeSent: 56 }, { messageId: 57, uId: 57, message: '57', timeSent: 57 }, { messageId: 58, uId: 58, message: '58', timeSent: 58 }, { messageId: 59, uId: 59, message: '59', timeSent: 59 }, { messageId: 60, uId: 60, message: '60', timeSent: 60 }, { messageId: 61, uId: 61, message: '61', timeSent: 61 }, { messageId: 62, uId: 62, message: '62', timeSent: 62 }, { messageId: 63, uId: 63, message: '63', timeSent: 63 }, { messageId: 64, uId: 64, message: '64', timeSent: 64 }, { messageId: 65, uId: 65, message: '65', timeSent: 65 }, { messageId: 66, uId: 66, message: '66', timeSent: 66 }, { messageId: 67, uId: 67, message: '67', timeSent: 67 }, { messageId: 68, uId: 68, message: '68', timeSent: 68 }, { messageId: 69, uId: 69, message: '69', timeSent: 69 }, { messageId: 70, uId: 70, message: '70', timeSent: 70 }, { messageId: 71, uId: 71, message: '71', timeSent: 71 }, { messageId: 72, uId: 72, message: '72', timeSent: 72 }, { messageId: 73, uId: 73, message: '73', timeSent: 73 }, { messageId: 74, uId: 74, message: '74', timeSent: 74 }, { messageId: 75, uId: 75, message: '75', timeSent: 75 }, { messageId: 76, uId: 76, message: '76', timeSent: 76 }, { messageId: 77, uId: 77, message: '77', timeSent: 77 }, { messageId: 78, uId: 78, message: '78', timeSent: 78 }, { messageId: 79, uId: 79, message: '79', timeSent: 79 }, { messageId: 80, uId: 80, message: '80', timeSent: 80 }, { messageId: 81, uId: 81, message: '81', timeSent: 81 }, { messageId: 82, uId: 82, message: '82', timeSent: 82 }, { messageId: 83, uId: 83, message: '83', timeSent: 83 }, { messageId: 84, uId: 84, message: '84', timeSent: 84 }, { messageId: 85, uId: 85, message: '85', timeSent: 85 }, { messageId: 86, uId: 86, message: '86', timeSent: 86 }, { messageId: 87, uId: 87, message: '87', timeSent: 87 }, { messageId: 88, uId: 88, message: '88', timeSent: 88 }, { messageId: 89, uId: 89, message: '89', timeSent: 89 }, { messageId: 90, uId: 90, message: '90', timeSent: 90 }, { messageId: 91, uId: 91, message: '91', timeSent: 91 }, { messageId: 92, uId: 92, message: '92', timeSent: 92 }, { messageId: 93, uId: 93, message: '93', timeSent: 93 }, { messageId: 94, uId: 94, message: '94', timeSent: 94 }, { messageId: 95, uId: 95, message: '95', timeSent: 95 }, { messageId: 96, uId: 96, message: '96', timeSent: 96 }, { messageId: 97, uId: 97, message: '97', timeSent: 97 }, { messageId: 98, uId: 98, message: '98', timeSent: 98 }, { messageId: 99, uId: 99, message: '99', timeSent: 99 }], start: 50, end: 100 });
    expect(channelMessagesV1(testUser.uId, testChannel.channelId, 100)).toStrictEqual({ messages: [{ messageId: 100, uId: 100, message: '100', timeSent: 100 }, { messageId: 101, uId: 101, message: '101', timeSent: 101 }, { messageId: 102, uId: 102, message: '102', timeSent: 102 }, { messageId: 103, uId: 103, message: '103', timeSent: 103 }, { messageId: 104, uId: 104, message: '104', timeSent: 104 }, { messageId: 105, uId: 105, message: '105', timeSent: 105 }, { messageId: 106, uId: 106, message: '106', timeSent: 106 }, { messageId: 107, uId: 107, message: '107', timeSent: 107 }, { messageId: 108, uId: 108, message: '108', timeSent: 108 }, { messageId: 109, uId: 109, message: '109', timeSent: 109 }, { messageId: 110, uId: 110, message: '110', timeSent: 110 }, { messageId: 111, uId: 111, message: '111', timeSent: 111 }, { messageId: 112, uId: 112, message: '112', timeSent: 112 }, { messageId: 113, uId: 113, message: '113', timeSent: 113 }, { messageId: 114, uId: 114, message: '114', timeSent: 114 }, { messageId: 115, uId: 115, message: '115', timeSent: 115 }, { messageId: 116, uId: 116, message: '116', timeSent: 116 }, { messageId: 117, uId: 117, message: '117', timeSent: 117 }, { messageId: 118, uId: 118, message: '118', timeSent: 118 }, { messageId: 119, uId: 119, message: '119', timeSent: 119 }, { messageId: 120, uId: 120, message: '120', timeSent: 120 }, { messageId: 121, uId: 121, message: '121', timeSent: 121 }, { messageId: 122, uId: 122, message: '122', timeSent: 122 }, { messageId: 123, uId: 123, message: '123', timeSent: 123 }], start: 100, end: -1 });
  });
});

describe('Test set for the function channelDetailsV1', () => {
  const testUser = {
    uId: 1,
    nameFirst: 'Adam',
    nameLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
    password: 'test123'
  };
  const testUserOutput: user = {
    uId: 1,
    nameFirst: 'Adam',
    nameLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
  };
  const testUser2 = {
    uId: 2,
    nameFirst: 'Adam2',
    nameLast: 'Johnston2',
    email: 'test@gmail.com',
    handleStr: 'adam2johnston2',
    password: 'test123'
  };
  const testUser2Output: user = {
    uId: 2,
    nameFirst: 'Adam2',
    nameLast: 'Johnston2',
    email: 'test@gmail.com',
    handleStr: 'adam2johnston2',
  };
  const testChannel: dataStoreChannel = {
    channelId: 1,
    isPublic: true,
    name: 'testChannel',
    ownerMembers: [testUserOutput],
    allMembers: [testUserOutput],
    messages: []
  };
  const testChannel2: dataStoreChannel = {
    channelId: 2,
    isPublic: false,
    name: 'testChannel2',
    ownerMembers: [testUser2Output],
    allMembers: [testUser2Output],
    messages: []
  };

  beforeEach(() => {
    clearV1();
    let data = getData() as any;
    data = {
      users: [
        testUser, testUser2
      ],
      channels: [
        testChannel, testChannel2
      ]
    };
    setData(data);
  });

  test('authUserId and channelId correct for public channel', () => {
    const findingChannelDetails = channelDetailsV1(testUser.uId, testChannel.channelId) as channel;
    expect(findingChannelDetails).toStrictEqual({
      name: testChannel.name,
      isPublic: true,
      ownerMembers: [testUserOutput],
      allMembers: [testUserOutput]
    }
    );
  });

  test('authUserId and channelId correct for private channel', () => {
    const findingChannelDetails = channelDetailsV1(testUser2.uId, testChannel2.channelId) as channel;

    expect(findingChannelDetails).toStrictEqual({
      name: testChannel2.name,
      isPublic: false,
      ownerMembers: [testUser2Output],
      allMembers: [testUser2Output]
    }
    );
  });

  test('channelId does not refer to a valid channel', () => {
    const findingChannelDetails = channelDetailsV1(testUser.uId, 999999);
    expect(findingChannelDetails).toStrictEqual({ error: 'Channel ID does not refer to a valid channel' });
  });

  test('user not a channel member', () => {
    const findingChannelDetails = channelDetailsV1(testUser.uId + 1, testChannel.channelId);
    expect(findingChannelDetails).toStrictEqual({ error: 'User ID is not a member of channel' });
  });

  test('authUserId is invalid', () => {
    const findingChannelDetails = channelDetailsV1(999999, testChannel.channelId);
    expect(findingChannelDetails).toStrictEqual({ error: 'User ID does not exist' });
  });
});

describe('Test set for the function addOwner', () => {
  beforeEach(() => {
    channelJoinV1(testUser2.uId, publicChannelId);
    channelInviteV1(testUser1.uId, privateChannelId, testUser2.uId);
  });

  test('channel owner add new owner to public channel success', () => {
    const addResult = channelAddOwnersV1(testUser1.uId, publicChannelId, testUserId2);

    expect(addResult).toStrictEqual({});

    const detailsResult = channelDetailsV1(testUser1.uId, publicChannelId) as channel;

    expect(detailsResult.ownerMembers).toStrictEqual([testUser1, testUser2]);
    expect(detailsResult.allMembers).toStrictEqual([testUser1, testUser2]);
  });

  test('channel owner add new owner to private channel success', () => {
    const addResult = channelAddOwnersV1(testUser1.uId, privateChannelId, testUserId2);

    expect(addResult).toStrictEqual({});

    const detailsResult = channelDetailsV1(testUser1.uId, privateChannelId) as channel;

    expect(detailsResult.ownerMembers).toStrictEqual([testUser1, testUser2]);
    expect(detailsResult.allMembers).toStrictEqual([testUser1, testUser2]);
  });

  test('global owner add new owner to public channel success', () => {
    const addResult = channelAddOwnersV1(testUserId3, publicChannelId, testUserId2);

    expect(addResult).toStrictEqual({});

    const detailsResult = channelDetailsV1(testUser1.uId, publicChannelId) as channel;

    expect(detailsResult.ownerMembers).toStrictEqual([testUser1, testUser2]);
    expect(detailsResult.allMembers).toStrictEqual([testUser1, testUser2]);
  });

  test('global owner add new owner to private channel success', () => {
    const addResult = channelAddOwnersV1(testUserId3, privateChannelId, testUserId2);

    expect(addResult).toStrictEqual({});

    const detailsResult = channelDetailsV1(testUser1.uId, privateChannelId) as channel;

    expect(detailsResult.ownerMembers).toStrictEqual([testUser1, testUser2]);
    expect(detailsResult.allMembers).toStrictEqual([testUser1, testUser2]);
  });

  test('channel owner add new owner with invalid channel id fails', () => {
    const addResult = channelAddOwnersV1(testUser1.uId, 99999, testUserId2) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('channel owner add new owner to public channel with invalid uId fails', () => {
    const addResult = channelAddOwnersV1(testUser1.uId, publicChannelId, 123908) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('global owner add new owner to public with invalid uId fails', () => {
    const addResult = channelAddOwnersV1(testUser3.uId, publicChannelId, 123908) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('channel owner add new owner to private channel with invalid uId fails', () => {
    const addResult = channelAddOwnersV1(testUser1.uId, privateChannelId, 123908) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('global owner add new owner to private with invalid uId fails', () => {
    const addResult = channelAddOwnersV1(testUser3.uId, privateChannelId, 123908) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('channel owner add new owner to public channel uId not a member fails', () => {
    const user4RegisterResult = authRegisterV1('TEST_4_email@gmail.com', TEST_PASSWORD_3, TEST_NAME_FIRST_3, TEST_NAME_LAST_3) as authUserId;
    const testUserId4 = user4RegisterResult.authUserId;

    const addResult = channelAddOwnersV1(testUser1.uId, publicChannelId, testUserId4) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('channel owner add new owner to private channel uId not a member fails', () => {
    const user4RegisterResult = authRegisterV1('TEST_4_email@gmail.com', TEST_PASSWORD_3, TEST_NAME_FIRST_3, TEST_NAME_LAST_3) as authUserId;
    const testUserId4 = user4RegisterResult.authUserId;

    const addResult = channelAddOwnersV1(testUser1.uId, privateChannelId, testUserId4) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('channel owner add new owner existing owner fails', () => {
    let addResult = channelAddOwnersV1(testUser1.uId, publicChannelId, testUserId2);

    expect(addResult).toStrictEqual({});

    addResult = channelAddOwnersV1(testUser1.uId, publicChannelId, testUserId2);

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });

    const detailsResult = channelDetailsV1(testUser1.uId, publicChannelId) as channel;

    expect(detailsResult.ownerMembers).toStrictEqual([testUser1, testUser2]);
  });

  test('non owner add new owner fails', () => {
    const user4RegisterResult = authRegisterV1('TEST_4_email@gmail.com', TEST_PASSWORD_3, TEST_NAME_FIRST_3, TEST_NAME_LAST_3) as authUserId;
    const testUserId4 = user4RegisterResult.authUserId;

    const addResult = channelAddOwnersV1(testUser2.uId, publicChannelId, testUserId4) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('add owner with invalid authUserId', () => {
    const addResult = channelAddOwnersV1(234234, publicChannelId, testUser2.uId) as error;

    expect(addResult).toStrictEqual({
      error: expect.any(String)
    });
  });
});

// Remove
describe('Test set for the function removeOwner', () => {
  beforeEach(() => {
    channelJoinV1(testUser2.uId, publicChannelId);
    channelInviteV1(testUser1.uId, privateChannelId, testUser2.uId);
  });

  test('channel owner remove owner to public channel success', () => {
    const addResult = channelAddOwnersV1(testUser1.uId, publicChannelId, testUserId2);

    expect(addResult).toStrictEqual({});

    const detailsResult = channelDetailsV1(testUser1.uId, publicChannelId) as channel;

    expect(detailsResult.ownerMembers).toStrictEqual([testUser1, testUser2]);
    expect(detailsResult.allMembers).toStrictEqual([testUser1, testUser2]);
  });
});
