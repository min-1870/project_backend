import { authRegisterV1, authLoginV1 } from '../src/auth';
import { clearV1 } from '../src/other';

describe('Test Suite for authRegisterV1 function', () => {



    afterEach(() =>  {  
        clearV1();
    });

    test('Successful authRegisterV1', () => {   
        authRegisterV1('moniker2@hotmail.com', 'pvssword', '7re$#%^@$#al43E', 'MoN(*#@@#!i9IO64kerMoNi9IO64kerMoNi9IO64ker');
        authRegisterV1('moniker3@hotmail.com', 'pvssword', '7re^$$":}:L#$#$#43E', 'MoNi9I*(((O64kerMoNi9IO64kerMoNi9IO64ker');
        expect(authRegisterV1('moniker@hotmail.com', 'pvssword', '7real"}:}:43E', 'MoNi9IO64kerMoNi9IO64kerMo_***)(Ni9IO64ker')).toStrictEqual({authUserId: expect.any(Number)});    
    });

    test('error passing invalid email through authRegisterV1', () => {   
        expect(authRegisterV1('monikereffewfw', 'pvssword', 'real', 'moniker')).toStrictEqual({error: expect.any(String)});    
    });

    test('error passing already registered email through authRegisterV1', () => {
        authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker')
        expect(authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker')).toStrictEqual({error: expect.any(String)});    
    });

    test('error passing invalid password through authRegisterV1 (less than 6 characters)', () => {   
        expect(authRegisterV1('moniker@hotmail.com', 'pvss', 'real', 'moniker')).toStrictEqual({error: expect.any(String)});    
    });

    test('error passing invalid first name through authRegisterV1 (too short)', () => {   
        expect(authRegisterV1('moniker@hotmail.com', 'pvssword', '', 'moniker')).toStrictEqual({error: expect.any(String)});    
    });

    test('error passing invalid first name through authRegisterV1 (too long)', () => {   
        expect(authRegisterV1('moniker@hotmail.com', 'pvssword', 'weqrewqreweqrewqreweqrewqreweqrewqreweqrewqreweqrewqre', 'moniker')).toStrictEqual({error: expect.any(String)});    
    });

    test('error passing invalid last name through authRegisterV1 (too short)', () => {   
        expect(authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', '')).toStrictEqual({error: expect.any(String)});    
    });

    test('error passing invalid last name through authRegisterV1 (too long)', () => {   
        expect(authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'weqrewqreweqrewqreweqrewqreweqrewqreweqrewqreweqrewqre')).toStrictEqual({error: expect.any(String)});    
    });

    // test('Testing if created authUserId is unique', () => {
    //     const case_1 = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker');
        
    // });
});


describe('Test Suite for authLoginV1 function', () => {



    afterEach(() =>  {  
        clearV1();
    });

    test('Successful authLoginV1', () => {   
        let authId:any = authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker')
        authId = authId.authUserId;
        expect(authLoginV1('moniker@hotmail.com', 'pvssword')).toStrictEqual({authUserId: authId});    
    });

    test('Error passing invalid email through authLoginV1', () => {   
        expect(authLoginV1('moniker@hotmail.com', 'pvssword')).toStrictEqual({error: expect.any(String)});    
    });

    test('Error passing incorrect password into authLoginV1', () => {
        authRegisterV1('moniker@hotmail.com', 'pvssword', 'real', 'moniker')
        expect(authLoginV1('moniker@hotmail.com', 'pxssword')).toStrictEqual({error: expect.any(String)});    
    });

    
});