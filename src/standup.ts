import { error } from './types';
import { database } from './dataStore';
import HTTPError from 'http-errors';
import { messageSend } from './message';

let activeStandup = [];

export function standupStart (token: string, channelId: number, length: number): error|{timeFinish: number} {
  const uId = database.getUserByToken(token).uId;

  if (database.isChannelIdValid(channelId) === false) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (length < 0) {
    throw HTTPError(400, 'length is a negative integer');
  } else if (activeStandup.find(i => i.channelId === channelId)) {
    throw HTTPError(400, 'an active standup is currently running in the channel');
  } else if (database.isUserMemberInChannel(uId, channelId) === false) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  activeStandup.push({
    channelId: channelId,
    message: ''
  });

  standupEnd(token, channelId, length);

  return { timeFinish: (new Date()).getTime() / 1000 + length };
}

function standupEnd(token: string, channelId: number, length: number) {
  setTimeout(function() {
    const standup = activeStandup.find(i => i.channelId === channelId);
    if (standup.message !== '') {
      messageSend(token, channelId, standup.message);
    }

    activeStandup = activeStandup.filter(i => i.channelId !== channelId);
  }, length * 1000);
}
