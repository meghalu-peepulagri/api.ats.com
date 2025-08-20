import envData from "../env.js";

export const s3Config = {
  access_key_id: envData.AWS_S3_ACCESS_KEY_ID!,
  secret_access_key: envData.AWS_S3_SECRET_ACCESS_KEY!,
  bucket_region: envData.AWS_S3_BUCKET_REGION!,
  bucket: envData.AWS_S3_BUCKET!,
  expires: 3600,
};
