ALTER TABLE "applicants" ADD COLUMN "resume_key" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_resume_key_unique" UNIQUE("resume_key");