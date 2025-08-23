import type { CompletedPart } from "@aws-sdk/client-s3";
import type { StatusCode } from "hono/utils/http-status";
import type { PassThrough } from "node:stream";

import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListPartsCommand, PutObjectCommand, S3Client, S3ServiceException, UploadPartCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3Config } from "../config/s3Config.js";
import S3ErrorException from "../exceptions/s3Exception.js";

interface Config {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region: string;
  s3_bucket: string;
  expires: number;
  useAccelerateEndpoint?: boolean;
}

class S3FileService {
  config: Config;
  s3Client: S3Client;
  constructor() {
    this.config = {
      credentials: {
        accessKeyId: s3Config.access_key_id,
        secretAccessKey: s3Config.secret_access_key,
      },
      region: s3Config.bucket_region,
      s3_bucket: s3Config.bucket,
      expires: 3600,
    };
    this.s3Client = new S3Client(this.config);
  }

  generateUploadPresignedUrl = async (fileKey: string, fileType: string) => {
    fileKey = `${fileKey}`;

    const params = {
      Bucket: s3Config.bucket,
      Key: fileKey,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { target_url: presignedUrl, file_key: fileKey };
  };

  generateDownloadPresignedUrl = async (fileKey: string) => {
    const params = {
      Bucket: s3Config.bucket,
      Key: fileKey,
    };

    const command = new GetObjectCommand(params);
    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { download_url: downloadUrl };
  };

  // Initialize multipart upload

  initializeMultipartUpload = async (fileKey: string, fileType: string) => {
    try {
      const input = {
        Bucket: s3Config.bucket,
        Key: fileKey,
        ContentType: fileType,
      };

      const command = new CreateMultipartUploadCommand(input);
      const response = await this.s3Client.send(command);

      return response;
    }
    catch (error: any) {
      if (error instanceof S3ServiceException) {
        const statusCode: StatusCode = error.$metadata.httpStatusCode as StatusCode;
        throw new S3ErrorException(statusCode, error.message, error);
      }
      throw error;
    }
  };

  // Generate presigned URLs for multipart upload
  public async multipartPresignedUrl(fileKey: string, parts: number, uploadId: string) {
    try {
      const urls = [];

      for (let i = 0; i < parts; i++) {
        const baseParams = {
          Bucket: s3Config.bucket,
          Key: fileKey,
          UploadId: uploadId,
          PartNumber: i + 1,
        };

        const presignCommand = new UploadPartCommand(baseParams);
        urls.push(await getSignedUrl(this.s3Client, presignCommand, { expiresIn: 3600 }));
      }

      return await Promise.all(urls);
    }
    catch (error: any) {
      if (error instanceof S3ServiceException) {
        const statusCode: StatusCode = error.$metadata.httpStatusCode as StatusCode;
        throw new S3ErrorException(statusCode, error.message, error);
      }
      throw error;
    }
  }

  // Complete multipart upload
  public async completeMultipartUpload(fileKey: string, uploadId: string, uploadedParts: CompletedPart[]) {
    try {
      const input = {
        Bucket: s3Config.bucket,
        Key: fileKey,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: uploadedParts,
        },
      };

      const command = new CompleteMultipartUploadCommand(input);
      const response = await this.s3Client.send(command);

      return response;
    }
    catch (error: any) {
      if (error instanceof S3ServiceException) {
        const statusCode: StatusCode = error.$metadata.httpStatusCode as StatusCode;
        throw new S3ErrorException(statusCode, error.message, error);
      }
      throw error;
    }
  }

  // Abort multipart upload
  public async abortMultipartUpload(filekey: string, uploadId: string) {
    try {
      const input = {
        Bucket: s3Config.bucket,
        Key: filekey,
        UploadId: uploadId,
      };

      const command = new AbortMultipartUploadCommand(input);
      const response = await this.s3Client.send(command);

      return response;
    }
    catch (error: any) {
      if (error instanceof S3ServiceException) {
        const statusCode: StatusCode = error.$metadata.httpStatusCode as StatusCode;
        throw new S3ErrorException(statusCode, error.message, error);
      }
      throw error;
    }
  }

  // List incomplete parts of a multipart upload
  public async listIncompleteParts(fileKey: string, uploadId: string, totalParts: number) {
    try {
      const input = {
        Bucket: s3Config.bucket,
        Key: fileKey,
        UploadId: uploadId,
      };

      const command = new ListPartsCommand(input);
      const listPartsResponse = await this.s3Client.send(command);

      const uploadedPartNumbers = new Set(
        listPartsResponse.Parts?.map((part: any) => part.PartNumber),
      );

      const incompleteParts = [];
      for (let i = 1; i <= totalParts; i++) {
        if (!uploadedPartNumbers.has(i)) {
          incompleteParts.push(i);
        }
      }

      return incompleteParts;
    }
    catch (error: any) {
      if (error instanceof S3ServiceException) {
        const statusCode: StatusCode = error.$metadata.httpStatusCode as StatusCode;
        throw new S3ErrorException(statusCode, error.message, error);
      }
      throw error;
    }
  }

  async uploadFile(key: string, fileContent: any, contentType: string, bucket: string = s3Config.bucket) { // TODO: add any but need to remove this
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        Body: fileContent,
      });

      return await this.s3Client.send(command);
    }
    catch (error: any) {
      if (error instanceof S3ServiceException) {
        const statusCode: StatusCode = error.$metadata.httpStatusCode as StatusCode;
        throw new S3ErrorException(statusCode, error.message, error);
      }
      throw error;
    }
  }

  async getPreSignedUrl(fileName: string, type = "put", bucket = this.config.s3_bucket) {
    let key = "";

    key += fileName;

    const params = {
      Bucket: bucket,
      Key: key,
    };

    const command = type === "put" ? new PutObjectCommand(params) : new GetObjectCommand(params);

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: this.config.expires });

    return { download_url: signedUrl };
  }

  async deleteFile(key: string, bucket: string = s3Config.bucket) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      return await this.s3Client.send(command);
    }
    catch (error: any) {
      if (error instanceof S3ServiceException) {
        const statusCode: StatusCode = error.$metadata.httpStatusCode as StatusCode;
        throw new S3ErrorException(statusCode, error.message, error);
      }
      throw error;
    }
  }

  storeDataTos3(key: string, pass: PassThrough) {
    const s3Upload = new Upload({
      client: new S3Client({
        credentials: {
          accessKeyId: s3Config.access_key_id,
          secretAccessKey: s3Config.secret_access_key,
        },
        region: s3Config.bucket_region,
      }),
      params: {
        Bucket: s3Config.bucket,
        Key: key,
        Body: pass,
        ContentType: "application/x-ndjson",
      },
    });

    return s3Upload;
  };

  async fileExists(fileName: string, bucket: string = s3Config.bucket) {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: fileName,
      });
      return await this.s3Client.send(command);
    }
    catch (error: any) {
      if (error instanceof S3ServiceException) {
        const statusCode: StatusCode = error.$metadata.httpStatusCode as StatusCode;
        throw new S3ErrorException(statusCode, error.message, error);
      }
      throw error;
    }
  }
}

export default S3FileService;
