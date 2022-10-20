import {userProfileV1} from '../src/users';
import {authRegisterV1} from '../src/auth';
import {clearV1} from '../src/other';

describe('Test Suite for userProfileV1', () => {

    afterEach(() =>  {  
        clearV1();
    });

    test('error passing invalid uId', () => {   
        let temp_1:any = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker');
        let temp_2:any = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy');
        temp_1 = temp_1.authUserId;
        temp_2 = temp_2.authUserId;
    
        expect(userProfileV1(temp_1, (temp_2 + 4345))).toStrictEqual({error: expect.any(String)});    
    });

    test('error passing invalid authUserId', () => {   
        let temp_1:any = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker');
        let temp_2:any = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy');
        temp_1 = temp_1.authUserId;
        temp_2 = temp_2.authUserId;
        expect(userProfileV1((temp_1 + 4345), temp_2)).toStrictEqual({error: expect.any(String)});    
    });

    test('Successful userProfileV1', () => { 
        let temp_1:any = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker');
        let temp_2:any = authRegisterV1('gomugomu@hotmail.com', 'devilfruit', 'monkey', 'luffy');
        temp_1 = temp_1.authUserId;
        temp_2 = temp_2.authUserId;

        expect(userProfileV1(temp_1, temp_2)).toStrictEqual({
            uId: temp_2,
            email: 'gomugomu@hotmail.com',
            nameFirst: 'monkey',
            nameLast: 'luffy',
            handleStr: 'monkeyluffy'
        });    
    });

});