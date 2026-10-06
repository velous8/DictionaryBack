import { UserRole } from '../entities/user.entity'

export interface UserData {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: UserData;
  accessToken: string;
}

export interface FullAuthData extends AuthResponse {
  refreshToken: string;
}