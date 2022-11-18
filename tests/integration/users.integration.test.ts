import { authResponse } from '../../src/types';
import { USER_PROFILE } from '../testBase';
import {
  parseJsonResponse,
  OK,
  sendGetRequestToEndpoint,
  sendDeleteRequestToEndpoint,
  sendPostRequestToEndpoint,
  sendPutRequestToEndpoint,
} from './integrationTestUtils';

const EMAIL = 'Bob123@gmail.com';
const PASSWORD = '11223344';
const NAME_FIRST = 'Barty';
const NAME_LAST = 'Potter';

let token: string;
let uId: number;
let uIdTwo: number;

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
  let res = sendPostRequestToEndpoint('/auth/register/v3', {
    email: EMAIL,
    password: PASSWORD,
    nameFirst: NAME_FIRST,
    nameLast: NAME_LAST
  });

  let jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  token = jsonResponse.token;
  uIdTwo = jsonResponse.authUserId;

  res = sendPostRequestToEndpoint('/auth/register/v3', {
    email: 'gomugomu@hotmail.com',
    password: PASSWORD,
    nameFirst: 'monkey',
    nameLast: 'luffy'
  });

  jsonResponse = parseJsonResponse(res) as unknown as authResponse;
  uId = jsonResponse.authUserId;
});

describe('HTTP tests for /user/profile', () => {
  // happy path
  test('userProfile get successful', () => {
    const res = sendGetRequestToEndpoint(USER_PROFILE, {
      uId: uId
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      user: {
        uId: uId,
        email: 'gomugomu@hotmail.com',
        nameFirst: 'monkey',
        nameLast: 'luffy',
        handleStr: 'monkeyluffy'
      }
    });
  });

  test('error passing invalid uId', () => {
    const res = sendGetRequestToEndpoint(USER_PROFILE, {
      uId: 3129083901222
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('error passing invalid token', () => {
    const res = sendGetRequestToEndpoint(USER_PROFILE, {
      uId: uId
    }, (token + 69));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for /user/profile/sethandle/v2', () => {
  test('Failed due to invalid handleStr (length < 3)', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v2', {
      handleStr: 'ha'
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'handleStr is not correct size' });
  });

  test('Failed due to invalid handleStr (length > 20)', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v2', {
      handleStr: 'hahahahahahahahahahahahahahahahahahahaahahaha'
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'handleStr is not correct size' });
  });

  test('Failed due to invalid characters in handleStr', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v2', {
      handleStr: "ha'w'e<?*"
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Failed due to handleStr already in use', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v2', {
      handleStr: 'monkeyluffy'
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Failed due to token invalid', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v2', {
      handleStr: 'monkeydamnluffy'
    }, (token + 99));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Successful implementation of user/profile/sethandle/v1', () => {
    const res = sendPutRequestToEndpoint('/user/profile/sethandle/v2', {
      handleStr: 'monkeydamnluffy'
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
});

describe('Tests for /user/profile/setemail/v2', () => {
  test('Successful update of email', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setemail/v2', {
      email: 'gomugomu1@hotmail.com'
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Email is invalid', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setemail/v2', {
      email: 'notanemail'
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Email is already in use', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setemail/v2', {
      email: 'gomugomu@hotmail.com'
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Token is invalid', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setemail/v2', {
      email: 'gomugomu1@hotmail.com'
    }, (token + 69));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('Tests for /user/profile/setname/v2', () => {
  test('Successful update of first and last name', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v2', {
      nameFirst: 'Steve',
      nameLast: 'Man'
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });
  test('First name too long', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v2', {
      nameFirst: 'Steveveveveveveveveveveveveveveveveveveveveveveveveveveve',
      nameLast: 'Man'
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'First name is not correct length' });
  });
  test('Last name too long', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v2', {
      nameFirst: 'Steve',
      nameLast: 'Manananananananananananananananananananananananananananananananananananananananan'
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'Last name is not correct length' });
  });
  test('First name too short', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v2', {
      nameFirst: '',
      nameLast: 'Man'
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('Last name too short', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v2', {
      nameFirst: 'Steve',
      nameLast: ''
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('Token is invalid', () => {
    const res = sendPutRequestToEndpoint('/user/profile/setname/v2', {
      nameFirst: 'Steve',
      nameLast: 'Lacy'
    }, (token + 69));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('Tests for /users/all/v2', () => {
  test('token is invalid', () => {
    const res = sendGetRequestToEndpoint('/users/all/v2', {
    }, (token + 999));

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
  test('A list of all users and their associated details is successfully returned.', () => {
    const res = sendGetRequestToEndpoint('/users/all/v2', {
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      users: [{
        uId: uIdTwo,
        email: 'Bob123@gmail.com',
        nameFirst: 'Barty',
        nameLast: 'Potter',
        handleStr: 'bartypotter'
      },
      {
        uId: uId,
        email: 'gomugomu@hotmail.com',
        nameFirst: 'monkey',
        nameLast: 'luffy',
        handleStr: 'monkeyluffy'
      }]
    });
  });
});
describe('Tests for /user/profile/uploadphoto/v1', () => {
  test('Successful upload of image', () => {
    const res = sendPutRequestToEndpoint('/user/profile/uploadphoto/v2', {
      imgUrl: 'http://images.unsplash.com/photo-1606115915090-be18fea23ec7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8anBlZ3xlbnwwfHwwfHw%3D&w=1000&q=80',
      xStart: 0,
      yStart: 0,
      xEnd: 10,
      yEnd: 10,
    }, token);

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('url is not a jpeg', () => {
    const res = sendPutRequestToEndpoint('/user/profile/uploadphoto/v2', {
      imgUrl: 'http://w7.pngwing.com/pngs/715/372/png-transparent-two-checked-flags-racing-flags-auto-racing-racing-flag-miscellaneous-game-flag-png-free-download.png',
      xStart: 0,
      yStart: 0,
      xEnd: 10,
      yEnd: 10,
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('width is too small for dimensions', () => {
    const res = sendPutRequestToEndpoint('/user/profile/uploadphoto/v2', {
      imgUrl: 'http://w7.pngwing.com/pngs/715/372/png-transparent-two-checked-flags-racing-flags-auto-racing-racing-flag-miscellaneous-game-flag-png-free-download.png',
      xStart: 999999999999999,
      yStart: 1,
      xEnd: 999999999999999,
      yEnd: 1,
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('height is too small for dimensions', () => {
    const res = sendPutRequestToEndpoint('/user/profile/uploadphoto/v2', {
      imgUrl: 'http://w7.pngwing.com/pngs/715/372/png-transparent-two-checked-flags-racing-flags-auto-racing-racing-flag-miscellaneous-game-flag-png-free-download.png',
      xStart: 1,
      yStart: 999999999999999,
      xEnd: 1,
      yEnd: 999999999999999,
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('xEnd is smaller than xStart', () => {
    const res = sendPutRequestToEndpoint('/user/profile/uploadphoto/v2', {
      imgUrl: 'http://img.freepik.com/premium-photo/mixedbreed-cat-sitting-against-white-background_191971-27908.jpg?w=2000',
      xStart: 0,
      yStart: 0,
      xEnd: 10,
      yEnd: 10,
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('yEnd is smaller than yStart', () => {
    const res = sendPutRequestToEndpoint('/user/profile/updatephoto/v2', {
      imgUrl: 'http://img.freepik.com/premium-photo/mixedbreed-cat-sitting-against-white-background_191971-27908.jpg?w=2000',
      xStart: 10,
      yStart: 10,
      xEnd: 0,
      yEnd: 0,
    }, token);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
