import { channelMessagesV1 } from './channel.js';
import { clearV1 } from './other.js';

describe('Test set for the function channelMessagesV1', () => {
  const testUser = {  //profile of the test user1
      uId: 1,
      namesFirst: 'Adam',
      namesLast: 'Johnston',
      email: 'test@gmail.com',
      handleStr: 'adamjohnston',
      password: 'test123'
  }
  const testUser2 = {  //profile of the test user2
      uId: 2,
      namesFirst: 'Adamm',
      namesLast: 'Johnston',
      email: 'test@gmail.com',
      handleStr: 'adammjohnston',
      password: 'test1234'
  }
  const testChannel = {  //profile of the test channel
      channelId: 1,
      isPublic: true,
      name: 'testChannel',
      ownerMembers: [testUser],
      allMembers: [testUser],
      messages: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100','101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123']
  }

  beforeEach(() => {       //before every test reset and add a new test user & channel
      clearV1()
      let data = getData()
      data = {
          users: [
            testUser, testUser2
          ],
          channels: [
            testChannel
          ]
      }
      setData(data)
  });

  test('Checks the function return error for an invalid channelId', () => {

    expect(channelMessagesV1(1, 123144, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for bigger or smaller input on the argument start', ()=> {

    expect(channelMessagesV1(1, 1, 1235123)).toStrictEqual({ error: expect.any(String) });
    expect(channelMessagesV1(1, 1, -1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for unauthorised user', ()=> {

    expect(channelMessagesV1(2, 1, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return error for invalid userId', ()=> {

    expect(channelMessagesV1(14134124, 1, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Checks the function return correct message', ()=> {

    expect(channelMessagesV1(1, 1, 0)).toStrictEqual({messages: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49'], start: 0, end: 50});
    expect(channelMessagesV1(1, 1, 50)).toStrictEqual({messages: ['50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99'], start: 50, end: 100});
    expect(channelMessagesV1(1, 1, 100)).toStrictEqual({messages: ['100','101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123'], start: 100, end: -1});
  });
});

