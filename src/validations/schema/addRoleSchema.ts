import z from "zod";

export const vAddRole = z.object({
  role: z.string().trim().min(2, "Role name must be at least 3 characters"),
});

export type TCreateRole = z.infer<typeof vAddRole>;
