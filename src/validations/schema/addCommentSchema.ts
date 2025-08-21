import z from "zod";

export const vAddComment = z.object({
  comment_description: z.string().trim().min(3, "Comment must be at least 3 characters"),
});

export type ValidateCreateSchema = z.infer<typeof vAddComment>;
