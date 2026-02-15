import { pgTable, serial, varchar, text, timestamp, boolean, integer, index, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define enums for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const zombieTypeEnum = pgEnum("zombie_type", ["regular", "nudge"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),

  // Castle defense specific fields
  castleHealth: integer("castleHealth").default(100).notNull(),
  zombieCount: integer("zombieCount").default(0).notNull(),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  lastCalculated: timestamp("lastCalculated").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Groups for accountability
 */
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  inviteCode: varchar("inviteCode", { length: 64 }).notNull().unique(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

/**
 * Group memberships
 */
export const groupMembers = pgTable("groupMembers", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull(),
  userId: integer("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  groupIdIdx: index("groupMembers_groupId_idx").on(table.groupId),
  userIdIdx: index("groupMembers_userId_idx").on(table.userId),
}));

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

/**
 * App limits per user
 */
export const appLimits = pgTable("appLimits", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  appName: varchar("appName", { length: 255 }).notNull(),
  limitMinutes: integer("limitMinutes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("appLimits_userId_idx").on(table.userId),
}));

export type AppLimit = typeof appLimits.$inferSelect;
export type InsertAppLimit = typeof appLimits.$inferInsert;

/**
 * App usage tracking
 */
export const appUsage = pgTable("appUsage", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  appName: varchar("appName", { length: 255 }).notNull(),
  usageMinutes: integer("usageMinutes").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("appUsage_userId_idx").on(table.userId),
  dateIdx: index("appUsage_date_idx").on(table.date),
}));

export type AppUsage = typeof appUsage.$inferSelect;
export type InsertAppUsage = typeof appUsage.$inferInsert;

/**
 * Zombies spawned for each user
 */
export const zombies = pgTable("zombies", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: zombieTypeEnum("type").default("regular").notNull(),
  spawnedAt: timestamp("spawnedAt").defaultNow().notNull(),
  fromUserId: integer("fromUserId"),
  isActive: boolean("isActive").default(true).notNull(),
}, (table) => ({
  userIdIdx: index("zombies_userId_idx").on(table.userId),
}));

export type Zombie = typeof zombies.$inferSelect;
export type InsertZombie = typeof zombies.$inferInsert;

/**
 * Nudges sent between users
 */
export const nudges = pgTable("nudges", {
  id: serial("id").primaryKey(),
  fromUserId: integer("fromUserId").notNull(),
  toUserId: integer("toUserId").notNull(),
  groupId: integer("groupId").notNull(),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  toUserIdIdx: index("nudges_toUserId_idx").on(table.toUserId),
  groupIdIdx: index("nudges_groupId_idx").on(table.groupId),
}));

export type Nudge = typeof nudges.$inferSelect;
export type InsertNudge = typeof nudges.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  groupMemberships: many(groupMembers),
  appLimits: many(appLimits),
  appUsage: many(appUsage),
  zombies: many(zombies),
  sentNudges: many(nudges, { relationName: "sentNudges" }),
  receivedNudges: many(nudges, { relationName: "receivedNudges" }),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  nudges: many(nudges),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const appLimitsRelations = relations(appLimits, ({ one }) => ({
  user: one(users, {
    fields: [appLimits.userId],
    references: [users.id],
  }),
}));

export const appUsageRelations = relations(appUsage, ({ one }) => ({
  user: one(users, {
    fields: [appUsage.userId],
    references: [users.id],
  }),
}));

export const zombiesRelations = relations(zombies, ({ one }) => ({
  user: one(users, {
    fields: [zombies.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [zombies.fromUserId],
    references: [users.id],
  }),
}));

export const nudgesRelations = relations(nudges, ({ one }) => ({
  fromUser: one(users, {
    fields: [nudges.fromUserId],
    references: [users.id],
    relationName: "sentNudges",
  }),
  toUser: one(users, {
    fields: [nudges.toUserId],
    references: [users.id],
    relationName: "receivedNudges",
  }),
  group: one(groups, {
    fields: [nudges.groupId],
    references: [groups.id],
  }),
}));
