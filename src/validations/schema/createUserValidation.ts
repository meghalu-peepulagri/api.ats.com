import { z } from "zod";

import { EMAIL_ID_REQUIRED, INVALID_EMAIL_ID, INVALID_PASSWORD, PASSWORD_REQUIRED } from "../../constants/appMessages.js";

export const userTypeEnum = z.enum(["HR", "ADMIN"]);

export const VCreateUser = z.object({
  name: z.preprocess(
    val => val === "" ? undefined : val,
    z.string().trim().min(3, "Name must be at least 3 characters"),
  ),
  email: z.preprocess(
    val => val === "" ? undefined : val,
    z.string().trim().email("Invalid email")
      .nonempty("Email is required"),
  ),
  phone: z.preprocess(
    val => val === "" ? undefined : val,
    z.string().trim().regex(/^(\+91)?[6-9]\d{9}$/, { message: "Invalid phone number" })
      .nonempty("Phone number is required"),
  ),
  password: z.preprocess(
    val => val === "" ? undefined : val,
    z.string().trim().min(6, "Password must be at least 6 characters")
      .nonempty("Password is required"),
  ),
  user_type: z.enum(userTypeEnum.options, {
    error: (issue) => {
      if (issue.input === undefined)
        return "User type is required";
      return "Invalid user type";
    },
  }),
});

export const vUserLogin = z.object({
  email: z.preprocess(
    val => val === "" ? undefined : val,
    z.string({
      error: (issue) => {
        if (issue.input === undefined)
          return EMAIL_ID_REQUIRED;
        return INVALID_EMAIL_ID;
      },
    }),
  ),

  password: z.preprocess(
    val => val === "" ? undefined : val,
    z.string({
      error: (issue) => {
        if (issue.input === undefined)
          return PASSWORD_REQUIRED;
        return INVALID_PASSWORD;
      },
    }),
  ),
});

export type VUserLoginSchema = z.infer<typeof vUserLogin>;

export type VCreateUserSchema = z.infer<typeof VCreateUser>;
