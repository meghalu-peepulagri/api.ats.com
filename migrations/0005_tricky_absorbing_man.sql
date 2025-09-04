ALTER TABLE "applicants" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;