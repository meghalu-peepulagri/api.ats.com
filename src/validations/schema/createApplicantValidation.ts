import { z } from "zod";

export enum applicantStatus {
  APPLIED = "APPLIED",
  SCREENING = "SCREENING",
  PENDING = "PENDING",
  INTERVIEW_SCREENING = "INTERVIEW_SCREENING",
  SHORTLISTED = "SHORTLISTED",
  HIRED = "HIRED",
  JOINED = "JOINED",
  REJECTED = "REJECTED",
}

export const vCreateApplicant = z.object({
  first_name: z.string({
    error: (issue) => {
      if (issue.input === undefined)
        return "Last name is required";
      return "Invalid last name";
    },
  }).nonempty("First name is required"),
  last_name: z.string({
    error: (issue) => {
      if (issue.input === undefined)
        return "Last name is required";
      return "Invalid last name";
    },
  }).nonempty("Last name is required"),
  phone: z.preprocess(
    val => val === "" ? undefined : val,
    z.string({
      error: (issue) => {
        if (issue.input === undefined)
          return "Phone number is required";
        return "Invalid phone number";
      },
    }).regex(/^(\+91)?[6-9]\d{9}$/, { message: "Invalid phone number" }),
  ),

  email: z.string({
    error: (issue) => {
      if (issue.input === undefined)
        return "Email is required";
      return "Invalid email";
    },
  }).nonempty("Email is required"),

  status: z.string().default("PENDING").optional(),
  education: z.string().trim().optional(),

  salary_expectation: z.string().trim().optional(),

  role: z.string({
    error: (issue) => {
      if (issue.input === undefined)
        return "Role is required";
      return "Invalid role";
    },
  }).nullish(),
  resume_key_path: z.preprocess(
    val => val === "" ? undefined : val,
    z.string({
      error: (issue) => {
        if (issue.input === undefined)
          return "Resume key is required";
        return "Invalid resume key";
      },
    }),
  ),
});

export type TCreateApplicant = z.infer<typeof vCreateApplicant>;
