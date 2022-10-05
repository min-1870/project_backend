import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { channelJoinV1 } from './channel.js';
import { clearV1 } from './other.js';

beforeEach(() => {
  clearV1();
});

test('channelId does not refer to a valid channel', () => {
  const authUserId = authRegisterV1('email@email.com', 'password', 'nameFirst', 'nameLast');
  const channelId = channelsCreateV1(authUserId, 'name', true);
  const authUserId2 = authRegisterV1('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
  expect(channelJoinV1(authUserId2, channelId + 1)).toStrictEqual({ error: 'error' });
});

test('the authorised user is already a member of the channel', () => {
  const authUserId = authRegisterV1('email@email.com', 'password', 'nameFirst', 'nameLast');
  const channelId = channelsCreateV1(authUserId, 'name', true);
  expect(channelJoinV1(authUserId, channelId)).toStrictEqual({ error: 'error' });
});

test('channelId refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner', () => {
  const authUserId = authRegisterV1('email@email.com', 'password', 'nameFirst', 'nameLast');
  const channelId = channelsCreateV1(authUserId, 'name', false);
  const authUserId2 = authRegisterV1('email2@email.com', 'password2', 'nameFirst2', 'nameLast2');
  expect(channelJoinV1(authUserId2, channelId)).toStrictEqual({ error: 'error' });
});

test('authUserId is invalid', () => {
  const authUserId = authRegisterV1('email@email.com', 'password', 'nameFirst', 'nameLast');
  const channelId = channelsCreateV1(authUserId, 'name', true);
  expect(channelJoinV1(authUserId + 1, channelId)).toStrictEqual({ error: 'error' });
});