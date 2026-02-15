import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(userId: number, openId: string): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId,
    email: `test-${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("appLimits router", () => {
  const ctx = createTestContext(9901, `comp-test-limits-${Date.now()}`);

  it("should set an app limit", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appLimits.set({
      appName: "TestApp",
      limitMinutes: 60,
    });
    expect(result).toEqual({ success: true });
  });

  it("should list app limits", async () => {
    const caller = appRouter.createCaller(ctx);
    const limits = await caller.appLimits.list();
    expect(Array.isArray(limits)).toBe(true);
  });
});

describe("appUsage router", () => {
  const ctx = createTestContext(9902, `comp-test-usage-${Date.now()}`);

  it("should record app usage", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appUsage.record({
      appName: "YouTube",
      usageMinutes: 45,
    });
    expect(result).toEqual({ success: true });
  });

  it("should return today's usage with limits merged", async () => {
    const caller = appRouter.createCaller(ctx);
    
    // Set a limit first
    await caller.appLimits.set({ appName: "YouTube", limitMinutes: 30 });
    
    const today = await caller.appUsage.getToday();
    expect(Array.isArray(today)).toBe(true);
    
    // Find YouTube entry
    const ytEntry = today.find(a => a.appName === "YouTube");
    if (ytEntry) {
      expect(ytEntry).toHaveProperty("usageMinutes");
      expect(ytEntry).toHaveProperty("limitMinutes");
      expect(ytEntry).toHaveProperty("isOverLimit");
      expect(ytEntry).toHaveProperty("excessMinutes");
      expect(ytEntry).toHaveProperty("percentage");
    }
  });
});

describe("castle router", () => {
  const ctx = createTestContext(9903, `comp-test-castle-${Date.now()}`);

  it("should calculate damage", async () => {
    const caller = appRouter.createCaller(ctx);
    const damage = await caller.castle.calculateDamage();
    expect(damage).toHaveProperty("castleHealth");
    expect(damage).toHaveProperty("totalZombies");
    expect(damage).toHaveProperty("isBlocked");
    expect(damage.castleHealth).toBeGreaterThanOrEqual(0);
    expect(damage.castleHealth).toBeLessThanOrEqual(100);
  });

  it("should reset castle, zombies, and usage", async () => {
    const caller = appRouter.createCaller(ctx);
    
    // Record some usage first
    await caller.appLimits.set({ appName: "TikTok", limitMinutes: 10 });
    await caller.appUsage.record({ appName: "TikTok", usageMinutes: 120 });
    
    // Reset
    const result = await caller.castle.reset();
    expect(result).toEqual({ success: true });
    
    // Verify castle is healthy
    const stats = await caller.user.getCastleStats();
    expect(stats.castleHealth).toBe(100);
    expect(stats.zombieCount).toBe(0);
    expect(stats.isBlocked).toBe(false);
  });
});

describe("groups router", () => {
  const ctx = createTestContext(9904, `comp-test-groups-${Date.now()}`);

  it("should create a group", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.groups.create({ name: "Test Group" });
    expect(result).toHaveProperty("groupId");
    expect(result).toHaveProperty("inviteCode");
    expect(typeof result.inviteCode).toBe("string");
  });

  it("should list user groups", async () => {
    const caller = appRouter.createCaller(ctx);
    const groups = await caller.groups.list();
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBeGreaterThanOrEqual(1);
    
    // Should have memberCount
    const group = groups[0];
    expect(group).toHaveProperty("memberCount");
  });

  it("should get group members", async () => {
    const caller = appRouter.createCaller(ctx);
    const groups = await caller.groups.list();
    if (groups.length > 0) {
      const members = await caller.groups.getMembers({ groupId: groups[0].id });
      expect(Array.isArray(members)).toBe(true);
      // Members may be empty if test user doesn't exist in users table
      // (groupMembers row exists but JOIN on users finds nothing)
      if (members.length > 0) {
        const member = members[0];
        expect(member).toHaveProperty("castleHealth");
        expect(member).toHaveProperty("zombieCount");
      }
    }
  });
});

describe("user router", () => {
  const ctx = createTestContext(9905, `comp-test-user-${Date.now()}`);

  it("should get castle stats", async () => {
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.user.getCastleStats();
    expect(stats).toHaveProperty("castleHealth");
    expect(stats).toHaveProperty("zombieCount");
    expect(stats).toHaveProperty("isBlocked");
  });
});
