import type { Context } from "hono";

import { safeParse } from "zod";

import { DOWNLOAD_URL_GENERATED, UPLOAD_FILE_VALIDATION_CRITERIA, UPLOAD_URL_GENERATED } from "../constants/appMessages.js";
import UnprocessableContentException from "../exceptions/unProcessableContentException.js";
import S3FileService from "../service/s3Service.js";
import { fileNameHelpers } from "../utils/appUtils.js";
import { sendResponse } from "../utils/sendResponse.js";
import { VDownloadFileSchema, VUploadFileSchema } from "../validations/schema/file.js";

const s3Service = new S3FileService();

class FileController {
  getUploadURL = async (c: Context) => {
    const reqData = await c.req.json();

    const validatedReq = safeParse(VUploadFileSchema, reqData);
    if (!validatedReq.success) {
      throw new UnprocessableContentException(UPLOAD_FILE_VALIDATION_CRITERIA, validatedReq.error);
    }

    const atsFileKey = fileNameHelpers(validatedReq.data.file_name, validatedReq.data.file_type);
    const fileKey = `Applicants/${atsFileKey}`;
    const responseData = await s3Service.generateUploadPresignedUrl(fileKey, validatedReq.data.file_type);

    return sendResponse(c, 200, UPLOAD_URL_GENERATED, responseData);
  };

  getDownloadURL = async (c: Context) => {
    const reqData = await c.req.json();

    const validatedReq = safeParse(VDownloadFileSchema, reqData);
    if (!validatedReq.success) {
      throw new UnprocessableContentException("Unprocessable Content", validatedReq.error);
    }

    const responseData = await s3Service.generateDownloadPresignedUrl(validatedReq.data.file_key);

    return sendResponse(c, 200, DOWNLOAD_URL_GENERATED, responseData);
  };
}

export default FileController;
