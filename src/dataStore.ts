import {
  dataStore,
  dataStoreChannel,
  dataStoreDm,
  dataStorePassReset,
  dataStoreUser,
  messages,
  notificationsOutput,
} from './types';
import fs from 'fs';
import HTTPError from 'http-errors';
import { getHashOf, hashToken } from './hash';
import { generateAuthUserId, generateChannelId, generateDmId, generateMessageId, generateToken } from './ids';
import { dataStoreNotification, Notification, notificationTypes } from './notifications';
import { React } from './message';

class DataStore {
  users: dataStoreUser[];
  channels: dataStoreChannel[];
  dms: dataStoreDm[];
  passwordResets: dataStorePassReset[];
  notifications: dataStoreNotification[];
  dataSournceFile = './database.json';

  constructor() {
    if (fs.existsSync(this.dataSournceFile)) {
      const dbstr = fs.readFileSync(this.dataSournceFile);
      const data = JSON.parse(String(dbstr)) as dataStore;
      this.users = data.users;
      this.channels = data.channels;
      this.dms = data.dms;
      this.passwordResets = data.passwordResets;
      this.notifications = data.notifications;
    } else {
      this.users = [];
      this.channels = [];
      this.dms = [];
      this.passwordResets = [];
      this.notifications = [];
    }
  }

  /**
   * Get a user by user ID.
   *
   * @param userId - target user ID.
   * @returns {dataStoreUser} of the target user.
   */
  getUserById(userId: number): dataStoreUser {
    const user = this.users.find(user => user.uId === userId);
    if (!user) {
      throw HTTPError(400, 'Invalid user ID');
    }
    return user;
  }

  /**
   *
   * @param email - Get a user by email
   * @returns {dataStoreUser} of the target user.
   */
  getUserByEmail(email: string): dataStoreUser {
    const user = this.users.find(user => user.email === email);
    if (!user) {
      throw HTTPError(400, 'Invalid user email');
    }
    return user;
  }

  /**
   * Checks if a session token is valid. Throws 403 if not.
   *
   * @param token - token to validaite
   */
  validateSessionToken(token: string) {
    const user = this.users.find(user => user.sessionTokens.includes(token));
    if (!user) {
      throw HTTPError(403, 'Invalid token.');
    }
  }

  /**
   * Get a user by token
   *
   * @param token - token of the user to get.
   * @returns {dataStoreUser} the user to get.
   */
  getUserByToken(token: string): dataStoreUser {
    this.validateSessionToken(token);
    return this.users.find(user => user.sessionTokens.includes(token));
  }

  /**
   * Checks if an email is used in the database.
   *
   * @param email - Email to check.
   * @returns {boolean} true if used else false.
   */
  isEmailUsed(email: string): boolean {
    return this.users.some(user => user.email === email);
  }

  /**
   * Checks if a user ID is valid.
   *
   * @param userId - user ID to check.
   * @returns {boolean} true if valid else false.
   */
  isUserIdValid(userId: number) {
    return this.users.some(user => user.uId === userId);
  }

  isChannelIdValid(channelId: number) {
    return this.channels.some(c => c.channelId === channelId);
  }

  isMessageIdValid(messageId: number) {
    return this.channels.some(c => c.messages.map(m => m.messageId).includes(messageId)) ||
      this.dms.some(d => d.messages.map(m => m.messageId).includes(messageId));
  }

  isDmIdValid(dmId: number) {
    return this.dms.some(dm => dm.dmId === dmId);
  }

  /**
   * Checks if a handle str is used.
   *
   * @param handleStr - handleStr to check for
   * @returns {boolean} true if used else false.
   */
  isHandleStrUsed(handleStr: string): boolean {
    return this.users.some(user => user.handleStr === handleStr);
  }

  updateUserHandleStr(userId: number, handleStr: string) {
    if (handleStr.length < 3 || handleStr.length > 20) {
      throw HTTPError(400, 'handleStr is not correct size');
    }
    if (!(/^[A-Za-z0-9]*$/.test(handleStr))) {
      throw HTTPError(400, 'handleStr has non-alphanumeric characters');
    }
    if (this.isHandleStrUsed(handleStr)) {
      throw HTTPError(400, 'handle is already in use');
    }
    this.users.find(u => u.uId === userId).handleStr = handleStr;
    this.saveDataStore();
  }

  updateUserEmail(userId: number, email: string) {
    if (this.isEmailUsed(email)) {
      throw HTTPError(400, 'email is already in use');
    }
    this.users.find(u => u.uId === userId).email = email;
    this.saveDataStore();
  }

  updateUserName(userId: number, nameFirst, nameLast) {
    if (nameFirst.length < 1 || nameFirst.length > 50) {
      throw HTTPError(400, 'First name is not correct length');
    }
    if (nameLast.length < 1 || nameLast.length > 50) {
      throw HTTPError(400, 'Last name is not correct length');
    }
    this.users.find(u => u.uId === userId).nameFirst = nameFirst;
    this.users.find(u => u.uId === userId).nameLast = nameLast;
    this.saveDataStore();
  }

  /**
   * Checks if a user is a global owner.
   *
   * @param userId - user ID to check for.
   * @returns {boolean} true if global owner else false.
   */
  isUserGlobalOwner(userId: number) {
    const user = this.users.find(user => user.uId === userId);
    if (!user) {
      throw HTTPError(400, 'Invalid user ID');
    }
    return user.isGlobalOwner;
  }

  /**
   * Checks how many users are globalowners.
   *
   *
   * @returns number of global owners
   */
  howManyGlobalOwners(): number {
    let counter = 0;
    for (const item of this.users) {
      if (item.isGlobalOwner === true) {
        counter++;
      }
    }
    return counter;
  }

  /**
   * Add user to the database and return the created user.
   *
   * @param email - email of the user.
   * @param password  - password of the user.
   * @param nameFirst - first name of the user.
   * @param nameLast - last name of the user.
   * @param handleStr - handle str of the user.
   */
  addUser(
    email: string,
    password: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string): dataStoreUser {
    const newUser: dataStoreUser = {
      uId: generateAuthUserId(),
      email,
      password,
      nameFirst,
      nameLast,
      handleStr,
      isGlobalOwner: !this.hasGlobalOwner(),
      sessionTokens: []
    };
    this.users.push(newUser);
    this.addSessionTokenForUser(newUser.uId);
    this.saveDataStore();
    return newUser;
  }

  /**
   * Generates a session token for a user and add it to the data store
   * and return it.
   * @param userId
   *
   * @returns {string} token
   */
  addSessionTokenForUser(userId: number): string {
    const token = hashToken(generateToken());
    this.users.find(user => user.uId === userId).sessionTokens.push(token);
    this.saveDataStore();
    return token;
  }

  /**
   * Remove a session token in the data store.
   *
   * @param token - token to remove.
   * @returns {} an empty object if success.
   */
  removeSessionToken(token: string): Record<string, never> {
    const user = this.getUserByToken(token);
    this.users.find(user => user.sessionTokens.includes(token))
      .sessionTokens.splice(user.sessionTokens.indexOf(token), 1);
    this.saveDataStore();
    return {};
  }

  /**
   * Remove a session token in the data store for a user.
   *
   * @param userId - user id to clear sessions for.
   * @returns {} an empty object if success.
   */
  removeSessionTokenForUser(userId: number): Record<string, never> {
    this.users.find(user => user.uId === userId)
      .sessionTokens = [];
    this.saveDataStore();
    return {};
  }

  /**
   * Get data store channel by channel ID.
   *
   * @param channelId - channel ID to get.
   * @returns {dataStoreChannel} dataStoreChannel with that ID.
   */
  getDataStoreChannelByChannelId(channelId: number): dataStoreChannel {
    // console.log(channelId);
    const channel = this.channels.find(c => c.channelId === channelId);
    if (!channel) {
      throw HTTPError(400, 'Invalid channel ID.');
    }
    return channel;
  }

  getDataStoreDmByDmId(dmId: number): dataStoreDm {
    // console.log(channelId);
    const dm = this.dms.find(c => c.dmId === dmId);
    if (!dm) {
      throw HTTPError(400, 'Invalid channel ID.');
    }
    return dm;
  }

  /**
   * Get data store channel by message ID.
   *
   * @param messageId - message ID of the message.
   * @returns {dataStoreChannel} dataStoreChannel with that message.
   */
  getDataStoreChannelByMessageId(messageId: number): dataStoreChannel {
    const channelWithMessage = this.channels.find(channel =>
      channel.messages.some(m => m.messageId === messageId));

    if (!channelWithMessage) {
      throw HTTPError(400, 'Invalid message ID.');
    }
    return channelWithMessage;
  }

  getDataStoreDmByMessageId(messageId: number): dataStoreDm {
    const channelWithMessage = this.dms.find(channel =>
      channel.messages.some(m => m.messageId === messageId));

    if (!channelWithMessage) {
      throw HTTPError(400, 'Invalid message ID.');
    }
    return channelWithMessage;
  }

  /**
   * Checks if a message is in any channels.
   *
   * @param messageId - message ID to check for
   * @returns true if message ID is used.
   */
  isMessageInChannels(messageId: number): boolean {
    return this.channels
      .some(c => c.messages.some(m => m.messageId === messageId));
  }

  isMessageInDms(messageId: number): boolean {
    return this.dms
      .some(c => c.messages.some(m => m.messageId === messageId));
  }

  /**
   * Get a message in data store using message ID.
   *
   * @param messageId - message ID of the message to get.
   * @returns {messages} meesage with that ID.
   */
  getDataStoreMessageByMessageId(messageId: number): messages {
    if (this.isMessageInChannels(messageId)) {
      const channel = this.getDataStoreChannelByMessageId(messageId);
      const messageInChannel = channel.messages.find(m => m.messageId === messageId);
      return messageInChannel;
    }
    const messageInDm = this.dms.find(
      dm => dm.messages.some(m => m.messageId === messageId))
      .messages.find(m => m.messageId === messageId);
    if (!messageInDm) {
      throw HTTPError(400, 'Invalid message ID');
    }
    return messageInDm;
  }

  getDmByMessageId(messageId: number) {
    const dm = this.dms.find(dm => dm.messages.some(message => message.messageId === messageId));
    if (!dm) {
      throw HTTPError(400, 'Message not in DM.');
    }
    return dm;
  }

  removeChannelMessageById(messageId: number) {
    const channel = this.getDataStoreChannelByMessageId(messageId);
    const message = this.getDataStoreMessageByMessageId(messageId);
    this.channels.find(c =>
      c.channelId === channel.channelId).messages.splice(
      channel.messages.findIndex(m => m.messageId === message.messageId), 1);
    this.saveDataStore();
  }

  removeUserChannelMessage(messageId: number) {
    const message = this.getDataStoreMessageByMessageId(messageId);
    message.message = 'Removed user';
    this.saveDataStore();
  }

  removeUserDmMessage(messageId: number) {
    const message = this.getDataStoreMessageByMessageId(messageId);
    message.message = 'Removed user';
    this.saveDataStore();
  }

  removeUserName(uId: number) {
    const user = this.getUserById(uId);
    user.nameFirst = 'Removed';
    user.nameLast = 'user';
    user.handleStr = '';
    user.email = '';
    this.saveDataStore();
  }

  removeDmMessageById(messageId: number) {
    const dm = database.getDmByMessageId(messageId);
    this.dms.find(d =>
      d.dmId === dm.dmId).messages.splice(
      dm.messages.findIndex(m => m.messageId === messageId), 1);
    this.saveDataStore();
  }

  /**
   * Get a data store dm.
   *
   * @param dmId - dmId of the dm.
   * @returns {dataStoreDm} dm object with that ID.
   */
  getDataStoreDm(dmId: number): dataStoreDm {
    const dm = this.dms.find(dm => dm.dmId === dmId);
    if (!dm) {
      throw HTTPError(400, 'Invalid dmId.');
    }
    return dm;
  }

  /**
   * Create a new channel and return its ID.
   *
   * @param name - name of the channel.
   * @param isPublic - indicate if the channel is public or not.
   * @param creatorId - creator of the channel's user ID.
   * @returns {dataStoreChannel} created channel object.
   */
  addNewChannel(name: string, isPublic: boolean, creatorId: number): dataStoreChannel {
    const newChannel: dataStoreChannel = {
      channelId: generateChannelId(),
      isPublic,
      name,
      ownerMembers: [creatorId],
      allMembers: [creatorId],
      messages: []
    };
    this.channels.push(newChannel);
    this.saveDataStore();
    return newChannel;
  }

  /**
   * Check if a user is a member of a channel.
   *
   * @param userId - user ID of the member to check for.
   * @param channelId - channel ID of the channel to check for.
   * @returns {boolean} true if a member else false.
   */
  isUserMemberInChannel(userId: number, channelId: number): boolean {
    const user = this.getUserById(userId);
    return this.getDataStoreChannelByChannelId(channelId).allMembers.includes(user.uId);
  }

  /**
   * Get all channel that the user is part of.
   *
   * @param userId - target user ID.
   * @returns {dataStoreChannel[]} the list of channels.
   */
  getAllChannelsUserIsMemberOf(userId: number): dataStoreChannel[] {
    return this.channels
      .filter(channel => this.isUserMemberInChannel(userId, channel.channelId)) ||
      [];
  }

  /**
   * Get all the channels.
   *
   * @returns {dataStoreChannel[]} the list of channels.
   */
  getAllChannels(): dataStoreChannel[] {
    return this.channels;
  }

  /**
   * Check if a user is an owner of a channel.
   *
   * @param userId - user ID of the member to check for.
   * @param channelId - channel ID of the channel to check for.
   * @returns {boolean} true if an owner else false.
   */
  isUserOwnerMemberInChannel(userId: number, channelId: number): boolean {
    const user = this.getUserById(userId);
    return this.getDataStoreChannelByChannelId(channelId).ownerMembers.includes(user.uId);
  }

  /**
   * Checks if a user is a memeber of dm.
   *
   * @param userId - user ID to check for.
   * @param dmId - dm ID to check for
   * @returns {boolean} true if a member else false.
   */
  isUserMemberInDm(userId: number, dmId: number) {
    return this.getDataStoreDm(dmId).allMembers.includes(userId);
  }

  /**
   * Add a user to channel.
   *
   * @param userId - user ID of the user to add.
   * @param channelId - channel ID to add to.
   */
  addUserToChannel(userId: number, channelId: number) {
    const user = this.getUserById(userId);
    const channel = this.getDataStoreChannelByChannelId(channelId);
    // Check if the user is already a member or not. This is needed since
    // when adding global owner, they would bypass the being a member first rule.
    // TODO: Check behaviour of global owner when they are added then removed.
    if (this.isUserMemberInChannel(user.uId, channelId)) {
      throw HTTPError(400, 'Already a member of the channel.');
    }
    this.channels
      .find(c => c.channelId === channel.channelId)
      .allMembers
      .push(user.uId);
    this.saveDataStore();
  }

  /**
   * Remove a user from a channel. Their messages will remain. If they are
   * an owner, they also remved as owner.
   *
   * @param userId - the user ID of the user leaving.
   * @param channelId - the channel ID of the channel to leave from.
   */
  removeUserFromChannel(userId: number, channelId: number) {
    const user = this.getUserById(userId);
    const channel = this.getDataStoreChannelByChannelId(channelId);
    if (!this.isUserMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(403, 'The user is already not in the channel.');
    }
    this.channels.find(c => c.channelId === channel.channelId)
      .allMembers.splice(channel.allMembers.indexOf(user.uId), 1);
    if (this.isUserOwnerMemberInChannel(user.uId, channel.channelId)) {
      this.channels.find(c => c.channelId === channel.channelId)
        .ownerMembers.splice(channel.ownerMembers.indexOf(user.uId), 1);
    }
    this.saveDataStore();
  }

  /**
   * Add a user to channel as owner. They must be a member already to become an
   * owner.
   *
   * @param userId - user id of the user to become an owner.
   * @param channelId - channel ID to become an owner for.
   */
  addOwnerToChannel(userId: number, channelId: number) {
    const user = this.getUserById(userId);
    const channel = this.getDataStoreChannelByChannelId(channelId);

    if (this.isUserOwnerMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(400, 'Already an owner of the channel.');
    }
    if (!this.isUserMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(400, 'Not a member of the channel.');
    }
    this.channels
      .find(c => c.channelId === channel.channelId)
      .ownerMembers
      .push(user.uId);
    this.saveDataStore();
  }

  /**
   * Remove an owner from channel.
   *
   * @param userId - user ID of the owner to remove.
   * @param channelId - channel to remove the user from.
   */
  removeOwnerFromChannel(userId: number, channelId: number) {
    const user = this.getUserById(userId);
    const channel = this.getDataStoreChannelByChannelId(channelId);

    if (channel.ownerMembers.length <= 1) {
      throw HTTPError(400, 'A channel must have at least one owner');
    }
    if (!this.isUserOwnerMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(400, 'The user to remove as owner is not an owner already.');
    }
    this.channels
      .find(c => c.channelId === channelId)
      .ownerMembers
      .splice(channel.ownerMembers.indexOf(user.uId, 1));
    this.saveDataStore();
  }

  /**
   * Checks if there's a global owner yet in the system.
   *
   * @return {boolean} true if there is.
   */
  hasGlobalOwner(): boolean {
    return this.users.length !== 0;
  }

  /**
   * Check if reset code is valid for user.
   * @param resetCode
   * @returns true if valid.
   */
  isResetCodeValid(resetCode: string) {
    return this.passwordResets.some(reset => reset.resetCode === resetCode);
  }

  /**
   * Remove a reset code from storage.
   *
   * @param resetCode reset code to remove.
   */
  removePassWordReset(resetCode: string) {
    if (!this.isResetCodeValid(resetCode)) {
      throw HTTPError(400, 'Invalid reset code.');
    }
    this.passwordResets.splice(this.passwordResets.indexOf(
      this.passwordResets.find(p => p.resetCode === resetCode)), 1);
    this.saveDataStore();
  }

  /**
   * Update the user's password.
   *
   * @param userId - user ID of the user to update.
   * @param newPassword - the new password.
   */
  updateUserPassword(userId: number, newPassword: string) {
    const user = this.getUserById(userId);
    this.users.find(u => u.uId === user.uId).password = getHashOf(newPassword);
    this.saveDataStore();
  }

  /**
   * Add password reset info into the database.
   *
   * @param userId - user ID sent to for reset.
   * @param resetCode - the reset code given.
   */
  addPasswordResets(userId: number, resetCode: string) {
    const user = this.getUserById(userId);
    const newPasswordReset: dataStorePassReset = {
      uId: user.uId,
      resetCode
    };
    this.passwordResets.push(newPasswordReset);
    this.saveDataStore();
  }

  /**
   * Get password reset by reset code.
   * @param resetCode - reset code
   * @returns {dataStorePassReset} data store pass reset.
   */
  getPasswordResetsByResetCode(resetCode: string): dataStorePassReset {
    const passReset = this.passwordResets.find(p => p.resetCode === resetCode);
    if (!passReset) {
      throw HTTPError(400, 'Reset code not found.');
    }
    return passReset;
  }

  /**
   * Add a new DM.
   *
   * @param creatorId - creator of the DM.
   * @param name - name of DM.
   * @param uIds - member uIDs of the dm.
   * @returns {{dmId: number}} object
   */
  addDm(creatorId: number, name: string, uIds: number[]): {dmId: number} {
    const creator = this.getUserById(creatorId);
    const newDm: dataStoreDm = {
      dmId: generateDmId(),
      name,
      ownerMembers: [creator.uId],
      allMembers: [creator.uId].concat(uIds),
      messages: [],
      creatorId
    };
    this.dms.push(newDm);
    return {
      dmId: newDm.dmId
    };
  }

  addMessageToChannel(message: string, userId: number, channelId: number) {
    const channel = this.getDataStoreChannelByChannelId(channelId);
    const user = this.getUserById(userId);
    const newMessage = createNewMessage(user.uId, message);
    this.channels.find(c => c === channel).messages.push(newMessage);
    this.saveDataStore();
    return newMessage;
  }

  addMessageToDm(message: string, userId: number, dmId: number) {
    const dm = this.getDmById(dmId);
    const user = this.getUserById(userId);
    const newMessage = createNewMessage(user.uId, message);
    this.dms.find(d => d === dm).messages.push(newMessage);
    this.saveDataStore();
    return newMessage;
  }

  editChannelMessage(messageId: number, newMessage: string) {
    this.channels.find(c => c.messages.some(message => message.messageId === messageId))
      .messages.find(m => m.messageId === messageId).message = newMessage;
    this.saveDataStore();
  }

  editDmMessage(messageId: number, newMessage: string) {
    this.getDmByMessageId(messageId).messages.find(m => m.messageId === messageId).message = newMessage;
    this.saveDataStore();
  }

  /**
   * Get all dms.
   * @returns {dataStoreDm[]} all the dms
   */
  getAllDms(): dataStoreDm[] {
    return this.dms;
  }

  isUserOwnerInDm(userId: number, dmId: number): boolean {
    const user = this.getUserById(userId);
    return this.dms.find(d => d.dmId === dmId).ownerMembers.includes(user.uId);
  }

  isUserInDm(userId: number, dmId: number) {
    const user = this.getUserById(userId);
    return this.dms.find(d => d.dmId === dmId).allMembers.includes(user.uId) ||
      this.isUserOwnerInDm(user.uId, dmId);
  }

  isUserCreatorOfDm(userId: number, dmId) {
    const user = this.getUserById(userId);
    const dm = this.getDmById(dmId);
    return dm.creatorId === user.uId;
  }

  getDmById(dmId: number) {
    const dm = this.dms.find(d => d.dmId === dmId);
    if (!dm) {
      throw HTTPError(400, 'Invalid dm ID.');
    }
    return dm;
  }

  removeDm(dmId: number) {
    const dm = this.getDmById(dmId);
    this.dms.splice(this.dms.findIndex(d => d === dm), 1);
    this.saveDataStore();
  }

  removeUserFromDm(userId: number, dmId: number) {
    const dm = this.getDmById(dmId);
    const user = this.getUserById(userId);
    if (!this.isUserMemberInDm(userId, dm.dmId)) {
      throw HTTPError(403, 'Not a member of DM.');
    }
    this.dms.find(d => d === dm).allMembers.splice(dm.allMembers.indexOf(user.uId), 1);
    this.dms.find(d => d === dm).ownerMembers.splice(dm.ownerMembers.indexOf(user.uId), 1);
    this.saveDataStore();
  }

  addNotification(
    senderId: number,
    receiverId: number,
    type: number,
    dmId: number,
    messageId: number,
    channelId: number) {
    let notification: Notification;
    if (type === notificationTypes.AddedToChannel ||
        type === notificationTypes.TaggedToChannel ||
        type === notificationTypes.ReactedToChannelMessage) {
      notification = new Notification(type, -1, channelId, senderId, messageId);
    } else {
      // console.log('add ing with ', dmId);
      notification = new Notification(type, dmId, -1, senderId, messageId);
    }
    const notifToStore: dataStoreNotification = {
      receiverId,
      senderId,
      notification
    };
    this.notifications.push(notifToStore);

    this.saveDataStore();
  }

  getNotificationsByReceiverId(
    userId: number
  ): notificationsOutput[] {
    const user = database.getUserById(userId);
    return this.notifications.filter(notif => notif.receiverId === user.uId)
      .map(notif => {
        return {
          channelId: notif.notification.channelId,
          dmId: notif.notification.dmId,
          notificationMessage: notif.notification.getNotificationMessage()
        };
      });
  }

  addReact(
    reactId: number,
    messageId: number,
    userId: number
  ) {
    const user = this.getUserById(userId);
    if (!this.getDataStoreMessageByMessageId(messageId).reacts.some(r => r.reactId === reactId)) {
      const newReact = new React(reactId, [user.uId]);
      this.getDataStoreMessageByMessageId(messageId).reacts.push(newReact);
    }
  }

  addPin(
    messageId: number
  ) {
    this.getDataStoreMessageByMessageId(messageId).isPinned = true;
  }

  removePin(
    messageId: number
  ) {
    this.getDataStoreMessageByMessageId(messageId).isPinned = false;
  }

  changePermOwner(uId: number) {
    const user = this.getUserById(uId);
    user.isGlobalOwner = false;
    this.saveDataStore();
  }

  changePermUser(uId: number) {
    const user = this.getUserById(uId);
    user.isGlobalOwner = true;
    this.saveDataStore();
  }

  /**
   * Persist data store.
   */
  saveDataStore() {
    const jsonstr = JSON.stringify({
      users: this.users,
      channels: this.channels,
      dms: this.dms,
      passwordResets: this.passwordResets
    });
    fs.writeFileSync(this.dataSournceFile, jsonstr);
  }

  clear() {
    this.users = [];
    this.channels = [];
    this.dms = [];
    this.passwordResets = [];
    this.notifications = [];
    this.saveDataStore();
  }
}

function createNewMessage(uId, message): messages {
  return {
    messageId: generateMessageId(),
    uId,
    message,
    timeSent: Date.now(),
    reacts: [],
    isPinned: false
  };
}

export const database = new DataStore();
