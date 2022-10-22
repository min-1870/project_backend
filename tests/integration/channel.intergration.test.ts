import { getData, setData } from "../../src/dataStore";
import { authResponse, channelId, messages } from "../../src/types";
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
    let temp;
    beforeEach(() => {
        // test channel 1
        const channel1Res = sendPostRequestToEndpoint('/channels/create/v2', {
            token: token,
            name: TEST_CHANNEL_NAME,
            isPublic: true
          });
        temp = parseJsonResponse(channel1Res) as unknown as channelId;
        channel1Id = temp.channelId;

        //need to fix this part to by using the function "messagesendv1" in the future for blackbox test
        // let data = getData();
        // let dataStoreChannel = getDataStoreChannel(channel1Id, data);
        // dataStoreChannel.messages = [{ messageId: 0, uId: 0, message: "0", timeSent: 0 }]
        /////////////////////////////////////////////
    });

    test('channelId does not refer to a valid channel', () => {
        const res = sendGetRequestToEndpoint('channel/messages/v2', {
            token: token,
            channelId: 99999999,
            start: 0,
        });
  
        expect(temp).toBe(OK);//res.statusCode
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