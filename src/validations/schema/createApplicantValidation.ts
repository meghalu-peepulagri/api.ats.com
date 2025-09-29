import { z } from "zod";

export enum applicantStatus {
  APPLIED = "APPLIED",
  SCREENED = "SCREENED",
  INTERVIEWED = "INTERVIEWED",
  SCHEDULE_INTERVIEW = "SCHEDULE_INTERVIEW",
  HIRED = "HIRED",
  REJECTED = "REJECTED",
  JOINED = "JOINED",
  PIPELINE = "PIPELINE",
}

export const vCreateApplicant = z.object({
  first_name: z.string({
    error: (issue) => {
      if (issue.input === undefined)
        return "Last name is required";
      return "Invalid last name";
    },
  }).trim().nonempty("First name is required"),
  last_name: z.string({
    error: (issue) => {
      if (issue.input === undefined)
        return "Last name is required";
      return "Invalid last name";
    },
  }).trim().nonempty("Last name is required"),
  phone: z.preprocess(
    val => val === "" ? undefined : val,
    z.string({
      error: (issue) => {
        if (issue.input === undefined)
          return "Mobile number is required";
        return "Invalid mobile number";
      },
    }).trim().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid mobile number" }),
  ),

  email: z.email({
    error: (issue) => {
      if (issue.input === undefined)
        return "Email is required";
      return "Invalid email";
    },
  }).trim().nonempty("Email is required"),

  status: z.string().default("APPLIED").optional(),
  education: z.string().trim().optional(),

  salary_expectation: z.string().trim().optional(),
  role_id: z.preprocess(
    val => val === null ? undefined : val,
    z.number({
      error: (issue) => {
        if (issue.input === undefined)
          return "Position is required";
        return "Invalid position";
      },
    }),
  ),
  experience: z.number().min(0, "Experience cannot be negative").max(50, "Experience seems invalid").nullable(),
  resume_key_path: z.preprocess(
    val => val === "" ? undefined : val,
    z.string({
      error: (issue) => {
        if (issue.input === undefined)
          return "Resume is required";
        return "Invalid resume";
      },
    }),
  ),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
});

export type TCreateApplicant = z.infer<typeof vCreateApplicant>;
