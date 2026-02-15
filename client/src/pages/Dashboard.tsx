import { useAuth } from "@/_core/hooks/useAuth";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Castle } from "@/components/Castle";
import { Zombie } from "@/components/Zombie";
import { Shield, Plus, Clock, Users, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useLocation, Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isAddLimitDialogOpen, setIsAddLimitDialogOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newLimitMinutes, setNewLimitMinutes] = useState("");

  // ALL hooks must be called unconditionally before any returns
  const { data: castleStats } = trpc.user.getCastleStats.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 10000,
  });

  const { data: castleDamage } = trpc.castle.calculateDamage.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 10000,
  });

  const { data: appUsage, refetch: refetchUsage } = trpc.appUsage.getToday.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: appLimits, refetch: refetchLimits } = trpc.appLimits.list.useQuery(undefined, {
    enabled: !!user,
  });

  const utils = trpc.useUtils();

  const addLimit = trpc.appLimits.set.useMutation({
    onSuccess: () => {
      toast.success("App limit added!");
      setNewAppName("");
      setNewLimitMinutes("");
      setIsAddLimitDialogOpen(false);
      refetchLimits();
      refetchUsage();
    },
    onError: (e) => toast.error(e.message || "Failed to add limit"),
  });

  const deleteLimit = trpc.appLimits.delete.useMutation({
    onSuccess: () => {
      toast.success("App limit removed");
      refetchLimits();
      refetchUsage();
    },
    onError: (e) => toast.error(e.message || "Failed to remove limit"),
  });

  const resetCastle = trpc.castle.reset.useMutation({
    onSuccess: () => {
      toast.success("Castle reset! Fresh start.");
      utils.user.getCastleStats.invalidate();
      utils.castle.calculateDamage.invalidate();
      utils.appUsage.getToday.invalidate();
    },
    onError: (e) => toast.error(e.message || "Failed to reset"),
  });

  // Blocking redirect - always called, condition inside
  const isBlocked = castleDamage?.isBlocked ?? castleStats?.isBlocked ?? false;

  useEffect(() => {
    if (isBlocked && !authLoading && user) {
      setLocation("/blocked");
    }
  }, [isBlocked, authLoading, user, setLocation]);

  // Derived data
  const castleHealth = castleDamage?.castleHealth ?? castleStats?.castleHealth ?? 100;
  const totalZombies = castleDamage?.totalZombies ?? castleStats?.zombieCount ?? 0;
  const totalExcessMinutes = castleDamage?.totalExcessMinutes ?? 0;

  const totalUsageMinutes = useMemo(() => {
    if (!appUsage) return 0;
    return appUsage.reduce((sum, a) => sum + a.usageMinutes, 0);
  }, [appUsage]);

  const handleAddLimit = () => {
    const minutes = parseInt(newLimitMinutes);
    if (!newAppName.trim()) {
      toast.error("Please enter an app name");
      return;
    }
    if (isNaN(minutes) || minutes < 1) {
      toast.error("Please enter a valid limit (at least 1 minute)");
      return;
    }
    addLimit.mutate({ appName: newAppName.trim(), limitMinutes: minutes });
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationMenu title="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>Please log in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl("/dashboard")}>Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu title="Dashboard" />

      <div className="container py-6 space-y-6">
        {/* Castle Defense Visualization */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Castle */}
              <div className="flex flex-col items-center gap-2">
                <Castle health={castleHealth} />
                <div className="text-center">
                  <p className="text-3xl font-bold">{castleHealth}%</p>
                  <p className="text-sm text-muted-foreground">Castle Health</p>
                </div>
                <Progress
                  value={castleHealth}
                  className={`h-3 w-40 ${castleHealth <= 25 ? "[&>div]:bg-destructive" : castleHealth <= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                />
              </div>

              {/* Zombies */}
              <div className="flex-1 flex flex-wrap items-end justify-center gap-2 min-h-[100px]">
                {totalZombies === 0 ? (
                  <p className="text-muted-foreground text-sm">No zombies! Keep it up!</p>
                ) : (
                  Array.from({ length: Math.min(totalZombies, 10) }).map((_, i) => (
                    <Zombie key={i} type={i < (castleDamage?.nudgeZombies ?? 0) ? "nudge" : "regular"} isAttacking={castleHealth < 50} />
                  ))
                )}
                {totalZombies > 10 && (
                  <span className="text-sm text-muted-foreground">+{totalZombies - 10} more</span>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-3 text-center md:text-right">
                <div>
                  <p className="text-2xl font-bold">{totalZombies}</p>
                  <p className="text-sm text-muted-foreground">Zombies</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.floor(totalUsageMinutes / 60)}h {totalUsageMinutes % 60}m
                  </p>
                  <p className="text-sm text-muted-foreground">Total Usage Today</p>
                </div>
                {totalExcessMinutes > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-destructive">
                      {Math.floor(totalExcessMinutes / 60)}h {totalExcessMinutes % 60}m
                    </p>
                    <p className="text-sm text-muted-foreground">Over Limit</p>
                  </div>
                )}
                {castleHealth < 100 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetCastle.mutate()}
                    disabled={resetCastle.isPending}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Castle
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Usage with Progress Bars */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today's App Usage
                </CardTitle>
                <CardDescription>
                  Track your app usage against your set limits
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/tracker">
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Log Usage
                  </Button>
                </Link>
                <Button size="sm" onClick={() => setIsAddLimitDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Limit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(!appUsage || appUsage.length === 0) ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No apps tracked yet. Add app limits and log your usage to get started.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setIsAddLimitDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add App Limit
                  </Button>
                  <Link href="/tracker">
                    <Button>
                      <Clock className="mr-2 h-4 w-4" />
                      Log Screen Time
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {appUsage.map((app) => {
                  const usageH = Math.floor(app.usageMinutes / 60);
                  const usageM = app.usageMinutes % 60;
                  const limitH = Math.floor(app.limitMinutes / 60);
                  const limitM = app.limitMinutes % 60;
                  const pct = app.limitMinutes > 0
                    ? Math.min(100, Math.round((app.usageMinutes / app.limitMinutes) * 100))
                    : 0;
                  const isOver = app.isOverLimit;

                  return (
                    <div key={app.appName} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{app.appName}</p>
                            {isOver && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="h-3 w-3" />
                                Over Limit
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {usageH > 0 ? `${usageH}h ` : ""}{usageM}m used
                            {app.limitMinutes > 0 && (
                              <> / {limitH > 0 ? `${limitH}h ` : ""}{limitM}m limit</>
                            )}
                            {app.limitMinutes === 0 && " (no limit set)"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOver && (
                            <span className="text-sm font-semibold text-destructive">
                              +{app.excessMinutes}m over
                            </span>
                          )}
                          {!isOver && app.limitMinutes > 0 && (
                            <span className="text-sm font-semibold text-green-600">
                              {app.limitMinutes - app.usageMinutes}m left
                            </span>
                          )}
                          {app.limitId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                if (app.limitId) deleteLimit.mutate({ id: app.limitId });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {app.limitMinutes > 0 && (
                        <div className="relative">
                          <Progress
                            value={pct}
                            className={`h-6 rounded-full ${isOver ? "[&>div]:bg-destructive" : pct >= 75 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow-sm">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/groups">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">My Groups</CardTitle>
                <CardDescription>View and manage accountability groups</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/tracker">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Log Screen Time</CardTitle>
                <CardDescription>Record your app usage from device settings</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer h-full"
            onClick={() => setIsAddLimitDialogOpen(true)}
          >
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Set App Limits</CardTitle>
              <CardDescription>Configure daily time limits for apps</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Add Limit Dialog */}
        <Dialog open={isAddLimitDialogOpen} onOpenChange={setIsAddLimitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add App Limit</DialogTitle>
              <DialogDescription>
                Set a daily time limit for an app. A zombie will spawn for every hour you exceed this limit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="appName">App Name</Label>
                <Input
                  id="appName"
                  placeholder="e.g., Instagram, YouTube, TikTok"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="limitMinutes">Daily Limit (minutes)</Label>
                <Input
                  id="limitMinutes"
                  type="number"
                  placeholder="e.g., 30"
                  value={newLimitMinutes}
                  onChange={(e) => setNewLimitMinutes(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLimit()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newLimitMinutes && !isNaN(parseInt(newLimitMinutes)) && parseInt(newLimitMinutes) > 0
                    ? `= ${Math.floor(parseInt(newLimitMinutes) / 60)}h ${parseInt(newLimitMinutes) % 60}m per day`
                    : "Enter minutes (e.g., 30 = 30 minutes, 90 = 1h 30m)"}
                </p>
              </div>
              <Button
                onClick={handleAddLimit}
                disabled={addLimit.isPending}
                className="w-full"
              >
                {addLimit.isPending ? "Adding..." : "Add Limit"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
