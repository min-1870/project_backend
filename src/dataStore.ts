import {
  dataStore,
  dataStoreChannel,
  dataStoreDm,
  dataStorePassReset,
  dataStoreUser,
  messages
} from './types';
import fs from 'fs';
import HTTPError from 'http-errors';
import {getHashOf, hashToken} from './hash';
import {generateAuthUserId, generateToken} from './ids';

class DataStore {
  users: dataStoreUser[];
  channels: dataStoreChannel[];
  dms: dataStoreDm[];
  passwordResets: dataStorePassReset[];
  dataSournceFile = './database.json'

  constructor() {
    if (fs.existsSync(this.dataSournceFile)) {
      const dbstr = fs.readFileSync(this.dataSournceFile);
      const data = JSON.parse(String(dbstr)) as dataStore;
      this.users = data.users
      this.channels = data.channels
      this.dms = data.dms
      this.passwordResets = this.passwordResets
    } else {
      this.users = []
      this.channels = []
      this.dms = []
      this.passwordResets = []
    }
  }

  /**
   * Get a user by user ID.
   *
   * @param userId - target user ID.
   * @returns {dataStoreUser} of the target user.
   */
  getUserById(userId: number): dataStoreUser {
    const user = this.users.find(user => user.uId === userId)
    if (user === null) {
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
    const user = this.users.find(user => user.email === email)
    if (user === null) {
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
    const user = this.users.find(user => user.sessionTokens.some(t => t === token))
    if (user === null) {
      throw HTTPError(403, 'Invalid token.')
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
    return this.users.find(user => user.sessionTokens.some(t => t === token))
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
   * Checks if a handle str is used.
   *
   * @param handleStr - handleStr to check for
   * @returns {boolean} true if used else false.
   */
  isHandleStrUsed(handleStr: string): boolean {
    return this.users.some(user => user.handleStr === handleStr);
  }

  /**
   * Checks if a user is a global owner.
   *
   * @param userId - user ID to check for.
   * @returns {boolean} true if global owner else false.
   */
  isUserGlobalOwner(userId: number) {
    const user = this.users.find(user => user.uId === userId);
    if (user === null) {
      throw HTTPError(400, 'Invalid user ID');
    }
    return user.isGlobalOwner;
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
    this.addSessionTokenForUser(newUser.uId)
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
    return token
  }

  /**
   * Remove a session token in the data store.
   *
   * @param token - token to remove.
   * @returns {} an empty object if success.
   */
  removeSessionToken(token: string): Record<string, never> {
    this.validateSessionToken(token)
    this.users.forEach(user => {
      if (user.sessionTokens.some(t => t === token)) {
        user.sessionTokens.splice(user.sessionTokens.indexOf(token), 1);
      }
    })
    this.saveDataStore();
    return {}
  }

  /**
   * Get data store channel by channel ID.
   *
   * @param channelId - channel ID to get.
   * @returns {dataStoreChannel} dataStoreChannel with that ID.
   */
  getDataStoreChannelByChannelId(channelId: number): dataStoreChannel {
    const channel = this.channels.find(channel => channel.channelId === channelId)
    if (channel === null) {
      throw HTTPError(400, 'Invalid channel ID.');
    }
    return channel;
  }

  /**
   * Get data store channel by message ID.
   *
   * @param messageId - message ID of the message.
   * @returns {dataStoreChannel} dataStoreChannel with that message.
   */
  getDataStoreChannelByMessageId(messageId: number): dataStoreChannel  {
    const channelWithMessage = this.channels.find(channel =>
      channel.messages.some(m => m.messageId === messageId))

    if (channelWithMessage === null) {
      throw HTTPError(400, 'Invalid message ID.')
    }
    return channelWithMessage;
  }

  /**
   * Get a message in data store using message ID.
   *
   * @param messageId - message ID of the message to get.
   * @returns {messages} meesage with that ID.
   */
  getDataStoreMessageByMessageId(messageId: number): messages {
    const channel = this.getDataStoreChannelByMessageId(messageId);
    return channel.messages.find(m => m.messageId === messageId);
  }

  /**
   * Get a data store dm.
   *
   * @param dmId - dmId of the dm.
   * @returns {dataStoreDm} dm object with that ID.
   */
  getDataStoreDm(dmId: number): dataStoreDm {
    const dm = this.dms.find(dm => dm.dmId === dmId);
    if (dm === null) {
      throw HTTPError(400, 'Invalid dmId.')
    }
    return dm;
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
      throw HTTPError(400, 'Already a member of the channel.')
    }
    this.channels
      .find(c => c.channelId === channel.channelId)
      .allMembers
      .push(user.uId)
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
    if (this.isUserGlobalOwner(user.uId)) {
      // Do nothing if a global owner as they are already an owner.
      return;
    }
    if (this.isUserOwnerMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(400, 'Already an owner of the channel.')
    }
    if (this.isUserMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(400, 'Not a member of the channel.')
    }
    this.channels
      .find(c => c.channelId === channel.channelId)
      .ownerMembers
      .push(user.uId)
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
    if (!this.isUserOwnerMemberInChannel(user.uId, channel.channelId)) {
      throw HTTPError(400, 'Not an owner of the channel.');
    }
    if (channel.ownerMembers.length <= 1) {
      throw HTTPError(400, 'A channel must have at least one owner');
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
      throw HTTPError(400, 'Invalid reset code.')
    }
    this.passwordResets.splice(this.passwordResets.indexOf(
      this.passwordResets.find(p => p.resetCode === resetCode)), 1);
    this.saveDataStore()
  }

  /**
   * Update the user's password.
   *
   * @param email - email of the user to update.
   * @param newPassword - the new password.
   */
  updateUserPassword(email: string, newPassword: string) {
    const user = this.getUserByEmail(email);
    this.users.find(u => u.uId === user.uId).password = getHashOf(newPassword)
    this.saveDataStore();
  }

  /**
   * Add password reset info into the database.
   *
   * @param email - email sent to for reset.
   * @param resetCode - the reset code given.
   */
  addPasswordResets(email: string, resetCode: string) {
    this.passwordResets.push({
      email,
      resetCode
    })
    this.saveDataStore();
  }

  /**
   * Get password reset by reset code.
   * @param resetCode - reset code
   * @returns {dataStorePassReset} data store pass reset.
   */
  getPasswordResetsByResetCode(resetCode: string): dataStorePassReset {
    const passReset = this.passwordResets.find(p => p.resetCode === resetCode);
    if (passReset === null) {
      throw HTTPError(400, 'Invalid reset code.')
    }
    return passReset;
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
}

export const database = new DataStore();
