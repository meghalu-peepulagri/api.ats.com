CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicant_id" integer,
	"comment_description" text,
	"commented_by" integer,
	"commented_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar,
	"password" text NOT NULL,
	"user_type" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_password_unique" UNIQUE("password")
);
--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "education" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "salary_expectation" text;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_commented_by_users_id_fk" FOREIGN KEY ("commented_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_id_idx" ON "comments" USING btree ("id");--> statement-breakpoint
CREATE INDEX "comments_applicant_id_idx" ON "comments" USING btree ("applicant_id");--> statement-breakpoint
CREATE INDEX "comments_commented_by_idx" ON "comments" USING btree ("commented_by");--> statement-breakpoint
CREATE INDEX "users_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_name_idx" ON "users" USING btree ("name");--> statement-breakpoint
CREATE INDEX "applicants_id_idx" ON "applicants" USING btree ("id");--> statement-breakpoint
CREATE INDEX "applicants_first_name_idx" ON "applicants" USING btree ("first_name");