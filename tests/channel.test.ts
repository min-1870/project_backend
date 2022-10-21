import { channelJoinV1, channelInviteV1, channelMessagesV1, channelDetailsV1 } from '../src/channel';
import { clearV1 } from '../src/other';
import { getData, setData } from '../src/dataStore';

describe('Test set for the function channelJoinV1', () => {
  const testUser = { // profile of the test user1
    uId: 1,
    namesFirst: 'Adam',
    namesLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
    password: 'test123'
  };
  const testUser2 = { // profile of the test user1
    uId: 2,
    namesFirst: 'Adam2',
    namesLast: 'Johnston2',
    email: 'test@gmail.com',
    handleStr: 'adam2johnston2',
    password: 'test123',
    isGlobalOwner: false
  };
  const testUser3 = { // profile of the test user3
    uId: 3,
    namesFirst: 'Adam3',
    namesLast: 'Johnston3',
    email: 'test@gmail.com',
    handleStr: 'adam3johnston3',
    password: 'test123',
    isGlobalOwner: true
  };
  const testChannel = { // profile of the test channel
    channelId: 1,
    isPublic: true,
    name: 'testChannel',
    ownerMembers: [testUser],
    allMembers: [testUser],
  };
  const testChannel2 = { // profile of the test channel
    channelId: 2,
    isPublic: false,
    name: 'testChannel2',
    ownerMembers: [testUser],
    allMembers: [testUser],
  };

  beforeEach(() => { // before every test reset and add a new test user & channel
    clearV1();
    let data:any = getData();
    data = {
      users: [
        testUser, testUser2, testUser3
      ],
      channels: [
        testChannel, testChannel2
      ]
    };
    setData(data);
  });
  test('not valid User ID', () => {
    expect(channelJoinV1(999, testChannel.channelId)).toStrictEqual({ error: 'Invalid user ID' });
  });

  test('not valid channel ID', () => {
    expect(channelJoinV1(testUser2.uId, 999)).toStrictEqual({ error: 'Invalid channel ID' });
  });

  test('normal user join private channel', () => {
    expect(channelJoinV1(testUser2.uId, testChannel2.channelId)).toStrictEqual({ error: 'This is a private server' });
  });

  test('globalowner user join private channel', () => {
    expect(channelJoinV1(testUser3.uId, testChannel2.channelId)).toStrictEqual({});
  });

  test('correct input return {}', () => {
    expect(channelJoinV1(testUser2.uId, testChannel.channelId)).toStrictEqual({});
  });

  test('correct input and join the channel', () => {
    channelJoinV1(testUser2.uId, testChannel.channelId);
    expect(getData().channels[0].allMembers).toEqual([testUser, testUser2]);
  });
});

describe('Test set for the function channelInviteV1', () => {
  const testUser = { // profile of the test user1
    uId: 1,
    namesFirst: 'Adam',
    namesLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
    password: 'test123'
  };
  const testUser2 = { // profile of the test user1
    uId: 2,
    namesFirst: 'Adam2',
    namesLast: 'Johnston2',
    email: 'test@gmail.com',
    handleStr: 'adam2johnston2',
    password: 'test123'
  };
  const testChannel = { // profile of the test channel
    channelId: 1,
    isPublic: true,
    name: 'testChannel',
    ownerMembers: [testUser],
    allMembers: [testUser],
  };
  const testChannel2 = { // profile of the test channel
    channelId: 2,
    isPublic: false,
    name: 'testChannel2',
    ownerMembers: [testUser2],
    allMembers: [testUser2],
  };

  beforeEach(() => { // before every test reset and add a new test user & channel
    clearV1();
    let data:any = getData();
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

  test('channelId does not refer to a valid channel', () => {
    expect(channelInviteV1(1, 1 + 765, 2)).toStrictEqual({ error: 'Channel ID does not refer to a valid channel' });
    console.log('');
  });

  test('authUserId is invalid', () => {
    expect(channelInviteV1(1 + 639, 1, 2)).toStrictEqual({ error: 'authUserId does not exist' });
  });

  test('uId is invalid', () => {
    expect(channelInviteV1(1, 1, 243)).toStrictEqual({ error: 'User ID does not exist' });
  });

  test('uId refers to a user who is already a member of the channel', () => {
    expect(channelInviteV1(1, 1, 1)).toStrictEqual({ error: 'user already member of channel' });
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    expect(channelInviteV1(2, 1, 2)).toStrictEqual({ error: 'authUserId is not member of channel' });
  });

  test('successful channelInviteV1', () => {
    expect(channelInviteV1(1, 1, 2)).toStrictEqual({});
  });
});

describe('Test set for the function channelMessagesV1', () => {
  const testUser = { // profile of the test user1
    uId: 1,
    namesFirst: 'Adam',
    namesLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
    password: 'test123'
  };
  const testUser2 = { // profile of the test user2
    uId: 2,
    namesFirst: 'Adamm',
    namesLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adammjohnston',
    password: 'test1234'
  };
  const testChannel = { // profile of the test channel
    channelId: 1,
    isPublic: true,
    name: 'testChannel',
    ownerMembers: [testUser],
    allMembers: [testUser],
    messages: [{ messageId: 0, uId: 0, message: '0', timeSent: 0 }, { messageId: 1, uId: 1, message: '1', timeSent: 1 }, { messageId: 2, uId: 2, message: '2', timeSent: 2 }, { messageId: 3, uId: 3, message: '3', timeSent: 3 }, { messageId: 4, uId: 4, message: '4', timeSent: 4 }, { messageId: 5, uId: 5, message: '5', timeSent: 5 }, { messageId: 6, uId: 6, message: '6', timeSent: 6 }, { messageId: 7, uId: 7, message: '7', timeSent: 7 }, { messageId: 8, uId: 8, message: '8', timeSent: 8 }, { messageId: 9, uId: 9, message: '9', timeSent: 9 }, { messageId: 10, uId: 10, message: '10', timeSent: 10 }, { messageId: 11, uId: 11, message: '11', timeSent: 11 }, { messageId: 12, uId: 12, message: '12', timeSent: 12 }, { messageId: 13, uId: 13, message: '13', timeSent: 13 }, { messageId: 14, uId: 14, message: '14', timeSent: 14 }, { messageId: 15, uId: 15, message: '15', timeSent: 15 }, { messageId: 16, uId: 16, message: '16', timeSent: 16 }, { messageId: 17, uId: 17, message: '17', timeSent: 17 }, { messageId: 18, uId: 18, message: '18', timeSent: 18 }, { messageId: 19, uId: 19, message: '19', timeSent: 19 }, { messageId: 20, uId: 20, message: '20', timeSent: 20 }, { messageId: 21, uId: 21, message: '21', timeSent: 21 }, { messageId: 22, uId: 22, message: '22', timeSent: 22 }, { messageId: 23, uId: 23, message: '23', timeSent: 23 }, { messageId: 24, uId: 24, message: '24', timeSent: 24 }, { messageId: 25, uId: 25, message: '25', timeSent: 25 }, { messageId: 26, uId: 26, message: '26', timeSent: 26 }, { messageId: 27, uId: 27, message: '27', timeSent: 27 }, { messageId: 28, uId: 28, message: '28', timeSent: 28 }, { messageId: 29, uId: 29, message: '29', timeSent: 29 }, { messageId: 30, uId: 30, message: '30', timeSent: 30 }, { messageId: 31, uId: 31, message: '31', timeSent: 31 }, { messageId: 32, uId: 32, message: '32', timeSent: 32 }, { messageId: 33, uId: 33, message: '33', timeSent: 33 }, { messageId: 34, uId: 34, message: '34', timeSent: 34 }, { messageId: 35, uId: 35, message: '35', timeSent: 35 }, { messageId: 36, uId: 36, message: '36', timeSent: 36 }, { messageId: 37, uId: 37, message: '37', timeSent: 37 }, { messageId: 38, uId: 38, message: '38', timeSent: 38 }, { messageId: 39, uId: 39, message: '39', timeSent: 39 }, { messageId: 40, uId: 40, message: '40', timeSent: 40 }, { messageId: 41, uId: 41, message: '41', timeSent: 41 }, { messageId: 42, uId: 42, message: '42', timeSent: 42 }, { messageId: 43, uId: 43, message: '43', timeSent: 43 }, { messageId: 44, uId: 44, message: '44', timeSent: 44 }, { messageId: 45, uId: 45, message: '45', timeSent: 45 }, { messageId: 46, uId: 46, message: '46', timeSent: 46 }, { messageId: 47, uId: 47, message: '47', timeSent: 47 }, { messageId: 48, uId: 48, message: '48', timeSent: 48 }, { messageId: 49, uId: 49, message: '49', timeSent: 49 }, { messageId: 50, uId: 50, message: '50', timeSent: 50 }, { messageId: 51, uId: 51, message: '51', timeSent: 51 }, { messageId: 52, uId: 52, message: '52', timeSent: 52 }, { messageId: 53, uId: 53, message: '53', timeSent: 53 }, { messageId: 54, uId: 54, message: '54', timeSent: 54 }, { messageId: 55, uId: 55, message: '55', timeSent: 55 }, { messageId: 56, uId: 56, message: '56', timeSent: 56 }, { messageId: 57, uId: 57, message: '57', timeSent: 57 }, { messageId: 58, uId: 58, message: '58', timeSent: 58 }, { messageId: 59, uId: 59, message: '59', timeSent: 59 }, { messageId: 60, uId: 60, message: '60', timeSent: 60 }, { messageId: 61, uId: 61, message: '61', timeSent: 61 }, { messageId: 62, uId: 62, message: '62', timeSent: 62 }, { messageId: 63, uId: 63, message: '63', timeSent: 63 }, { messageId: 64, uId: 64, message: '64', timeSent: 64 }, { messageId: 65, uId: 65, message: '65', timeSent: 65 }, { messageId: 66, uId: 66, message: '66', timeSent: 66 }, { messageId: 67, uId: 67, message: '67', timeSent: 67 }, { messageId: 68, uId: 68, message: '68', timeSent: 68 }, { messageId: 69, uId: 69, message: '69', timeSent: 69 }, { messageId: 70, uId: 70, message: '70', timeSent: 70 }, { messageId: 71, uId: 71, message: '71', timeSent: 71 }, { messageId: 72, uId: 72, message: '72', timeSent: 72 }, { messageId: 73, uId: 73, message: '73', timeSent: 73 }, { messageId: 74, uId: 74, message: '74', timeSent: 74 }, { messageId: 75, uId: 75, message: '75', timeSent: 75 }, { messageId: 76, uId: 76, message: '76', timeSent: 76 }, { messageId: 77, uId: 77, message: '77', timeSent: 77 }, { messageId: 78, uId: 78, message: '78', timeSent: 78 }, { messageId: 79, uId: 79, message: '79', timeSent: 79 }, { messageId: 80, uId: 80, message: '80', timeSent: 80 }, { messageId: 81, uId: 81, message: '81', timeSent: 81 }, { messageId: 82, uId: 82, message: '82', timeSent: 82 }, { messageId: 83, uId: 83, message: '83', timeSent: 83 }, { messageId: 84, uId: 84, message: '84', timeSent: 84 }, { messageId: 85, uId: 85, message: '85', timeSent: 85 }, { messageId: 86, uId: 86, message: '86', timeSent: 86 }, { messageId: 87, uId: 87, message: '87', timeSent: 87 }, { messageId: 88, uId: 88, message: '88', timeSent: 88 }, { messageId: 89, uId: 89, message: '89', timeSent: 89 }, { messageId: 90, uId: 90, message: '90', timeSent: 90 }, { messageId: 91, uId: 91, message: '91', timeSent: 91 }, { messageId: 92, uId: 92, message: '92', timeSent: 92 }, { messageId: 93, uId: 93, message: '93', timeSent: 93 }, { messageId: 94, uId: 94, message: '94', timeSent: 94 }, { messageId: 95, uId: 95, message: '95', timeSent: 95 }, { messageId: 96, uId: 96, message: '96', timeSent: 96 }, { messageId: 97, uId: 97, message: '97', timeSent: 97 }, { messageId: 98, uId: 98, message: '98', timeSent: 98 }, { messageId: 99, uId: 99, message: '99', timeSent: 99 }, { messageId: 100, uId: 100, message: '100', timeSent: 100 }, { messageId: 101, uId: 101, message: '101', timeSent: 101 }, { messageId: 102, uId: 102, message: '102', timeSent: 102 }, { messageId: 103, uId: 103, message: '103', timeSent: 103 }, { messageId: 104, uId: 104, message: '104', timeSent: 104 }, { messageId: 105, uId: 105, message: '105', timeSent: 105 }, { messageId: 106, uId: 106, message: '106', timeSent: 106 }, { messageId: 107, uId: 107, message: '107', timeSent: 107 }, { messageId: 108, uId: 108, message: '108', timeSent: 108 }, { messageId: 109, uId: 109, message: '109', timeSent: 109 }, { messageId: 110, uId: 110, message: '110', timeSent: 110 }, { messageId: 111, uId: 111, message: '111', timeSent: 111 }, { messageId: 112, uId: 112, message: '112', timeSent: 112 }, { messageId: 113, uId: 113, message: '113', timeSent: 113 }, { messageId: 114, uId: 114, message: '114', timeSent: 114 }, { messageId: 115, uId: 115, message: '115', timeSent: 115 }, { messageId: 116, uId: 116, message: '116', timeSent: 116 }, { messageId: 117, uId: 117, message: '117', timeSent: 117 }, { messageId: 118, uId: 118, message: '118', timeSent: 118 }, { messageId: 119, uId: 119, message: '119', timeSent: 119 }, { messageId: 120, uId: 120, message: '120', timeSent: 120 }, { messageId: 121, uId: 121, message: '121', timeSent: 121 }, { messageId: 122, uId: 122, message: '122', timeSent: 122 }, { messageId: 123, uId: 123, message: '123', timeSent: 123 }]
  };

  beforeEach(() => { // before every test reset and add a new test user & channel
    clearV1();
    let data:any = getData();
    data = {
      users: [
        testUser, testUser2
      ],
      channels: [
        testChannel
      ]
    };
    setData(data);
  });

  test('Checks the function return error for an invalid channelId', () => {
    expect(channelMessagesV1(1, 123144, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for bigger or smaller input on the argument start', () => {
    expect(channelMessagesV1(1, 1, 1235123)).toStrictEqual({ error: expect.any(String) });
    expect(channelMessagesV1(1, 1, -1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for unauthorised user', () => {
    expect(channelMessagesV1(2, 1, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for invalid userId', () => {
    expect(channelMessagesV1(14134124, 1, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return correct message', () => {
    expect(channelMessagesV1(1, 1, 0)).toStrictEqual({ messages: [{ messageId: 0, uId: 0, message: '0', timeSent: 0 }, { messageId: 1, uId: 1, message: '1', timeSent: 1 }, { messageId: 2, uId: 2, message: '2', timeSent: 2 }, { messageId: 3, uId: 3, message: '3', timeSent: 3 }, { messageId: 4, uId: 4, message: '4', timeSent: 4 }, { messageId: 5, uId: 5, message: '5', timeSent: 5 }, { messageId: 6, uId: 6, message: '6', timeSent: 6 }, { messageId: 7, uId: 7, message: '7', timeSent: 7 }, { messageId: 8, uId: 8, message: '8', timeSent: 8 }, { messageId: 9, uId: 9, message: '9', timeSent: 9 }, { messageId: 10, uId: 10, message: '10', timeSent: 10 }, { messageId: 11, uId: 11, message: '11', timeSent: 11 }, { messageId: 12, uId: 12, message: '12', timeSent: 12 }, { messageId: 13, uId: 13, message: '13', timeSent: 13 }, { messageId: 14, uId: 14, message: '14', timeSent: 14 }, { messageId: 15, uId: 15, message: '15', timeSent: 15 }, { messageId: 16, uId: 16, message: '16', timeSent: 16 }, { messageId: 17, uId: 17, message: '17', timeSent: 17 }, { messageId: 18, uId: 18, message: '18', timeSent: 18 }, { messageId: 19, uId: 19, message: '19', timeSent: 19 }, { messageId: 20, uId: 20, message: '20', timeSent: 20 }, { messageId: 21, uId: 21, message: '21', timeSent: 21 }, { messageId: 22, uId: 22, message: '22', timeSent: 22 }, { messageId: 23, uId: 23, message: '23', timeSent: 23 }, { messageId: 24, uId: 24, message: '24', timeSent: 24 }, { messageId: 25, uId: 25, message: '25', timeSent: 25 }, { messageId: 26, uId: 26, message: '26', timeSent: 26 }, { messageId: 27, uId: 27, message: '27', timeSent: 27 }, { messageId: 28, uId: 28, message: '28', timeSent: 28 }, { messageId: 29, uId: 29, message: '29', timeSent: 29 }, { messageId: 30, uId: 30, message: '30', timeSent: 30 }, { messageId: 31, uId: 31, message: '31', timeSent: 31 }, { messageId: 32, uId: 32, message: '32', timeSent: 32 }, { messageId: 33, uId: 33, message: '33', timeSent: 33 }, { messageId: 34, uId: 34, message: '34', timeSent: 34 }, { messageId: 35, uId: 35, message: '35', timeSent: 35 }, { messageId: 36, uId: 36, message: '36', timeSent: 36 }, { messageId: 37, uId: 37, message: '37', timeSent: 37 }, { messageId: 38, uId: 38, message: '38', timeSent: 38 }, { messageId: 39, uId: 39, message: '39', timeSent: 39 }, { messageId: 40, uId: 40, message: '40', timeSent: 40 }, { messageId: 41, uId: 41, message: '41', timeSent: 41 }, { messageId: 42, uId: 42, message: '42', timeSent: 42 }, { messageId: 43, uId: 43, message: '43', timeSent: 43 }, { messageId: 44, uId: 44, message: '44', timeSent: 44 }, { messageId: 45, uId: 45, message: '45', timeSent: 45 }, { messageId: 46, uId: 46, message: '46', timeSent: 46 }, { messageId: 47, uId: 47, message: '47', timeSent: 47 }, { messageId: 48, uId: 48, message: '48', timeSent: 48 }, { messageId: 49, uId: 49, message: '49', timeSent: 49 }], start: 0, end: 50 });
    expect(channelMessagesV1(1, 1, 50)).toStrictEqual({ messages: [{ messageId: 50, uId: 50, message: '50', timeSent: 50 }, { messageId: 51, uId: 51, message: '51', timeSent: 51 }, { messageId: 52, uId: 52, message: '52', timeSent: 52 }, { messageId: 53, uId: 53, message: '53', timeSent: 53 }, { messageId: 54, uId: 54, message: '54', timeSent: 54 }, { messageId: 55, uId: 55, message: '55', timeSent: 55 }, { messageId: 56, uId: 56, message: '56', timeSent: 56 }, { messageId: 57, uId: 57, message: '57', timeSent: 57 }, { messageId: 58, uId: 58, message: '58', timeSent: 58 }, { messageId: 59, uId: 59, message: '59', timeSent: 59 }, { messageId: 60, uId: 60, message: '60', timeSent: 60 }, { messageId: 61, uId: 61, message: '61', timeSent: 61 }, { messageId: 62, uId: 62, message: '62', timeSent: 62 }, { messageId: 63, uId: 63, message: '63', timeSent: 63 }, { messageId: 64, uId: 64, message: '64', timeSent: 64 }, { messageId: 65, uId: 65, message: '65', timeSent: 65 }, { messageId: 66, uId: 66, message: '66', timeSent: 66 }, { messageId: 67, uId: 67, message: '67', timeSent: 67 }, { messageId: 68, uId: 68, message: '68', timeSent: 68 }, { messageId: 69, uId: 69, message: '69', timeSent: 69 }, { messageId: 70, uId: 70, message: '70', timeSent: 70 }, { messageId: 71, uId: 71, message: '71', timeSent: 71 }, { messageId: 72, uId: 72, message: '72', timeSent: 72 }, { messageId: 73, uId: 73, message: '73', timeSent: 73 }, { messageId: 74, uId: 74, message: '74', timeSent: 74 }, { messageId: 75, uId: 75, message: '75', timeSent: 75 }, { messageId: 76, uId: 76, message: '76', timeSent: 76 }, { messageId: 77, uId: 77, message: '77', timeSent: 77 }, { messageId: 78, uId: 78, message: '78', timeSent: 78 }, { messageId: 79, uId: 79, message: '79', timeSent: 79 }, { messageId: 80, uId: 80, message: '80', timeSent: 80 }, { messageId: 81, uId: 81, message: '81', timeSent: 81 }, { messageId: 82, uId: 82, message: '82', timeSent: 82 }, { messageId: 83, uId: 83, message: '83', timeSent: 83 }, { messageId: 84, uId: 84, message: '84', timeSent: 84 }, { messageId: 85, uId: 85, message: '85', timeSent: 85 }, { messageId: 86, uId: 86, message: '86', timeSent: 86 }, { messageId: 87, uId: 87, message: '87', timeSent: 87 }, { messageId: 88, uId: 88, message: '88', timeSent: 88 }, { messageId: 89, uId: 89, message: '89', timeSent: 89 }, { messageId: 90, uId: 90, message: '90', timeSent: 90 }, { messageId: 91, uId: 91, message: '91', timeSent: 91 }, { messageId: 92, uId: 92, message: '92', timeSent: 92 }, { messageId: 93, uId: 93, message: '93', timeSent: 93 }, { messageId: 94, uId: 94, message: '94', timeSent: 94 }, { messageId: 95, uId: 95, message: '95', timeSent: 95 }, { messageId: 96, uId: 96, message: '96', timeSent: 96 }, { messageId: 97, uId: 97, message: '97', timeSent: 97 }, { messageId: 98, uId: 98, message: '98', timeSent: 98 }, { messageId: 99, uId: 99, message: '99', timeSent: 99 }], start: 50, end: 100 });
    expect(channelMessagesV1(1, 1, 100)).toStrictEqual({ messages: [{ messageId: 100, uId: 100, message: '100', timeSent: 100 }, { messageId: 101, uId: 101, message: '101', timeSent: 101 }, { messageId: 102, uId: 102, message: '102', timeSent: 102 }, { messageId: 103, uId: 103, message: '103', timeSent: 103 }, { messageId: 104, uId: 104, message: '104', timeSent: 104 }, { messageId: 105, uId: 105, message: '105', timeSent: 105 }, { messageId: 106, uId: 106, message: '106', timeSent: 106 }, { messageId: 107, uId: 107, message: '107', timeSent: 107 }, { messageId: 108, uId: 108, message: '108', timeSent: 108 }, { messageId: 109, uId: 109, message: '109', timeSent: 109 }, { messageId: 110, uId: 110, message: '110', timeSent: 110 }, { messageId: 111, uId: 111, message: '111', timeSent: 111 }, { messageId: 112, uId: 112, message: '112', timeSent: 112 }, { messageId: 113, uId: 113, message: '113', timeSent: 113 }, { messageId: 114, uId: 114, message: '114', timeSent: 114 }, { messageId: 115, uId: 115, message: '115', timeSent: 115 }, { messageId: 116, uId: 116, message: '116', timeSent: 116 }, { messageId: 117, uId: 117, message: '117', timeSent: 117 }, { messageId: 118, uId: 118, message: '118', timeSent: 118 }, { messageId: 119, uId: 119, message: '119', timeSent: 119 }, { messageId: 120, uId: 120, message: '120', timeSent: 120 }, { messageId: 121, uId: 121, message: '121', timeSent: 121 }, { messageId: 122, uId: 122, message: '122', timeSent: 122 }, { messageId: 123, uId: 123, message: '123', timeSent: 123 }], start: 100, end: -1 });
  });
});

describe('Test set for the function channelDetailsV1', () => {
  const testUser = { // profile of the test user1
    uId: 1,
    namesFirst: 'Adam',
    namesLast: 'Johnston',
    email: 'test@gmail.com',
    handleStr: 'adamjohnston',
    password: 'test123'
  };
  const testUser2 = { // profile of the test user1
    uId: 2,
    namesFirst: 'Adam2',
    namesLast: 'Johnston2',
    email: 'test@gmail.com',
    handleStr: 'adam2johnston2',
    password: 'test123'
  };
  const testChannel = { // profile of the test channel
    channelId: 1,
    isPublic: true,
    name: 'testChannel',
    ownerMembers: [testUser],
    allMembers: [testUser],
  };
  const testChannel2 = { // profile of the test channel
    channelId: 2,
    isPublic: false,
    name: 'testChannel2',
    ownerMembers: [testUser2],
    allMembers: [testUser2],
  };

  beforeEach(() => { // before every test reset and add a new test user & channel
    clearV1();
    let data:any = getData();
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
    const findingchannelDetails = channelDetailsV1(testUser.uId, testChannel.channelId);
    expect(findingchannelDetails).toStrictEqual({
      name: testChannel.name,
      isPublic: true,
      ownerMembers: [testUser],
      allMembers: [testUser]
    }
    );
  });

  test('authUserId and channelId correct for private channel', () => {
    const findingchannelDetails = channelDetailsV1(testUser2.uId, testChannel2.channelId);
    expect(findingchannelDetails).toStrictEqual({
      name: testChannel2.name,
      isPublic: false,
      ownerMembers: [testUser2],
      allMembers: [testUser2]
    }
    );
  });

  test('channelId does not refer to a valid channel', () => {
    const findingchannelDetails = channelDetailsV1(testUser.uId, 999999);
    expect(findingchannelDetails).toStrictEqual({ error: 'Channel ID does not refer to a valid channel' });
  });

  test('user not a channel member', () => {
    const findingchannelDetails = channelDetailsV1(testUser.uId + 1, testChannel.channelId);
    expect(findingchannelDetails).toStrictEqual({ error: 'User is not a member of channel' });
  });

  test('authUserId is invalid', () => {
    const findingchannelDetails = channelDetailsV1(999999, testChannel.channelId);
    expect(findingchannelDetails).toStrictEqual({ error: 'User ID does not exist' });
  });
});
