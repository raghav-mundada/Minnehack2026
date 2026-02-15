import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserById(ctx.user.id);
    }),
    
    getCastleStats: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      return {
        castleHealth: user?.castleHealth ?? 100,
        zombieCount: user?.zombieCount ?? 0,
        isBlocked: user?.isBlocked ?? false,
      };
    }),
  }),

  groups: router({
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(255) }))
      .mutation(async ({ ctx, input }) => {
        const inviteCode = nanoid(10);
        const groupId = await db.createGroup({
          name: input.name,
          inviteCode,
          createdBy: ctx.user.id,
        });
        
        if (groupId) {
          await db.addGroupMember({
            groupId,
            userId: ctx.user.id,
          });
        }
        
        return { groupId, inviteCode };
      }),
    
    join: protectedProcedure
      .input(z.object({ inviteCode: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const group = await db.getGroupByInviteCode(input.inviteCode);
        if (!group) {
          throw new Error("Invalid invite code");
        }
        
        const isMember = await db.isUserInGroup(ctx.user.id, group.id);
        if (isMember) {
          throw new Error("Already a member of this group");
        }
        
        await db.addGroupMember({
          groupId: group.id,
          userId: ctx.user.id,
        });
        
        return { success: true, group };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserGroups(ctx.user.id);
    }),
    
    getMembers: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ ctx, input }) => {
        const isMember = await db.isUserInGroup(ctx.user.id, input.groupId);
        if (!isMember) {
          throw new Error("Not a member of this group");
        }
        return await db.getGroupMembers(input.groupId);
      }),
    
    getDetail: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ ctx, input }) => {
        const isMember = await db.isUserInGroup(ctx.user.id, input.groupId);
        if (!isMember) {
          throw new Error("Not a member of this group");
        }
        const group = await db.getGroupById(input.groupId);
        return group;
      }),
    
    getInviteLink: protectedProcedure
      .input(z.object({ groupId: z.number(), origin: z.string() }))
      .query(async ({ ctx, input }) => {
        const group = await db.getGroupById(input.groupId);
        if (!group) {
          throw new Error("Group not found");
        }
        
        const isMember = await db.isUserInGroup(ctx.user.id, input.groupId);
        if (!isMember) {
          throw new Error("Not a member of this group");
        }
        
        const inviteUrl = `${input.origin}/join/${group.inviteCode}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `Join my Castle Defender group "${group.name}"! ${inviteUrl}`
        )}`;
        
        return { inviteUrl, whatsappUrl };
      }),
  }),

  appLimits: router({
    set: protectedProcedure
      .input(z.object({
        appName: z.string().min(1).max(255),
        limitMinutes: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.setAppLimit({
          userId: ctx.user.id,
          appName: input.appName,
          limitMinutes: input.limitMinutes,
        });
        return { success: true };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAppLimits(ctx.user.id);
    }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        limitMinutes: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateAppLimit(input.id, input.limitMinutes);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAppLimit(input.id);
        return { success: true };
      }),
  }),

  appUsage: router({
    record: protectedProcedure
      .input(z.object({
        appName: z.string().min(1).max(255),
        usageMinutes: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.recordAppUsage({
          userId: ctx.user.id,
          appName: input.appName,
          usageMinutes: input.usageMinutes,
          date: new Date(),
        });
        return { success: true };
      }),
    
    // Returns ALL app limits with their usage for today (even if 0 usage)
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const usage = await db.getUserAppUsageToday(ctx.user.id);
      const limits = await db.getUserAppLimits(ctx.user.id);
      
      // Build a map of all apps (from limits + usage)
      const appMap = new Map<string, { usageMinutes: number; limitMinutes: number; limitId: number | null }>();
      
      // First add all limits
      for (const limit of limits) {
        appMap.set(limit.appName, {
          usageMinutes: 0,
          limitMinutes: limit.limitMinutes,
          limitId: limit.id,
        });
      }
      
      // Then merge usage data
      for (const u of usage) {
        const existing = appMap.get(u.appName);
        if (existing) {
          existing.usageMinutes = u.totalMinutes;
        } else {
          appMap.set(u.appName, {
            usageMinutes: u.totalMinutes,
            limitMinutes: 0,
            limitId: null,
          });
        }
      }
      
      return Array.from(appMap.entries()).map(([appName, data]) => ({
        appName,
        usageMinutes: data.usageMinutes,
        limitMinutes: data.limitMinutes,
        limitId: data.limitId,
        isOverLimit: data.limitMinutes > 0 ? data.usageMinutes > data.limitMinutes : false,
        excessMinutes: data.limitMinutes > 0 ? Math.max(0, data.usageMinutes - data.limitMinutes) : 0,
        percentage: data.limitMinutes > 0 ? Math.min(100, Math.round((data.usageMinutes / data.limitMinutes) * 100)) : 0,
      }));
    }),
    
    // Clear all usage for today (used by reset)
    clearToday: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearUserAppUsageToday(ctx.user.id);
      return { success: true };
    }),
  }),

  zombies: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserActiveZombies(ctx.user.id);
    }),
    
    spawn: protectedProcedure
      .input(z.object({
        type: z.enum(["regular", "nudge"]),
        fromUserId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.spawnZombie({
          userId: ctx.user.id,
          type: input.type,
          fromUserId: input.fromUserId,
        });
        return { success: true };
      }),
  }),

  nudges: router({
    send: protectedProcedure
      .input(z.object({
        toUserId: z.number(),
        groupId: z.number(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const isMember = await db.isUserInGroup(ctx.user.id, input.groupId);
        const isTargetMember = await db.isUserInGroup(input.toUserId, input.groupId);
        
        if (!isMember || !isTargetMember) {
          throw new Error("Both users must be members of the group");
        }
        
        await db.createNudge({
          fromUserId: ctx.user.id,
          toUserId: input.toUserId,
          groupId: input.groupId,
          message: input.message,
        });
        
        await db.spawnZombie({
          userId: input.toUserId,
          type: "nudge",
          fromUserId: ctx.user.id,
        });
        
        return { success: true };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserNudges(ctx.user.id);
    }),
  }),

  castle: router({
    // Full reset: castle health, zombies, AND today's usage
    reset: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Reset castle stats
        await db.updateUserCastleStats(ctx.user.id, 100, 0, false);
        
        // Deactivate all active zombies
        await db.deactivateAllUserZombies(ctx.user.id);
        
        // Clear today's app usage
        await db.clearUserAppUsageToday(ctx.user.id);
        
        return { success: true };
      }),
    
    updateHealth: protectedProcedure
      .input(z.object({
        castleHealth: z.number().min(0).max(100),
        zombieCount: z.number().min(0),
        isBlocked: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserCastleStats(
          ctx.user.id,
          input.castleHealth,
          input.zombieCount,
          input.isBlocked
        );
        return { success: true };
      }),
    
    calculateDamage: protectedProcedure.query(async ({ ctx }) => {
      const usage = await db.getUserAppUsageToday(ctx.user.id);
      const limits = await db.getUserAppLimits(ctx.user.id);
      
      let totalExcessMinutes = 0;
      for (const u of usage) {
        const limit = limits.find(l => l.appName === u.appName);
        if (limit) {
          const excess = Math.max(0, u.totalMinutes - limit.limitMinutes);
          totalExcessMinutes += excess;
        }
      }
      
      // 1 zombie per hour of excess usage
      const zombiesFromUsage = Math.floor(totalExcessMinutes / 60);
      const activeZombies = await db.getUserActiveZombies(ctx.user.id);
      const nudgeZombies = activeZombies.filter(z => z.type === "nudge").length;
      const totalZombies = zombiesFromUsage + nudgeZombies;
      
      // Each zombie does 10 damage
      const damagePerZombie = 10;
      const totalDamage = totalZombies * damagePerZombie;
      const castleHealth = Math.max(0, 100 - totalDamage);
      const isBlocked = castleHealth === 0;
      
      // Persist the calculated state
      if (castleHealth !== (await db.getUserById(ctx.user.id))?.castleHealth) {
        await db.updateUserCastleStats(ctx.user.id, castleHealth, totalZombies, isBlocked);
      }
      
      return {
        totalExcessMinutes,
        zombiesFromUsage,
        nudgeZombies,
        totalZombies,
        castleHealth,
        isBlocked,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
