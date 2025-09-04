ALTER TABLE "applicants" ADD COLUMN "role_id" integer;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "experience" integer;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;