import { userProfileV1 } from '../src/users';
import { authRegisterV1 } from '../src/auth';
import { clearV1 } from '../src/other';

describe('Test Suite for userProfileV1', () => {
  afterEach(() => {
    clearV1();
  });

  test('error passing invalid uId', () => {
    let temp1: any = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker');
    let temp2: any = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy');
    temp1 = temp1.authUserId;
    temp2 = temp2.authUserId;

    expect(userProfileV1(temp1, (temp2 + 4345))).toStrictEqual({ error: expect.any(String) });
  });

  test('error passing invalid authUserId', () => {
    let temp1:any = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker');
    let temp2:any = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy');
    temp1 = temp1.authUserId;
    temp2 = temp2.authUserId;
    expect(userProfileV1((temp1 + 4345), temp2)).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful userProfileV1', () => {
    let temp1:any = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker');
    let temp2:any = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy');
    temp1 = temp1.authUserId;
    temp2 = temp2.authUserId;

    expect(userProfileV1(temp1, temp2)).toStrictEqual({
      uId: temp2,
      email: 'gomugomu@hotmail.com',
      nameFirst: 'monkey',
      nameLast: 'luffy',
      handleStr: 'monkeyluffy'
    });
  });
});
