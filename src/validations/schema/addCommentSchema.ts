import z from "zod";

export const vAddComment = z.object({
  comment_description: z.string().trim(),
});

export type ValidateCreateSchema = z.infer<typeof vAddComment>;
