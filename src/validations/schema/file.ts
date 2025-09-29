import { z } from "zod";

export const VUploadFileSchema = z.object({
  file_type: z
  .string()
  .refine(
    val => val === "pdf" || val === "application/pdf" || val === "application/msword" || val === "application/vnd.openxmlformats-officedocument.wordprocessingml.document", {
      message: "Only PDF & Word files are allowed",
    }
  ), // allows both
  file_name: z.string()
    .min(1, { message: "FILE_MISSING" })
    .refine(val => val.trim().length > 0, {
      message: "FILE_NAME_INVALID",
    }),
  file_size: z.union([
    z.number().refine(val => Number.isNaN(val), {
      message: "FILE_SIZE_IS_NUMBER",
    }),
    z.null(),
  ]).optional(),
});

export const VDownloadFileSchema = z.object({
  file_key: z.string()
    .min(1, { message: "FILE_KEY_MISSING" })
    .refine(val => val.trim().length > 0, {
      message: "FILE_KEY_INVALID",
    }),
});

export type ValidateUploadFile = z.infer<typeof VUploadFileSchema>;
export type ValidateDownloadFile = z.infer<typeof VDownloadFileSchema>;
