import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestCtx(userId: number, openId: string): TrpcContext {
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

// Use timestamp-based unique IDs to avoid data collision from previous test runs
const ts = Date.now();

describe("Castle Damage Calculation", () => {
  it("should calculate zero zombies when no excess usage", async () => {
    const ctx = createTestCtx(50001, `castle-zero-${ts}`);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.castle.calculateDamage();

    expect(result.zombiesFromUsage).toBe(0);
    expect(result.totalExcessMinutes).toBe(0);
    expect(result.castleHealth).toBe(100);
    expect(result.isBlocked).toBe(false);
  });

  it("should spawn 1 zombie per 60 minutes of excess usage", async () => {
    const ctx = createTestCtx(50002, `castle-one-${ts}`);
    const caller = appRouter.createCaller(ctx);

    await caller.appLimits.set({ appName: "YouTube", limitMinutes: 60 });
    await caller.appUsage.record({ appName: "YouTube", usageMinutes: 120 });

    const result = await caller.castle.calculateDamage();

    // 120 - 60 = 60 excess minutes = 1 zombie
    expect(result.totalExcessMinutes).toBe(60);
    expect(result.zombiesFromUsage).toBe(1);
  });

  it("should calculate castle health based on zombie count", async () => {
    const ctx = createTestCtx(50003, `castle-health-${ts}`);
    const caller = appRouter.createCaller(ctx);

    await caller.appLimits.set({ appName: "Instagram", limitMinutes: 30 });
    await caller.appUsage.record({ appName: "Instagram", usageMinutes: 150 });

    const result = await caller.castle.calculateDamage();

    // 150 - 30 = 120 excess = 2 zombies = 20 damage
    expect(result.totalExcessMinutes).toBe(120);
    expect(result.zombiesFromUsage).toBe(2);
    expect(result.castleHealth).toBe(80);
    expect(result.isBlocked).toBe(false);
  });

  it("should block when castle health reaches zero", async () => {
    const ctx = createTestCtx(50004, `castle-block-${ts}`);
    const caller = appRouter.createCaller(ctx);

    await caller.appLimits.set({ appName: "Twitter", limitMinutes: 10 });
    await caller.appUsage.record({ appName: "Twitter", usageMinutes: 610 });

    const result = await caller.castle.calculateDamage();

    // 610 - 10 = 600 excess = 10 zombies = 100 damage
    expect(result.zombiesFromUsage).toBeGreaterThanOrEqual(10);
    expect(result.castleHealth).toBe(0);
    expect(result.isBlocked).toBe(true);
  });

  it("should handle multiple apps with different limits", async () => {
    const ctx = createTestCtx(50005, `castle-multi-${ts}`);
    const caller = appRouter.createCaller(ctx);

    await caller.appLimits.set({ appName: "YouTube", limitMinutes: 60 });
    await caller.appLimits.set({ appName: "Instagram", limitMinutes: 30 });

    await caller.appUsage.record({ appName: "YouTube", usageMinutes: 120 });
    await caller.appUsage.record({ appName: "Instagram", usageMinutes: 90 });

    const result = await caller.castle.calculateDamage();

    // YouTube: 120 - 60 = 60 excess, Instagram: 90 - 30 = 60 excess, total = 120
    expect(result.totalExcessMinutes).toBe(120);
    expect(result.zombiesFromUsage).toBe(2);
    expect(result.castleHealth).toBe(80);
  });
});

describe("Nudge System", () => {
  it("should spawn a nudge zombie when nudge is sent", async () => {
    const ctx1 = createTestCtx(50006, `nudge-sender-${ts}`);
    const ctx2 = createTestCtx(50007, `nudge-receiver-${ts}`);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // Create a group
    const groupResult = await caller1.groups.create({ name: "Nudge Test Group" });

    // Second user joins
    await caller2.groups.join({ inviteCode: groupResult.inviteCode });

    // User 1 sends nudge to User 2
    await caller1.nudges.send({
      toUserId: 50007,
      groupId: groupResult.groupId!,
      message: "Stay focused!",
    });

    // Check that nudge zombie was spawned for user 2
    const zombies = await caller2.zombies.list();
    const nudgeZombie = zombies.find(z => z.type === "nudge");
    expect(nudgeZombie).toBeDefined();
    expect(nudgeZombie?.fromUserId).toBe(50006);
  });
});
