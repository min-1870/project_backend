import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { channelsCreateV1, channelsListV1 } from './channels';
import { getAuthUserIdFromToken, removetoken } from './utils';
import { clearV1 } from './other';
import { authLoginV1, authRegisterV1 } from './auth';
import { authRegisterRequest, authLoginRequest, channelsCreateRequest, channelsListRequest } from './types';

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

app.post('/auth/register/v2', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body as authRegisterRequest;

  const result = authRegisterV1(encodeURI(email), encodeURI(password), encodeURI(nameFirst), encodeURI(nameLast));

  res.json(result);
});

app.post('/auth/login/v2', (req: Request, res: Response) => {
  const { email, password } = req.body as authLoginRequest;

  const result = authLoginV1(encodeURI(email), encodeURI(password));

  res.json(result);
});

app.post('/auth/logout/v1', (req: Request, res: Response) => {
  const { token } = req.body 
  
  const result = removetoken(token);

  res.json(result);
});

app.post('/channels/create/v2', (req: Request, res: Response) => {
  const { token, name, isPublic } = req.body as channelsCreateRequest;

  // get the authUserId using token
  const authUserId = getAuthUserIdFromToken(token);

  // after get authUserId, we call channelsCreateV1
  const result = channelsCreateV1(authUserId, name, isPublic);

  res.json(result);
});

app.get('/channels/list/v2', (req: Request, res: Response) => {
  const { token } = req.query as channelsListRequest;
  const authUserId = getAuthUserIdFromToken(token);
  const result = channelsListV1(authUserId);
  res.json(result);
});

app.delete('/clear/v1', (_: Request, res: Response) => {
  clearV1();
  res.json({});
});

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
