import { NextFunction, Request, Response } from 'express';
import User from './entities/user';

export type ControllerFn = (
  req: Request & {
    cookies?: any;
    user?: User | null;
    query?: any;
    params: any;
  },
  res: Response,
  next: NextFunction
) => Promise<Response | void | null | NextFunction>;

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  username: string;
  role: string;
};

export type LoginInput = {
  usernameOrEmail: string;
  password: string;
};

export enum UserRole {
  MA = 'MasterAdmin',
  SA = 'SuperAdmin',
  SM = 'ShowroomManager',
  SO = 'SalesOperator'
}

export const UserAccessLevel = [
  'MasterAdmin',
  'SuperAdmin',
  'ShowroomManager',
  'SalesOperator'
];
