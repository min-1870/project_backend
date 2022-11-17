import { error } from './types';
import { database } from './dataStore';
import HTTPError from 'http-errors';

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

  const timeFinish = { timeFinish: (new Date()).getTime() / 1000 + length };

  activeStandup.push({
    channelId: channelId,
    message: '',
    timeFinish: timeFinish.timeFinish
  });

  standupEnd(uId, channelId, length);

  return timeFinish;
}

function standupEnd(uId: number, channelId: number, length: number) {
  setTimeout(function() {
    const standup = activeStandup.find(i => i.channelId === channelId);

    if (standup.message !== '') {
      database.addMessageToChannel(standup.message, uId, channelId);
    }

    activeStandup = activeStandup.filter(i => i.channelId !== channelId);
  }, length * 1000);
}

export function standupSend (token: string, channelId: number, message: string): error|Record<string, never> {
  const uId = database.getUserByToken(token).uId;

  if (database.isChannelIdValid(channelId) === false) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  } else if (!activeStandup.find(i => i.channelId === channelId)) {
    throw HTTPError(400, 'an active standup is not currently running in the channel');
  } else if (database.isUserMemberInChannel(uId, channelId) === false) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  const standup = activeStandup.find(i => i.channelId === channelId);
  const handleStr = database.getUserByToken(token).handleStr;

  if (standup.message !== '') {
    standup.message = standup.message + '\n' + handleStr + ': ' + message;
  } else {
    standup.message = handleStr + ': ' + message;
  }

  return {};
}

export function standupActive (token: string, channelId: number): error|{isActive: boolean, timeFinish: number|null} {
  const uId = database.getUserByToken(token).uId;

  if (database.isChannelIdValid(channelId) === false) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (database.isUserMemberInChannel(uId, channelId) === false) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  const result = {
    isActive: null,
    timeFinish: null
  };

  if (activeStandup.find(i => i.channelId === channelId)) {
    result.isActive = true;
    result.timeFinish = activeStandup.find(i => i.channelId === channelId).timeFinish;
  } else {
    result.isActive = false;
  }

  return result;
}
