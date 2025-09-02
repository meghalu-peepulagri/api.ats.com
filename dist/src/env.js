import { z } from "zod";
const VEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "staging"]).default("development"),
    APP_NAME: z.string(),
    API_VERSION: z.string(),
    COOKIE_DOMAIN: z.string(),
    PORT: z.coerce.number().min(1024).max(65535).default(3000),
    DATABASE_URL: z.string(),
    AWS_S3_BUCKET: z.string(),
    AWS_S3_ACCESS_KEY_ID: z.string(),
    AWS_S3_SECRET_ACCESS_KEY: z.string(),
    AWS_S3_BUCKET_REGION: z.string(),
    JWT_SECRET: z.string(),
});
// eslint-disable-next-line import/no-mutable-exports
let envData;
try {
    // eslint-disable-next-line node/no-process-env
    envData = VEnvSchema.parse(process.env);
}
catch (e) {
    const error = e;
    console.error("Invalid Env");
    console.error(error.flatten());
    process.exit(1);
}
export default envData;
