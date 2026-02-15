CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."zombie_type" AS ENUM('regular', 'nudge');--> statement-breakpoint
CREATE TABLE "appLimits" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"appName" varchar(255) NOT NULL,
	"limitMinutes" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appUsage" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"appName" varchar(255) NOT NULL,
	"usageMinutes" integer NOT NULL,
	"date" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groupMembers" (
	"id" serial PRIMARY KEY NOT NULL,
	"groupId" integer NOT NULL,
	"userId" integer NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"inviteCode" varchar(64) NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "groups_inviteCode_unique" UNIQUE("inviteCode")
);
--> statement-breakpoint
CREATE TABLE "nudges" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromUserId" integer NOT NULL,
	"toUserId" integer NOT NULL,
	"groupId" integer NOT NULL,
	"message" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	"castleHealth" integer DEFAULT 100 NOT NULL,
	"zombieCount" integer DEFAULT 0 NOT NULL,
	"isBlocked" boolean DEFAULT false NOT NULL,
	"lastCalculated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "zombies" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "zombie_type" DEFAULT 'regular' NOT NULL,
	"spawnedAt" timestamp DEFAULT now() NOT NULL,
	"fromUserId" integer,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX "appLimits_userId_idx" ON "appLimits" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "appUsage_userId_idx" ON "appUsage" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "appUsage_date_idx" ON "appUsage" USING btree ("date");--> statement-breakpoint
CREATE INDEX "groupMembers_groupId_idx" ON "groupMembers" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "groupMembers_userId_idx" ON "groupMembers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "nudges_toUserId_idx" ON "nudges" USING btree ("toUserId");--> statement-breakpoint
CREATE INDEX "nudges_groupId_idx" ON "nudges" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "zombies_userId_idx" ON "zombies" USING btree ("userId");