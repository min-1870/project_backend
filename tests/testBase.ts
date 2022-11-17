import { sendDeleteRequestToEndpoint } from './integration/integrationTestUtils';

// API versions
export const AUTH_LOGIN = '/auth/login/v3';
export const AUTH_REGISTER = '/auth/register/v3';

export const CHANNELS_CREATE = '/channels/create/v3';
export const CHANNELS_LIST = '/channels/list/v3';
export const CHANNELS_LIST_ALL = '/channels/listall/v3';

export const CHANNEL_DETAILS = '/channel/details/v3';
export const CHANNEL_JOIN = '/channel/join/v3';
export const CHANNEL_INVITE = '/channel/invite/v3';
export const CHANNEL_MESSAGES = '/channel/messages/v3';

export const USER_PROFILE = '/user/profile/v3';

export const CLEAR = '/clear/v1';

export const AUTH_LOGOUT = '/auth/logout/v2';

export const CHANNEL_LEAVE = '/channel/leave/v2';
export const CHANNEL_ADD_OWNER = '/channel/addowner/v2';
export const CHANNEL_REMOVE_OWNER = '/channel/removeowner/v2';

export const MESSAGE_SEND = '/message/send/v2';
export const MESSAGE_EDIT = '/message/edit/v2';
export const MESSAGE_REMOVE = '/message/remove/v2';

export const DM_CREATE = '/dm/create/v2';
export const DM_LIST = '/dm/list/v2';
export const DM_REMOVE = '/dm/remove/v2';
export const DM_LEAVE = '/dm/leave/v2';
export const DM_MESSGES = '/dm/messages/v2';
export const DM_SEND = '/message/senddm/v2';
export const DM_DETAILS = '/dm/details/v2';

export const MESSAGE_DM_SEND = '/message/senddm/v2';

export const USERS_ALL = '/users/all/v2';

export const USER_PROFILE_SET_NAME = '/user/profile/setname/v2';
export const USER_PROFILE_SET_EMAIL = '/user/profile/setemail/v2';
export const USER_PROFILE_SET_HANDLE = '/user/profile/sethandle/v2';

export const NOTIFICATION_GET = '/notifications/get/v1';

export const SEARCH = '/search/v1';

export const MESSAGE_SHARE = '/message/share/v1';
export const MESSAGE_REACT = '/message/react/v1';
export const MESSAGE_UNREACT = '/message/unreact/v1';
export const MESSAGE_PIN = '/message/pin/v1';
export const MESSAGE_UNPIN = '/message/unpin/v1';
export const MESSAGE_SEND_LATER = '/message/sendlater/v1';
export const MESSAGE_SEND_LATER_DM = '/message/sendlaterdm/v1';

export const STANDUP_START = '/standup/start/v1';
export const STANDUP_ACTIVE = '/standup/active/v1';
export const STANDUP_SEND = '/standup/send/v1';

export const AUTH_PASSWORD_RESET_REQUEST = '/auth/passwordreset/request/v1';
export const AUTH_PASSWORD_RESET = '/auth/passwordreset/reset/v1';

export const USER_PROFILE_UPLOAD_PHOTO = '/user/profile/uploadphoto/v1';
export const USER_STATS = '/user/stats/v1';

export const USERS_STATS = '/users/stats/v1';

export const ADMIN_USER_REMOVE = '/admin/user/remove/v1';
export const ADMIN_USER_PERMISSION_CHANGE = '/admin/userpermission/change/v1';

export function clearDataForTest() {
  sendDeleteRequestToEndpoint(CLEAR, {});
}
