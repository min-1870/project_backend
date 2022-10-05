import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

describe('Test Suite for auth functions', () => {



    afterEach(() =>  {  
        clearV1();
    });

    test('Successful authRegisterV1', () => {   
        authRegisterV1('moniker2@hotmail.com', 'pvssword', '7real43E', 'MoNi9IO64kerMoNi9IO64kerMoNi9IO64ker');
        authRegisterV1('moniker3@hotmail.com', 'pvssword', '7real43E', 'MoNi9IO64kerMoNi9IO64kerMoNi9IO64ker');
        authRegisterV1('moniker4@hotmail.com', 'pvssword', '7real43E', 'MoNi9IO64kerMoNi9IO64kerMoNi9IO64ker');
        expect(authRegisterV1('moniker@hotmail.com', 'pvssword', '7real43E', 'MoNi9IO64kerMoNi9IO64kerMoNi9IO64ker')).toStrictEqual(expect.any(Number));    
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