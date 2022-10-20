// The user output type.
export type user = { uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string };

// Message output type.
export type message = { messageId: number, uId: number, message: string, timeSent: number };

// The channel type that is stored in the data store.
export type dataStoreChannel = {
    channelId: number,
    isPublic: boolean,
    name: string,
    ownerMembers: user[],
    allMembers: user[],
    messages: message[]
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

// The channelId output type.
export type channelId = { channelId: number };

// The authUserId output type.
export type authUserId = { authUserId: number };

// The error output type.
export type error = { error: string };

// The channels output type.
export type channels = { channels: { channelId: number, name: string }[] };

// Data model stored in the data store.
export type dataStore = {
    users: dataStoreUser[],
    channels: dataStoreChannel[]
}
