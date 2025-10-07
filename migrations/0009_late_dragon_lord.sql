ALTER TABLE "applicants" ADD COLUMN "status_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "status_updated_by" integer;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_status_updated_by_users_id_fk" FOREIGN KEY ("status_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;