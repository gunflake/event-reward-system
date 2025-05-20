import { UserInfo } from '../interfaces/user-info.interface';

export const generateHeaderUserInfo = (
  user: UserInfo
): Record<string, string> => {
  return {
    'x-user-id': user.id,
    'x-user-email': user.email,
    'x-user-role': user.role,
  };
};
