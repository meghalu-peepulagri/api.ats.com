import { z } from "zod";

export const vCreateApplicant = z.object({
  first_name: z.preprocess(
    val => val === "" ? undefined : val,
    z.string().trim().min(3, "First name must be at least 3 characters").optional(),
  ),
  last_name: z.string().trim().optional(),
  phone: z.preprocess(
    val => val === "" ? undefined : val,
    z.string().trim().regex(/^(\+91)?[6-9]\d{9}$/, { message: "Invalid phone number" }).optional(),
  ),
  email: z.string({
    error: (issue) => {
      if (issue.input === undefined)
        return "Email is required";
      return "Invalid email";
    },
  }).nonempty("Email is required"),
  role: z.string({
    error: (issue) => {
      if (issue.input === undefined)
        return "Role is required";
      return "Invalid role";
    },
  }).nullish(),
  resume_key_path: z.preprocess(
    val => val === "" ? undefined : val,
    z.string().trim().optional(),
  ),
});

export type TCreateApplicant = z.infer<typeof vCreateApplicant>;
