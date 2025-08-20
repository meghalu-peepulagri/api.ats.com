CREATE TABLE "applicants" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	"phone" text,
	"role" varchar,
	"status" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "applicants_email_unique" UNIQUE("email"),
	CONSTRAINT "applicants_phone_unique" UNIQUE("phone")
);
