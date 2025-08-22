import type { Context } from "hono";

import argon2 from "argon2";
import { setCookie } from "hono/cookie";

import type { User } from "../database/schemas/users.js";
import type { VCreateUserSchema, VUserLoginSchema } from "../validations/schema/createUserValidation.js";

import { appConfig } from "../config/appConfig.js";
import { ADD_USER_VALIDATION_CRITERIA, EMAIL_EXISTED, INCORRECT_PASSWORD, INVALID_EMAIL_ID, LOGIN_VALIDATION_CRETERIA, PHONE_NUMBER_EXISTED, USER_CREATED } from "../constants/appMessages.js";
import { CREATED } from "../constants/httpStatusCodes.js";
import { users } from "../database/schemas/users.js";
import ConflictException from "../exceptions/conflictException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import UnauthorizedException from "../exceptions/unAuthorizedException.js";
import { getSingleRecordByAColumnValue, saveSingleRecord } from "../service/db/baseDbService.js";
import { genJWTTokensForUser } from "../utils/jwtUtils.js";
import { sendResponse } from "../utils/sendResponse.js";
import { validatedRequest } from "../validations/validateRequest.js";

class UsersController {
  addUser = async (c: Context) => {
    const reqBody = await c.req.json();
    const validUserReq = await validatedRequest<VCreateUserSchema>("add-user", reqBody, ADD_USER_VALIDATION_CRITERIA);
    const signupUser = await getSingleRecordByAColumnValue<User>(users, "email", validUserReq.email, "=");
    if (signupUser && signupUser?.deleted_at === null) {
      throw new ConflictException(EMAIL_EXISTED);
    }
    const existingUserPhone = await getSingleRecordByAColumnValue<User>(users, "phone", "=", validUserReq.phone);
    if (existingUserPhone && existingUserPhone?.deleted_at === null) {
      throw new ConflictException(PHONE_NUMBER_EXISTED);
    }
    const hashedPassword = await argon2.hash(validUserReq.password);
    const userData: any = { ...validUserReq, password: hashedPassword };
    const savedUser = await saveSingleRecord<User>(users, userData);
    const { password, ...user } = savedUser;
    return sendResponse(c, CREATED, USER_CREATED, user);
  };

  loginUserByEmail = async (c: Context) => {
    const reqBody = await c.req.json();
    const validUserReq = await validatedRequest<VUserLoginSchema>("login", reqBody, LOGIN_VALIDATION_CRETERIA);
    const loginUser = await getSingleRecordByAColumnValue<User>(users, "email", validUserReq.email, "=");
    if (!loginUser || loginUser.deleted_at != null) {
      throw new NotFoundException(INVALID_EMAIL_ID);
    }
    const hashedPassword = loginUser.password;
    const isPasswordMatched = await argon2.verify(hashedPassword, validUserReq.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException(INCORRECT_PASSWORD);
    }
    const { password, ...user } = loginUser;
    const tokensData = await genJWTTokensForUser(loginUser.id);
    setCookie(c, "access_token", tokensData.access_token, { domain: appConfig.cookie_domain, httpOnly: true });
    const respData = { ...tokensData, user };
    return sendResponse(c, CREATED, USER_CREATED, respData);
  };
};

export default UsersController;
