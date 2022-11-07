import request, { Response } from 'sync-request';
import config from '../../src/config.json';

export const OK = 200;
const port = config.port;
const url = config.url;

export function sendGetRequestToEndpoint(endpoint: string, qs: object): Response {
  const res = request(
    'GET',
    `${url}:${port}${endpoint}`,
    {
      qs,
    }
  );
  return res;
}

export function sendDeleteRequestToEndpoint(endpoint: string, qs: object): Response {
  const res = request(
    'DELETE',
    `${url}:${port}${endpoint}`,
    {
      qs,
    }
  );
  return res;
}

export function sendPostRequestToEndpoint(endpoint: string, json: object): Response {
  const res = request(
    'POST',
    `${url}:${port}${endpoint}`,
    {
      json,
    }
  );
  return res;
}

export function sendPutRequestToEndpoint(endpoint: string, json: object): Response {
  const res = request(
    'PUT',
    `${url}:${port}${endpoint}`,
    {
      json,
    }
  );
  return res;
}

export function parseJsonResponse(response: Response): string {
  return JSON.parse(response.body as string);
}
