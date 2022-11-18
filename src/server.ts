import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { channelsCreate, channelsListAll, channelsList } from './channels';
import { clear } from './other';
import {
  authLoginV1,
  authRegisterV1,
  getResetCodes,
  logOut,
  resetPassword,
  sendPasswordResetEmail
} from './auth';
import {
  userProfileEmailChange,
  userProfileHandleChange,
  userProfileNameChange,
  userProfile,
  listAllUsersV1
} from './users';
import {
  authRegisterRequest,
  authLoginRequest,
  channelMessagesRequest,
  channelsCreateRequest,
  userProfileRequest,
  dmCreateRequest,
  userProfileSethandleRequest,
  channelJoinRequest,
  messageSendRequest,
  channelInviteRequest,
  userProfileSetname,
  userProfileSetemail,
  dmDeleteRequest,
  messageRemoveRequest,
  messageEditRequest,
  channelDetailsRequest,
  channelAddownerRequest,
  dmMessagesRequest,
  messageSendDmRequest,
  channelLeaveRequest,
  channelRemoveownerRequest,
  dmDetailsRequest,
  passwordResetRequest,
  reactMessageRequest,
  pinMessageRequest,
  standupStartRequest,
  standupSendRequest,
  searchRequest,
  msgShareRequest,
  standupActiveRequest,
  messageSendLaterRequest,
  messageSendLaterDmRequest,
} from './types';
import {
  channelMessages,
  channelJoin,
  channelInvite,
  channelDetails,
  channelAddOwners,
  channelLeave,
  channelRemoveOwners
} from './channel';
// import fs from 'fs';
import { deleteDm, dmCreation, dmLeave, dmlist, dmMessages, dmDetails } from './dms';
import { dmMessageSend, dmMessageSendLater, messageEdit, messagePin, messageReact, messageRemove, messageSend, messageSendLater, messageUnpin, messageUnreact } from './message';
import { getNotification } from './notifications';
import { changePerms, deleteUser, msgShare, searchMessage } from './admins';
import { standupActive, standupSend, standupStart } from './standup';

// import HTTPError from 'http-errors';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// if (fs.existsSync('./database.json')) {
//   const dbstr = fs.readFileSync('./database.json');
//   setData(JSON.parse(String(dbstr)));
// }

/**
 * Given a registered user's email and password, returns their authUserId value.
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 *
 * @returns {string} token - temp token for the authUserId
 * @returns {number} authUserId - autherUserId made by the function
 */
app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body as authLoginRequest;
    const result = authLoginV1(encodeURI(email), encodeURI(password));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * Given a user's first and last name, email address, and password,
 * creates a new account for them and returns a new authUserId.
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @param {string} nameFirst - user's First name
 * @param {string} nameLast - user's last name
 *
 * @returns {string} token - temp token for the authUserId
 * @returns {number} authUserId - autherUserId made by the function
 */
app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body as authRegisterRequest;
    const result = authRegisterV1(encodeURI(email), encodeURI(password), encodeURI(nameFirst), encodeURI(nameLast));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json(sendPasswordResetEmail(email));
});

// Internal only function used for testing.
app.get('/auth/passwordreset/listcodes/v1', (req: Request, res: Response) => {
  const email = req.query.email as string;
  res.json(getResetCodes(email));
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response, next) => {
  try {
    const { resetCode, newPassword } = req.body as passwordResetRequest;
    res.json(resetPassword(resetCode, newPassword));
  } catch (err) {
    next(err);
  }
});

/**
 * Creates a new channel with the given name that is either a public
 * or private channel. The user who created it automatically joins
 * the channel and is the owner.
 *
 * @param {string} token - user's token
 * @param {string} name - user's name
 * @param {string} isPublic - public or not for the channel
 *
 * @returns {number} channelId - channelId made by the function
 */
app.post('/channels/create/v3', (req: Request, res: Response) => {
  const { name, isPublic } = req.body as channelsCreateRequest;
  const token = req.header('token');
  const result = channelsCreate(token, name, isPublic);
  res.json(result);
});

/**
 * Provide a list of all channels (and their associated details) that
 * the authorised user is part of.
 *
 * @param {string} token - user's token
 *
 * @returns {number} channelId - channelId made by the function
 */
app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = channelsList(token);
  res.json(result);
});

app.get('/channels/listAll/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(channelsListAll(token));
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    res.json(logOut(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const { channelId, start } = req.query as unknown as channelMessagesRequest;
  const token = req.header('token');
  res.json(channelMessages(token, Number(channelId), Number(start)));
});

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const { channelId } = req.body as channelJoinRequest;
  const token = req.header('token');
  const result = channelJoin(token, Number(channelId));

  res.json(result);
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const { channelId, uId } = req.body as channelInviteRequest;
  const token = req.header('token');
  const result = channelInvite(token, Number(channelId), Number(uId));
  res.json(result);
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const { channelId } = req.body as channelLeaveRequest;
  const token = req.header('token');
  const result = channelLeave(token, Number(channelId));
  res.json(result);
});

app.get('/channel/details/v3', (req: Request, res: Response) => {
  const { channelId } = req.query as unknown as channelDetailsRequest;
  const token = req.header('token');
  const result = channelDetails(token, Number(channelId));
  res.json(result);
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const { channelId, uId } = req.body as channelAddownerRequest;
  const token = req.header('token');
  const result = channelAddOwners(
    token,
    Number(channelId),
    Number(uId));
  res.json(result);
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const { channelId, uId } = req.body as channelRemoveownerRequest;
  const token = req.header('token');

  const result = channelRemoveOwners(token, Number(channelId), Number(uId));
  res.json(result);
});

app.get('/users/all/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const result = listAllUsersV1(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  try {
    const { uId } = req.query as unknown as userProfileRequest;
    const token = req.header('token');
    const result = userProfile(token, Number(uId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  try {
    const { handleStr } = req.body as userProfileSethandleRequest;
    const token = req.header('token');
    const result = userProfileHandleChange(token, handleStr);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  try {
    const { email } = req.body as userProfileSetemail;
    const token = req.header('token');
    const result = userProfileEmailChange(token, email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  try {
    const { nameFirst, nameLast } = req.body as userProfileSetname;
    const token = req.header('token');
    const result = userProfileNameChange(token, nameFirst, nameLast);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const { channelId, message } = req.body as messageSendRequest;
  const token = req.header('token');
  res.json(messageSend(token, Number(channelId), message));
});

app.post('/message/sendlater/v1', (req: Request, res: Response) => {
  const { channelId, message, timeSent } = req.body as messageSendLaterRequest;
  const token = req.header('token');
  res.json(messageSendLater(token, Number(channelId), message, Number(timeSent)));
});

app.put('/message/edit/v2', (req: Request, res: Response) => {
  const { messageId, message } = req.body as unknown as messageEditRequest;
  const token = req.header('token');
  res.json(messageEdit(token, Number(messageId), message));
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const { messageId } = req.query as unknown as messageRemoveRequest;
  const token = req.header('token');
  res.json(messageRemove(token, Number(messageId)));
});

app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  try {
    const { dmId, message } = req.body as unknown as messageSendDmRequest;
    const token = req.header('token');
    res.json(dmMessageSend(token, Number(dmId), message));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  try {
    const { dmId, message, timeSent } = req.body as unknown as messageSendLaterDmRequest;
    const token = req.header('token');
    res.json(dmMessageSendLater(token, Number(dmId), message, Number(timeSent)));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  try {
    const { uIds } = req.body as dmCreateRequest;
    const token = req.header('token');
    const result = dmCreation(token, uIds.map(id => Number(id)));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const result = dmlist(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  try {
    const { dmId, start } = req.query as unknown as dmMessagesRequest;
    const token = req.header('token');
    return res.json(dmMessages(token, Number(dmId), Number(start)));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  try {
    const { dmId } = req.query as unknown as dmDeleteRequest;
    const token = req.header('token');
    const result = deleteDm(token, Number(dmId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  try {
    const { dmId } = req.body as dmDeleteRequest;
    const token = req.header('token');
    const result = dmLeave(token, Number(dmId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  try {
    const { dmId } = req.query as unknown as dmDetailsRequest;
    const token = req.header('token');
    const result = dmDetails(token, Number(dmId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const result = getNotification(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  try {
    const { messageId, reactId } = req.body as reactMessageRequest;
    const token = req.header('token');
    res.json(messageReact(token, Number(messageId), Number(reactId)));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  try {
    const { messageId, reactId } = req.body as reactMessageRequest;
    const token = req.header('token');
    res.json(messageUnreact(token, Number(messageId), Number(reactId)));
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  try {
    const { messageId } = req.body as pinMessageRequest;
    const token = req.header('token');
    res.json(messagePin(token, Number(messageId)));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  try {
    const { messageId } = req.body as pinMessageRequest;
    const token = req.header('token');
    res.json(messageUnpin(token, Number(messageId)));
  } catch (err) {
    next(err);
  }
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  try {
    const { uId } = req.query;
    const token = req.header('token');
    const result = deleteUser(token, Number(uId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  try {
    const { uId, permissionId } = req.body;
    const token = req.header('token');
    res.json(changePerms(token, Number(uId), Number(permissionId)));
  } catch (err) {
    next(err);
  }
});

app.get('/search/v1', (req: Request, res: Response, next) => {
  try {
    const { queryStr } = req.query as unknown as searchRequest;
    const token = req.header('token');
    const result = searchMessage(token, queryStr);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  try {
    const { ogMessageId, message, channelId, dmId } = req.body as msgShareRequest;
    const token = req.header('token');
    res.json(msgShare(token, Number(ogMessageId), message, Number(channelId), Number(dmId)));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  try {
    const { channelId, length } = req.body as standupStartRequest;
    const token = req.header('token');
    res.json(standupStart(token, Number(channelId), Number(length)));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  try {
    const { channelId, message } = req.body as standupSendRequest;
    const token = req.header('token');
    res.json(standupSend(token, Number(channelId), message));
  } catch (err) {
    next(err);
  }
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  try {
    const { channelId } = req.query as unknown as standupActiveRequest;
    const token = req.header('token');
    res.json(standupActive(token, Number(channelId)));
  } catch (err) {
    next(err);
  }
});

app.delete('/clear/v1', (_: Request, res: Response) => {
  clear();
  res.json({});
});

// handles errors nicely
app.use(errorHandler());

// for logging errors (print to terminal)
app.use(morgan('dev'));

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
