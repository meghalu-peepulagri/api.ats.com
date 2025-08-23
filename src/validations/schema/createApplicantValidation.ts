import { z } from "zod";

export enum applicantStatus {
  APPLIED = "Applied",
  SCREENING = "Screening",
  PENDING = "Pending",
  INTERVIEW_SCREENING = "Interview_screening",
  SHORTLISTED = "Shortlisted",
  HIRED = "Hired",
  JOINED = "joined",
  REJECTED = "Rejected",
}

export const vCreateApplicant = z.object({
  first_name: z.string({
    error: (issue) => {
      if (issue.input === "" || issue.input === undefined)
        return "First name is required";
      return "Invalid first name";
    },
  }),
  last_name: z.string({
    error: (issue) => {
      if (issue.input === "" || issue.input === undefined)
        return "Last name is required";
      return "Invalid last name";
    },
  }),
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
    z.string().trim().optional(),
  ),
});

export type TCreateApplicant = z.infer<typeof vCreateApplicant>;
