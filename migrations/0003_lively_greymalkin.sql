CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "roles_id_idx" ON "roles" USING btree ("id");--> statement-breakpoint
CREATE INDEX "roles_role_idx" ON "roles" USING btree ("role");