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

describe('HTTP tests for /auth/register/v2', () => {
  // happy path
  test('Successful authRegisterV1', () => {
    const res = sendPostRequestToEndpoint('/auth/register/v2', {
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
    const res = sendPostRequestToEndpoint('/auth/register/v2', {
      email: 'mapplebotoo',
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('error passing already registered email through authRegister', () => {
    sendPostRequestToEndpoint('/auth/register/v2', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint('/auth/register/v2', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('error passing invalid password through authRegister', () => {
    const res = sendPostRequestToEndpoint('/auth/register/v2', {
      email: EMAIL,
      password: 'pvss',
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('error passing invalid first name through authRegister', () => {
    const res = sendPostRequestToEndpoint('/auth/register/v2', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: '',
      nameLast: NAME_LAST
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('error passing invalid last name through authRegister', () => {
    const res = sendPostRequestToEndpoint('/auth/register/v2', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: ''
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});

describe('HTTP tests for /auth/login/v2', () => {
  // happy path
  test('Successful authLogin', () => {
    sendPostRequestToEndpoint('/auth/register/v2', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });

    const res = sendPostRequestToEndpoint('/auth/login/v2', {
      email: EMAIL,
      password: PASSWORD,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Error passing invalid email through authLoginV1', () => {
    sendPostRequestToEndpoint('/auth/register/v2', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint('/auth/login/v2', {
      email: 'idkifthisisright@gmail.com',
      password: PASSWORD,
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });

  test('Error passing invalid password through authLoginV1', () => {
    sendPostRequestToEndpoint('/auth/register/v2', {
      email: EMAIL,
      password: PASSWORD,
      nameFirst: NAME_FIRST,
      nameLast: NAME_LAST
    });
    const res = sendPostRequestToEndpoint('/auth/login/v2', {
      email: EMAIL,
      password: 'nappy',
    });

    expect(res.statusCode).toBe(OK);
    expect(parseJsonResponse(res)).toStrictEqual({
      error: expect.any(String)
    });
  });
});
