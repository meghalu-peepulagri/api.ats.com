ALTER TABLE "applicants" RENAME COLUMN "resume_key" TO "resume_key_path";--> statement-breakpoint
ALTER TABLE "applicants" DROP CONSTRAINT "applicants_resume_key_unique";--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_resume_key_path_unique" UNIQUE("resume_key_path");