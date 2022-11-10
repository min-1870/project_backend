// The user output type.
export type user = { uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string };
export type users = { users: user[] };

// Messages output type.
export type messages = { messageId: number, uId: number, message: string, timeSent: number };
export type messageId = { messageId: number };

export type channelMessagesOutput = {
  messages: messages[],
  start: number,
  end: number
};

// The channel type that is stored in the data store.
export type dataStoreChannel = {
  channelId: number,
  isPublic: boolean,
  name: string,
  ownerMembers: number[],
  allMembers: number[],
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
  name: string,
  ownerMembers: number[],
  allMembers: number[],
  messages: messages[]
}

export type dataStorePassReset = {
  email: string,
  resetCode: string
}

export type dm = {
  name: string,
  members: user[]
}

// The channelId output type.
export type channelId = { channelId: number };

export type dmId = { dmId: number };

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

// the dms output type.
export type dms = { dms: { dmId: number, name:string}[] };

// Data model stored in the data store.
export type dataStore = {
  users: dataStoreUser[],
  channels: dataStoreChannel[],
  dms: dataStoreDm[],
  passwordReset: dataStorePassReset[]
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

export type userProfileRequest = {
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

export type messageSendRequest = {
  token: string,
  channelId: number,
  message: string
}

export type messageEditRequest = {
  token: string,
  messageId: number,
  message: string
}

export type messageRemoveRequest = {
  token: string,
  messageId: number
}

export type messageSendDmRequest = {
  token: string,
  dmId: number,
  message: string
}

export type channelJoinRequest = {
  token: string,
  channelId: number,
}

export type channelInviteRequest = {
  token: string,
  channelId: number,
  uId: number,
}

export type channelDetailsRequest = {
  token: string
  channelId: number
}

export type channelAddownerRequest = {
  token: string,
  channelId: number,
  uId: number,
}

export type channelRemoveownerRequest = {
  token: string,
  channelId: number,
  uId: number,
}

export type dmCreateRequest = {
  uIds: [number]
}

export type dmDeleteRequest = {
  dmId: number
}

export type dmMessagesRequest = {
  token: string,
  dmId: number,
  start: number
}

export type dmDetailsRequest = {
  dmId: number
}

export type userProfileSetemail = {
  token: string
  email: string
}

export type userProfileSetname = {
  nameFirst: string
  nameLast: string
}

export type channelLeaveRequest = {
  token: string
  channelId: number
}

export type passwordResetRequest = {
  resetCode: string
  newPassword: string
}
