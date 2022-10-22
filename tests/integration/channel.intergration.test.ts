import { getData } from "../../src/dataStore";
import { authResponse, channelId } from "../../src/types";
import { getDataStoreChannel } from "../../src/utils";
import { 
    OK,
    parseJsonResponse,
    sendDeleteRequestToEndpoint,
    sendGetRequestToEndpoint,
    sendPostRequestToEndpoint
} from "./integrationTestUtils";

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';
// const TEST_INVALID_TOKEN = '';
const TEST_CHANNEL_NAME = 'Test channel';
// const LONG_CHANNEL_NAME = 'This is a very long channel name';
// const SHORT_CHANNEL_NAME = '';

let token: string; // test user 1's token
let token2: string; // test user 2's token

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});

  // test user 1
  const res = sendPostRequestToEndpoint('/auth/register/v2', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });

  token = (parseJsonResponse(res) as unknown as authResponse).token;

  // test user 2
  const user2Res = sendPostRequestToEndpoint('/auth/register/v2', {
      email: '2' + EMAIL,
      password: '2' + PASSWORD,
      nameFirst: NAME_FIRST + 'b',
      nameLast: NAME_LAST + 'b'
  });
  token2 = (parseJsonResponse(user2Res) as unknown as authResponse).token;
});


describe('HTTP tests for channel/messages/v2', () => {
    let channel1Id: any
    beforeEach(() => {
        // test channel 1
        const channel1Res = sendPostRequestToEndpoint('/channels/create/v2', {
            token: token,
            name: TEST_CHANNEL_NAME,
            isPublic: true
          });
        channel1Id = (parseJsonResponse(channel1Res) as unknown as channelId).channelId;

        //need to fix this part to by using the function "messagesendv1" in the future for blackbox test
        let dataStoreChannel = getDataStoreChannel(channel1Id, getData());
        dataStoreChannel.messages.push({ messageId: 0, uId: 0, message: '0', timeSent: 0 }, { messageId: 1, uId: 1, message: '1', timeSent: 1 }, { messageId: 2, uId: 2, message: '2', timeSent: 2 }, { messageId: 3, uId: 3, message: '3', timeSent: 3 }, { messageId: 4, uId: 4, message: '4', timeSent: 4 }, { messageId: 5, uId: 5, message: '5', timeSent: 5 }, { messageId: 6, uId: 6, message: '6', timeSent: 6 }, { messageId: 7, uId: 7, message: '7', timeSent: 7 }, { messageId: 8, uId: 8, message: '8', timeSent: 8 }, { messageId: 9, uId: 9, message: '9', timeSent: 9 }, { messageId: 10, uId: 10, message: '10', timeSent: 10 }, { messageId: 11, uId: 11, message: '11', timeSent: 11 }, { messageId: 12, uId: 12, message: '12', timeSent: 12 }, { messageId: 13, uId: 13, message: '13', timeSent: 13 }, { messageId: 14, uId: 14, message: '14', timeSent: 14 }, { messageId: 15, uId: 15, message: '15', timeSent: 15 }, { messageId: 16, uId: 16, message: '16', timeSent: 16 }, { messageId: 17, uId: 17, message: '17', timeSent: 17 }, { messageId: 18, uId: 18, message: '18', timeSent: 18 }, { messageId: 19, uId: 19, message: '19', timeSent: 19 }, { messageId: 20, uId: 20, message: '20', timeSent: 20 }, { messageId: 21, uId: 21, message: '21', timeSent: 21 }, { messageId: 22, uId: 22, message: '22', timeSent: 22 }, { messageId: 23, uId: 23, message: '23', timeSent: 23 }, { messageId: 24, uId: 24, message: '24', timeSent: 24 }, { messageId: 25, uId: 25, message: '25', timeSent: 25 }, { messageId: 26, uId: 26, message: '26', timeSent: 26 }, { messageId: 27, uId: 27, message: '27', timeSent: 27 }, { messageId: 28, uId: 28, message: '28', timeSent: 28 }, { messageId: 29, uId: 29, message: '29', timeSent: 29 }, { messageId: 30, uId: 30, message: '30', timeSent: 30 }, { messageId: 31, uId: 31, message: '31', timeSent: 31 }, { messageId: 32, uId: 32, message: '32', timeSent: 32 }, { messageId: 33, uId: 33, message: '33', timeSent: 33 }, { messageId: 34, uId: 34, message: '34', timeSent: 34 }, { messageId: 35, uId: 35, message: '35', timeSent: 35 }, { messageId: 36, uId: 36, message: '36', timeSent: 36 }, { messageId: 37, uId: 37, message: '37', timeSent: 37 }, { messageId: 38, uId: 38, message: '38', timeSent: 38 }, { messageId: 39, uId: 39, message: '39', timeSent: 39 }, { messageId: 40, uId: 40, message: '40', timeSent: 40 }, { messageId: 41, uId: 41, message: '41', timeSent: 41 }, { messageId: 42, uId: 42, message: '42', timeSent: 42 }, { messageId: 43, uId: 43, message: '43', timeSent: 43 }, { messageId: 44, uId: 44, message: '44', timeSent: 44 }, { messageId: 45, uId: 45, message: '45', timeSent: 45 }, { messageId: 46, uId: 46, message: '46', timeSent: 46 }, { messageId: 47, uId: 47, message: '47', timeSent: 47 }, { messageId: 48, uId: 48, message: '48', timeSent: 48 }, { messageId: 49, uId: 49, message: '49', timeSent: 49 }, { messageId: 50, uId: 50, message: '50', timeSent: 50 }, { messageId: 51, uId: 51, message: '51', timeSent: 51 }, { messageId: 52, uId: 52, message: '52', timeSent: 52 }, { messageId: 53, uId: 53, message: '53', timeSent: 53 }, { messageId: 54, uId: 54, message: '54', timeSent: 54 }, { messageId: 55, uId: 55, message: '55', timeSent: 55 }, { messageId: 56, uId: 56, message: '56', timeSent: 56 }, { messageId: 57, uId: 57, message: '57', timeSent: 57 }, { messageId: 58, uId: 58, message: '58', timeSent: 58 }, { messageId: 59, uId: 59, message: '59', timeSent: 59 }, { messageId: 60, uId: 60, message: '60', timeSent: 60 }, { messageId: 61, uId: 61, message: '61', timeSent: 61 }, { messageId: 62, uId: 62, message: '62', timeSent: 62 }, { messageId: 63, uId: 63, message: '63', timeSent: 63 }, { messageId: 64, uId: 64, message: '64', timeSent: 64 }, { messageId: 65, uId: 65, message: '65', timeSent: 65 }, { messageId: 66, uId: 66, message: '66', timeSent: 66 }, { messageId: 67, uId: 67, message: '67', timeSent: 67 }, { messageId: 68, uId: 68, message: '68', timeSent: 68 }, { messageId: 69, uId: 69, message: '69', timeSent: 69 }, { messageId: 70, uId: 70, message: '70', timeSent: 70 }, { messageId: 71, uId: 71, message: '71', timeSent: 71 }, { messageId: 72, uId: 72, message: '72', timeSent: 72 }, { messageId: 73, uId: 73, message: '73', timeSent: 73 }, { messageId: 74, uId: 74, message: '74', timeSent: 74 }, { messageId: 75, uId: 75, message: '75', timeSent: 75 }, { messageId: 76, uId: 76, message: '76', timeSent: 76 }, { messageId: 77, uId: 77, message: '77', timeSent: 77 }, { messageId: 78, uId: 78, message: '78', timeSent: 78 }, { messageId: 79, uId: 79, message: '79', timeSent: 79 }, { messageId: 80, uId: 80, message: '80', timeSent: 80 }, { messageId: 81, uId: 81, message: '81', timeSent: 81 }, { messageId: 82, uId: 82, message: '82', timeSent: 82 }, { messageId: 83, uId: 83, message: '83', timeSent: 83 }, { messageId: 84, uId: 84, message: '84', timeSent: 84 }, { messageId: 85, uId: 85, message: '85', timeSent: 85 }, { messageId: 86, uId: 86, message: '86', timeSent: 86 }, { messageId: 87, uId: 87, message: '87', timeSent: 87 }, { messageId: 88, uId: 88, message: '88', timeSent: 88 }, { messageId: 89, uId: 89, message: '89', timeSent: 89 }, { messageId: 90, uId: 90, message: '90', timeSent: 90 }, { messageId: 91, uId: 91, message: '91', timeSent: 91 }, { messageId: 92, uId: 92, message: '92', timeSent: 92 }, { messageId: 93, uId: 93, message: '93', timeSent: 93 }, { messageId: 94, uId: 94, message: '94', timeSent: 94 }, { messageId: 95, uId: 95, message: '95', timeSent: 95 }, { messageId: 96, uId: 96, message: '96', timeSent: 96 }, { messageId: 97, uId: 97, message: '97', timeSent: 97 }, { messageId: 98, uId: 98, message: '98', timeSent: 98 }, { messageId: 99, uId: 99, message: '99', timeSent: 99 }, { messageId: 100, uId: 100, message: '100', timeSent: 100 }, { messageId: 101, uId: 101, message: '101', timeSent: 101 }, { messageId: 102, uId: 102, message: '102', timeSent: 102 }, { messageId: 103, uId: 103, message: '103', timeSent: 103 }, { messageId: 104, uId: 104, message: '104', timeSent: 104 }, { messageId: 105, uId: 105, message: '105', timeSent: 105 }, { messageId: 106, uId: 106, message: '106', timeSent: 106 }, { messageId: 107, uId: 107, message: '107', timeSent: 107 }, { messageId: 108, uId: 108, message: '108', timeSent: 108 }, { messageId: 109, uId: 109, message: '109', timeSent: 109 }, { messageId: 110, uId: 110, message: '110', timeSent: 110 }, { messageId: 111, uId: 111, message: '111', timeSent: 111 }, { messageId: 112, uId: 112, message: '112', timeSent: 112 }, { messageId: 113, uId: 113, message: '113', timeSent: 113 }, { messageId: 114, uId: 114, message: '114', timeSent: 114 }, { messageId: 115, uId: 115, message: '115', timeSent: 115 }, { messageId: 116, uId: 116, message: '116', timeSent: 116 }, { messageId: 117, uId: 117, message: '117', timeSent: 117 }, { messageId: 118, uId: 118, message: '118', timeSent: 118 }, { messageId: 119, uId: 119, message: '119', timeSent: 119 }, { messageId: 120, uId: 120, message: '120', timeSent: 120 }, { messageId: 121, uId: 121, message: '121', timeSent: 121 }, { messageId: 122, uId: 122, message: '122', timeSent: 122 }, { messageId: 123, uId: 123, message: '123', timeSent: 123 });
    });

    test('channelId does not refer to a valid channel', () => {
        const res = sendGetRequestToEndpoint('channel/messages/v2', {
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
        const res = sendGetRequestToEndpoint('channel/messages/v2', {
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
        const res = sendGetRequestToEndpoint('channel/messages/v2', {
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
        const res = sendGetRequestToEndpoint('channel/messages/v2', {
            token: '99999999',
            channelId: channel1Id,
            start: 0,
        });
  
        expect(res.statusCode).toBe(OK);
        expect(parseJsonResponse(res)).toStrictEqual({
            error: 'Not a member of the channel' 
        });
    });

    test('correct input correct return ', () => {
      const res = sendGetRequestToEndpoint('channel/messages/v2', {
        token: token,
        channelId: channel1Id,
        start: 50,
      });
  
      expect(res.statusCode).toBe(OK);
      expect(parseJsonResponse(res)).toStrictEqual({
        messages: [{ messageId: 50, uId: 50, message: '50', timeSent: 50 }, { messageId: 51, uId: 51, message: '51', timeSent: 51 }, { messageId: 52, uId: 52, message: '52', timeSent: 52 }, { messageId: 53, uId: 53, message: '53', timeSent: 53 }, { messageId: 54, uId: 54, message: '54', timeSent: 54 }, { messageId: 55, uId: 55, message: '55', timeSent: 55 }, { messageId: 56, uId: 56, message: '56', timeSent: 56 }, { messageId: 57, uId: 57, message: '57', timeSent: 57 }, { messageId: 58, uId: 58, message: '58', timeSent: 58 }, { messageId: 59, uId: 59, message: '59', timeSent: 59 }, { messageId: 60, uId: 60, message: '60', timeSent: 60 }, { messageId: 61, uId: 61, message: '61', timeSent: 61 }, { messageId: 62, uId: 62, message: '62', timeSent: 62 }, { messageId: 63, uId: 63, message: '63', timeSent: 63 }, { messageId: 64, uId: 64, message: '64', timeSent: 64 }, { messageId: 65, uId: 65, message: '65', timeSent: 65 }, { messageId: 66, uId: 66, message: '66', timeSent: 66 }, { messageId: 67, uId: 67, message: '67', timeSent: 67 }, { messageId: 68, uId: 68, message: '68', timeSent: 68 }, { messageId: 69, uId: 69, message: '69', timeSent: 69 }, { messageId: 70, uId: 70, message: '70', timeSent: 70 }, { messageId: 71, uId: 71, message: '71', timeSent: 71 }, { messageId: 72, uId: 72, message: '72', timeSent: 72 }, { messageId: 73, uId: 73, message: '73', timeSent: 73 }, { messageId: 74, uId: 74, message: '74', timeSent: 74 }, { messageId: 75, uId: 75, message: '75', timeSent: 75 }, { messageId: 76, uId: 76, message: '76', timeSent: 76 }, { messageId: 77, uId: 77, message: '77', timeSent: 77 }, { messageId: 78, uId: 78, message: '78', timeSent: 78 }, { messageId: 79, uId: 79, message: '79', timeSent: 79 }, { messageId: 80, uId: 80, message: '80', timeSent: 80 }, { messageId: 81, uId: 81, message: '81', timeSent: 81 }, { messageId: 82, uId: 82, message: '82', timeSent: 82 }, { messageId: 83, uId: 83, message: '83', timeSent: 83 }, { messageId: 84, uId: 84, message: '84', timeSent: 84 }, { messageId: 85, uId: 85, message: '85', timeSent: 85 }, { messageId: 86, uId: 86, message: '86', timeSent: 86 }, { messageId: 87, uId: 87, message: '87', timeSent: 87 }, { messageId: 88, uId: 88, message: '88', timeSent: 88 }, { messageId: 89, uId: 89, message: '89', timeSent: 89 }, { messageId: 90, uId: 90, message: '90', timeSent: 90 }, { messageId: 91, uId: 91, message: '91', timeSent: 91 }, { messageId: 92, uId: 92, message: '92', timeSent: 92 }, { messageId: 93, uId: 93, message: '93', timeSent: 93 }, { messageId: 94, uId: 94, message: '94', timeSent: 94 }, { messageId: 95, uId: 95, message: '95', timeSent: 95 }, { messageId: 96, uId: 96, message: '96', timeSent: 96 }, { messageId: 97, uId: 97, message: '97', timeSent: 97 }, { messageId: 98, uId: 98, message: '98', timeSent: 98 }, { messageId: 99, uId: 99, message: '99', timeSent: 99 }],
        start: 50,
        end: 100
      });
    });
});