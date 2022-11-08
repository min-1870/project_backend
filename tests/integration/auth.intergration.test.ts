import { authResponse } from '../../src/types';
import {
  sendPostRequestToEndpoint,
  parseJsonResponse,
  OK,
  sendDeleteRequestToEndpoint,
} from './integrationTestUtils';

const EMAIL = 'moniker2@hotmail.com';
const PASSWORD = 'pvssword';
const NAME_FIRST = '7re$#%^@$#al43E';
const NAME_LAST = 'MoN(*#@@#!i9IO64kerMoNi9IO64kerMoNi9IO64ker';

beforeEach(() => {
  sendDeleteRequestToEndpoint('/clear/v1', {});
});

describe('HTTP tests for /auth/register/v3', () => {
  test('Successful authRegisterV1', () => {
    sendPostRequestToEndpoint('/auth/register/v3', {
      email: 'moniker1@hotmail.com',
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    sendPostRequestToEndpoint('/auth/register/v3', {
      email: 'moniker@hotmail.com',
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint('/auth/register/v3', {
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

  test('error passing invalid email through authRegister', () => {
    const res = sendPostRequestToEndpoint('/auth/register/v3', {
      email: 'mapplebotoo',
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'Invalid Email' });
  });

  test('error passing already registered email through authRegister', () => {
    sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'Email Address already in use' });
  });

  test('error passing invalid password through authRegister', () => {
    const res = sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: 'pvss',
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'password has to be six characters or longer' });
  });

  test('error passing invalid first name through authRegister', () => {
    const res = sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: '',
      nameLast: NAME_LAST
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'First name has to be between 1 and 50 characters in length' });
  });

  test('error passing invalid last name through authRegister', () => {
    const res = sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: ''
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'Last name has to be between 1 and 50 characters in length' });
  });
});

describe('HTTP tests for /auth/login/v2', () => {
  test('Successful authLogin', () => {
    sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const res = sendPostRequestToEndpoint('/auth/login/v3', {
      email: EMAIL,
      password: PASSWORD,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Successful authLogin with multiple registered users and duplicate names and password', () => {
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
    users.forEach(user => sendPostRequestToEndpoint('/auth/register/v3', {
      email: user.email,
      password: user.password,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast
    }));

    users.forEach(user => {
      const res = sendPostRequestToEndpoint('/auth/login/v3', {
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

  test('Error passing invalid email through authLoginV1', () => {
    sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint('/auth/login/v3', {
      email: 'idkifthisisright@gmail.com',
      password: PASSWORD,
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'Email address is not registered' });
  });

  test('Error passing invalid password through authLoginV1', () => {
    sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint('/auth/login/v3', {
      email: EMAIL,
      password: 'nappy',
    });

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj.error).toStrictEqual({ message: 'Incorrect Password' });
  });
});

describe('HTTP tests for /auth/logout/v1', () => {
  test('Successful auth logout', () => {
    const ret = sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const jsonResponse = parseJsonResponse(ret) as unknown as authResponse;
    const token = jsonResponse.token;

    const res = sendPostRequestToEndpoint('/auth/logout/v1', {
      token: token,
    });
    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({});
  });

  test('Error passing invalid token through auth/logout/v2', () => {
    sendPostRequestToEndpoint('/auth/register/v3', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint('/auth/logout/v1', {
      token: 'this is definitely wrong'
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});
