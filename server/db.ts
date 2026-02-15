import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  groups,
  groupMembers,
  appLimits,
  appUsage,
  zombies,
  nudges,
  InsertGroup,
  InsertGroupMember,
  InsertAppLimit,
  InsertAppUsage,
  InsertZombie,
  InsertNudge
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL);
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserCastleStats(userId: number, castleHealth: number, zombieCount: number, isBlocked: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ castleHealth, zombieCount, isBlocked, lastCalculated: new Date() })
    .where(eq(users.id, userId));
}

// Group functions
export async function createGroup(group: InsertGroup) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(groups).values(group).returning({ id: groups.id });
  return result[0].id;
}

export async function getGroupByInviteCode(inviteCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(groups).where(eq(groups.inviteCode, inviteCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGroupById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserGroups(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      id: groups.id,
      name: groups.name,
      inviteCode: groups.inviteCode,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
      joinedAt: groupMembers.joinedAt,
      memberCount: sql<number>`(SELECT COUNT(*) FROM ${groupMembers} WHERE ${groupMembers.groupId} = ${groups.id})`,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))
    .orderBy(desc(groupMembers.joinedAt));
  return result;
}

// Group member functions
export async function addGroupMember(member: InsertGroupMember) {
  const db = await getDb();
  if (!db) return;
  await db.insert(groupMembers).values(member);
}

export async function getGroupMembers(groupId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      castleHealth: users.castleHealth,
      zombieCount: users.zombieCount,
      isBlocked: users.isBlocked,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(desc(users.castleHealth));
  return result;
}

export async function isUserInGroup(userId: number, groupId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
    .limit(1);
  return result.length > 0;
}

// App limit functions
export async function setAppLimit(limit: InsertAppLimit) {
  const db = await getDb();
  if (!db) return;
  await db.insert(appLimits).values(limit).onConflictDoUpdate({
    target: [appLimits.userId, appLimits.appName],
    set: { limitMinutes: limit.limitMinutes, updatedAt: new Date() },
  });
}

export async function getUserAppLimits(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(appLimits).where(eq(appLimits.userId, userId));
}

export async function updateAppLimit(id: number, limitMinutes: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(appLimits).set({ limitMinutes, updatedAt: new Date() }).where(eq(appLimits.id, id));
}

export async function deleteAppLimit(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(appLimits).where(eq(appLimits.id, id));
}

// App usage functions
export async function recordAppUsage(usage: InsertAppUsage) {
  const db = await getDb();
  if (!db) return;
  await db.insert(appUsage).values(usage);
}

export async function getUserAppUsageToday(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      appName: appUsage.appName,
      totalMinutes: sql<number>`SUM(${appUsage.usageMinutes})`,
    })
    .from(appUsage)
    .where(and(
      eq(appUsage.userId, userId),
      sql`${appUsage.date} >= ${today}`
    ))
    .groupBy(appUsage.appName);

  return result;
}

export async function clearUserAppUsageToday(userId: number) {
  const db = await getDb();
  if (!db) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await db.delete(appUsage).where(and(
    eq(appUsage.userId, userId),
    sql`${appUsage.date} >= ${today}`
  ));
}

// Zombie functions
export async function spawnZombie(zombie: InsertZombie) {
  const db = await getDb();
  if (!db) return;
  await db.insert(zombies).values(zombie);
}

export async function getUserActiveZombies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(zombies)
    .where(and(eq(zombies.userId, userId), eq(zombies.isActive, true)))
    .orderBy(desc(zombies.spawnedAt));
}

export async function deactivateZombie(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(zombies).set({ isActive: false }).where(eq(zombies.id, id));
}

export async function deactivateAllUserZombies(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(zombies).set({ isActive: false }).where(eq(zombies.userId, userId));
}

// Nudge functions
export async function createNudge(nudge: InsertNudge) {
  const db = await getDb();
  if (!db) return;
  await db.insert(nudges).values(nudge);
}

export async function getUserNudges(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      id: nudges.id,
      fromUserName: users.name,
      fromUserId: nudges.fromUserId,
      message: nudges.message,
      createdAt: nudges.createdAt,
      groupId: nudges.groupId,
    })
    .from(nudges)
    .innerJoin(users, eq(nudges.fromUserId, users.id))
    .where(eq(nudges.toUserId, userId))
    .orderBy(desc(nudges.createdAt))
    .limit(limit);
  return result;
}
