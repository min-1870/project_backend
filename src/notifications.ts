import { database } from './dataStore';
import { notficationResponse } from './types';
import HTTPError from 'http-errors';

export class Notification {
  type: number;
  dmId: number;
  channelId: number;
  senderId: number;
  messageId: number;

  constructor(type: number, dmId: number, channelId: number, senderId: number,
    messageId: number) {
    if (dmId === -1 && channelId === -1) {
      throw HTTPError(400, 'Both channel ID and dm ID cannot be -1.');
    }
    this.type = type;
    this.dmId = dmId;
    this.channelId = channelId;
    this.senderId = senderId;
    this.messageId = messageId;
  }

  getNotificationMessage() {
    if (this.type === notificationTypes.TaggedToChannel || this.type === notificationTypes.TaggedToDm) {
      if (this.channelId !== -1) {
        return `${database.getUserById(this.senderId).handleStr} tagged you in ${database.getDataStoreChannelByChannelId(this.channelId).name}: ${database.getDataStoreMessageByMessageId(this.messageId).message.substring(0, 20)}`;
      } else {
        return `${database.getUserById(this.senderId).handleStr} tagged you in ${database.getDmById(this.dmId).name}: ${database.getDataStoreMessageByMessageId(this.messageId).message.substring(0, 20)}`;
      }
    } else if (this.type === notificationTypes.AddedToChannel || this.type === notificationTypes.AddedToDm) {
      if (this.channelId !== -1) {
        return `${database.getUserById(this.senderId).handleStr} added you to ${database.getDataStoreChannelByChannelId(this.channelId).name}`;
      } else {
        return `${database.getUserById(this.senderId).handleStr} added you to ${database.getDmById(this.dmId).name}`;
      }
    } else {
      if (this.channelId !== -1) {
        return `${database.getUserById(this.senderId).handleStr} reacted to your message in ${database.getDataStoreChannelByChannelId(this.channelId).name}`;
      } else {
        return `${database.getUserById(this.senderId).handleStr} reacted to your message in ${database.getDmById(this.dmId).name}`;
      }
    }
  }
}

export function getNotification(token: string): notficationResponse {
  const user = database.getUserByToken(token);
  return {
    notifications: [...database.getNotificationsByReceiverId(user.uId)].reverse().slice(0, 20)
  };
}

export interface NotificationTypes {
  TaggedToChannel: number,
  TaggedToDm: number,
  AddedToChannel: number,
  AddedToDm: number,
  ReactedToChannelMessage: number,
  ReactedToDmMessage: number
}

export const notificationTypes: NotificationTypes = {
  TaggedToChannel: 0,
  TaggedToDm: 1,
  AddedToChannel: 2,
  AddedToDm: 3,
  ReactedToChannelMessage: 4,
  ReactedToDmMessage: 5
};

export interface dataStoreNotification {
  receiverId: number,
  senderId: number,
  notification: Notification
}
