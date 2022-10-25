// The user output type.
export type user = { uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string };

// Messages output type.
export type messages = { messageId: number, uId: number, message: string, timeSent: number };

// The channel type that is stored in the data store.
export type dataStoreChannel = {
  channelId: number,
  isPublic: boolean,
  name: string,
  ownerMembers: user[],
  allMembers: user[],
  messages: messages[]
}

// The user type that is stored in the data store.
export type dataStoreUser = {
  uId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  isGlobalOwner: boolean,
  sessionTokens: string[]
}

// The dm type that is stored in the data store
export type dataStoreDm = {
  dmId: number,
  name: string
}

// The channelId output type.
export type channelId = { channelId: number };

export type channel = {
  name: string,
  isPublic: boolean,
  ownerMembers: user[],
  allMembers: user[]
}

// The authUserId output type.
export type authUserId = { authUserId: number, token: string };

// The error output type.
export type error = { error: string };

// The channels output type.
export type channels = { channels: { channelId: number, name: string }[] };

// Data model stored in the data store.
export type dataStore = {
  users: dataStoreUser[],
  channels: dataStoreChannel[],
  dms: dataStoreDm[]
}

export type authResponse = {
  token: string,
  authUserId: number
}

export type authLoginRequest = {
  email: string,
  password: string
}

export type authRegisterRequest = {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
}

export type authLogoutRequest = {
  token: string
}

export type userProfileRequest = {
  token: string,
  uId: number
}

export type channelMessagesRequest = {
  token: string,
  channelId: number,
  start: number
}

export type channelsCreateRequest = {
  token: string,
  name: string,
  isPublic: boolean
}

export type channelsListRequest = {
  token: string
}

export type channelsListAllRequest = {
  token: string
}

export type userProfileSethandleRequest = {
  token: string,
  handleStr: string
}

export type channelJoinRequest = {
  token: string,
  channelId: number,
}

export type dmCreateRequest = {
  token: string,
  uIds: [number]
}
