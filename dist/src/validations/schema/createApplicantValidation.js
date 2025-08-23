import { z } from "zod";
export var applicantStatus;
(function (applicantStatus) {
    applicantStatus["APPLIED"] = "Applied";
    applicantStatus["SCREENING"] = "Screening";
    applicantStatus["PENDING"] = "Pending";
    applicantStatus["INTERVIEW_SCREENING"] = "Interview_screening";
    applicantStatus["SHORTLISTED"] = "Shortlisted";
    applicantStatus["HIRED"] = "Hired";
    applicantStatus["JOINED"] = "joined";
    applicantStatus["REJECTED"] = "Rejected";
})(applicantStatus || (applicantStatus = {}));
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
    phone: z.preprocess(val => val === "" ? undefined : val, z.string({
        error: (issue) => {
            if (issue.input === undefined)
                return "Phone number is required";
            return "Invalid phone number";
        },
    }).regex(/^(\+91)?[6-9]\d{9}$/, { message: "Invalid phone number" })),
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
    resume_key_path: z.preprocess(val => val === "" ? undefined : val, z.string().trim().optional()),
});
