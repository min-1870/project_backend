import { authResponse, listResetCodeResponse } from '../../src/types';
import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_PASSWORD_RESET,
  AUTH_PASSWORD_RESET_REQUEST,
  AUTH_REGISTER,
  CHANNELS_LIST_ALL,
  clearDataForTest} from '../testBase';
import {
  sendPostRequestToEndpoint,
  parseJsonResponse,
  OK,
  sendGetRequestToEndpoint,
} from './integrationTestUtils';

const EMAIL = 'moniker2@hotmail.com';
const PASSWORD = 'pvssword';
const NAME_FIRST = '7re$#%^@$#al43E';
const NAME_LAST = 'MoN(*#@@#!i9IO64kerMoNi9IO64kerMoNi9IO64ker';

beforeEach(() => {
  clearDataForTest()
});

describe('HTTP tests for /auth/register', () => {
  test('authRegister success', () => {
    const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('authRegister invalid email throws error', () => {
    const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: 'mapplebotoo',
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authRegister already used email throws error', () => {
    sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authRegister invalid password throws error', () => {
    const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: 'pvss',
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authRegister empty firstName throws error', () => {
    const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: '',
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authRegister empty last name throws error', () => {
    const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: ''
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authRegister firstName too long throws error', () => {
    const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: 'a'.repeat(100),
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authRegister last name too long throws error', () => {
    const res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: 'b'.repeat(100)
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for /auth/login', () => {
  test('authLogin success', () => {
    sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const res = sendPostRequestToEndpoint(AUTH_LOGIN, {
      email: EMAIL,
      password: PASSWORD,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('authLogin users with dumplicate name and password success', () => {
    const users = [
      {
        email: EMAIL,
        password: PASSWORD,
        nameFirst: NAME_FIRST,
        nameLast: NAME_LAST
      },
      {
        email: 'a1234@gmail.com',
        password: '1234567',
        nameFirst: 'nameFir',
        nameLast: 'nameLas'
      },
      {
        email: 'a555@gmail.com',
        password: 'aPASSWord1324',
        nameFirst: 'nam',
        nameLast: 'bob'
      },
      {
        email: 'a9999@gmail.com',
        password: PASSWORD,
        nameFirst: NAME_FIRST,
        nameLast: NAME_LAST
      },
    ];
    users.forEach(user => sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: user.email,
      password: user.password,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast
    }));

    users.forEach(user => {
      const res = sendPostRequestToEndpoint(AUTH_LOGIN, {
        email: user.email,
        password: user.password,
      });

      expect(res.statusCode).toBe(OK);
      const jsonResponse = parseJsonResponse(res);
      expect(jsonResponse).toStrictEqual({
        token: expect.any(String),
        authUserId: expect.any(Number)
      });
    });
  });

  test('authLogin invalid email throws error', () => {
    sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint(AUTH_LOGIN, {
      email: 'idkifthisisright@gmail.com',
      password: PASSWORD,
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authLogin invalid password throws error', () => {
    sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint(AUTH_LOGIN, {
      email: EMAIL,
      password: 'nappy',
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for /auth/logout', () => {
  test('authLogout success', () => {
    const ret = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const jsonResponse = parseJsonResponse(ret) as unknown as authResponse;
    const token = jsonResponse.token;

    const res = sendPostRequestToEndpoint(AUTH_LOGOUT, {}, token);
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('authLogout invalid token throws forbidden.', () => {
    sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint(AUTH_LOGOUT, {}, 'this is definitely wrong');

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('HTTP tests for /auth/passwordreset/request', () => {
  test('authPasswordReset request successful', () => {
    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const token = (parseJsonResponse(res) as unknown as authResponse).token

    res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET_REQUEST, { email: EMAIL});
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});

    res = sendGetRequestToEndpoint('/auth/passwordreset/listcodes/v1', { email: EMAIL })
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      codes: [expect.any(String)]
    });

    // Token should be cleared after reset request so this should fail.
    res = sendGetRequestToEndpoint(CHANNELS_LIST_ALL, {}, token)
    expect(res.statusCode).toBe(403);
  });

  test('authPasswordReset request multuiple times successful', () => {
    sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    let res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET_REQUEST, { email: EMAIL});
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});

    res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET_REQUEST, { email: EMAIL});
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});

    res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET_REQUEST, { email: EMAIL});
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});

    res = sendGetRequestToEndpoint('/auth/passwordreset/listcodes/v1', { email: EMAIL })
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      codes: [expect.any(String), expect.any(String), expect.any(String)]
    });
  });
});

describe('HTTP tests for /auth/passwordreset/reset', () => {
  test('authPasswordReset reset successful', () => {
    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET_REQUEST, { email: EMAIL});
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});

    sendPostRequestToEndpoint(AUTH_PASSWORD_RESET_REQUEST, { email: EMAIL});

    res = sendGetRequestToEndpoint('/auth/passwordreset/listcodes/v1', { email: EMAIL })
    const resetCode = (parseJsonResponse(res) as unknown as listResetCodeResponse).codes[0]

    res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET, { resetCode , newPassword: 'newthing12'});
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});

    res = sendGetRequestToEndpoint('/auth/passwordreset/listcodes/v1', { email: EMAIL })
    const response = (parseJsonResponse(res) as unknown as listResetCodeResponse)
    expect(response.codes.length).toBe(1)
  });

  test('authPasswordReset new password less than 6 characters throws error', () => {
    let res = sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET_REQUEST, { email: EMAIL});
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});

    res = sendGetRequestToEndpoint('/auth/passwordreset/listcodes/v1', { email: EMAIL })
    const resetCode = (parseJsonResponse(res) as unknown as listResetCodeResponse).codes[0]

    res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET, { resetCode , newPassword: '12345'});
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authPasswordResetinvalid reset code throws error', () => {
    sendPostRequestToEndpoint(AUTH_REGISTER, {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const res = sendPostRequestToEndpoint(AUTH_PASSWORD_RESET, { resetCode: 'invalid code', newPassword: 'hahahahahhaha' });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
})
