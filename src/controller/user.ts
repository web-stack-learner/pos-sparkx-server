import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sanitizedConfig from '../config';
import User from '../entities/user';
import {
  ControllerFn,
  CreateUserInput,
  LoginInput,
  UserAccessLevel,
  UserRole
} from '../types';
import ErrorHandler from '../utils/errorHandler';
import { sendToken } from '../utils/sendToken';

export const createUser: ControllerFn = async (req, res, next) => {
  const { email, username, password, name, role } = req.body as CreateUserInput;
  if (!email || !password || !username || !name || !role) {
    return next(new ErrorHandler('Please provide required information', 404));
  }

  if (!UserAccessLevel.includes(role)) {
    return next(
      new ErrorHandler(
        `Please provide valid role ${UserRole.MA}||${UserRole.SA}||${UserRole.SM}||${UserRole.MA}`,
        403
      )
    );
  }

  if (req.query.secretpass !== 'sparkxpos') {
    return next(new ErrorHandler('No Secret Key Found', 403));
  }

  const userExistWithEmail = await User.findOne({
    where: {
      email
    }
  });

  const userExistWitUserName = await User.findOne({
    where: {
      username
    }
  });

  if (userExistWitUserName || userExistWithEmail) {
    return next(new ErrorHandler('User already exist', 404));
  }

  const hassPwd = await bcrypt.hash(password, 10);

  const user = User.create({ ...req.body, password: hassPwd });

  await user.save();

  return res?.status(201).json(user);
};

export const getUsers: ControllerFn = async (_req, res, _next) => {
  const user = await User.find();
  return res.status(200).json(user);
};

export const loginUser: ControllerFn = async (req, res, next) => {
  const { usernameOrEmail, password } = req.body as LoginInput;
  if (!usernameOrEmail || !password) {
    return next(new ErrorHandler('Please enter valid information', 404));
  }

  const user = await User.findOne({
    where: usernameOrEmail.includes('@')
      ? {
          email: usernameOrEmail
        }
      : {
          username: usernameOrEmail
        }
  });

  if (!user) {
    return next(new ErrorHandler('Invalid User or Password', 404));
  }
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return next(new ErrorHandler('Invalid User or Password', 404));
  }

  const token = jwt.sign({ userId: user.id }, sanitizedConfig.JWT_SECRET, {
    expiresIn: 1000 * 60 * 60 * 24 * 365
  });

  return sendToken(token, user, res, next);
};

export const logoutUser: ControllerFn = async (_req, res, _next) => {
  res
    .clearCookie('token', { expires: new Date(Date.now()) })
    .status(200)
    .json({ success: true, message: 'Logout Success' });
};
