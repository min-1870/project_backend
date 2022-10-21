import { userProfileV1 } from '../src/users';
import { authRegisterV1 } from '../src/auth';
import { clearV1 } from '../src/other';
import { authUserId } from '../src/types';

describe('Test Suite for userProfileV1', () => {
  afterEach(() => {
    clearV1();
  });

  test('error passing invalid uId', () => {
    const temp1 = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker') as authUserId;
    const temp2 = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy') as authUserId;

    expect(userProfileV1(temp1.authUserId, (temp2.authUserId + 4345))).toStrictEqual({ error: expect.any(String) });
  });

  test('error passing invalid authUserId', () => {
    const temp1 = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker') as authUserId;
    const temp2 = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy') as authUserId;

    expect(userProfileV1((temp1.authUserId + 4345), temp2.authUserId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful userProfileV1', () => {
    const temp1 = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker') as authUserId;
    const temp2 = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy') as authUserId;

    expect(userProfileV1(temp1.authUserId, temp2.authUserId)).toStrictEqual({
      uId: temp2.authUserId,
      email: 'gomugomu@hotmail.com',
      nameFirst: 'monkey',
      nameLast: 'luffy',
      handleStr: 'monkeyluffy'
    });
  });
});
