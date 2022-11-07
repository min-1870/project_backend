import { v4 as uuidv4 } from 'uuid';
import { getData } from './dataStore';
import { isAuthUserIdValid } from './utils';

export function generateToken(): string {
  return uuidv4();
}

export function generateAuthUserId(): number {
  const dataStore = getData();
  const maxId = 1000000;
  let id = Math.floor(Math.random() * maxId);
  while (isAuthUserIdValid(id, dataStore)) {
    id = Math.floor(Math.random() * maxId);
  }
  return id;
}
