import { z } from "zod";
import { EMAIL_ID_REQUIRED, INVALID_EMAIL_ID, INVALID_PASSWORD, PASSWORD_REQUIRED } from "../../constants/appMessages.js";
export const userTypeEnum = z.enum(["HR", "ADMIN"]);
export const VCreateUser = z.object({
    name: z.preprocess(val => val === "" ? undefined : val, z.string({
        error: (issue) => {
            if (issue.input === undefined)
                return "Name is required";
            return "Invalid name";
        },
    }).nonempty("Name is required")),
    email: z.preprocess(val => val === "" ? undefined : val, z.string({
        error: (issue) => {
            if (issue.input === undefined)
                return EMAIL_ID_REQUIRED;
            return INVALID_EMAIL_ID;
        },
    })),
    phone: z.preprocess(val => val === "" ? undefined : val, z.string({
        error: (issue) => {
            if (issue.input === undefined)
                return "Phone number is required";
            return "Invalid phone number";
        },
    })),
    password: z.preprocess(val => val === "" ? undefined : val, z.string({
        error: (issue) => {
            if (issue.input === undefined)
                return PASSWORD_REQUIRED;
            return INVALID_PASSWORD;
        },
    })),
    user_type: z.enum(userTypeEnum.options, {
        error: (issue) => {
            if (issue.input === undefined)
                return "User type is required";
            return "Invalid user type";
        },
    }),
});
export const vUserLogin = z.object({
    email: z.string({
        error: (issue) => {
            if (issue.input === undefined)
                return "Email is required";
            return "Invalid email";
        },
    }).nonempty("Email is required"),
    password: z.preprocess(val => val === "" ? undefined : val, z.string({
        error: (issue) => {
            if (issue.input === undefined)
                return PASSWORD_REQUIRED;
            return INVALID_PASSWORD;
        },
    })),
});
