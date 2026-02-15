import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Castle } from "@/components/Castle";
import { Zombie } from "@/components/Zombie";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Blocked() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: castleStats } = trpc.user.getCastleStats.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 5000,
  });

  const { data: castleDamage } = trpc.castle.calculateDamage.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 5000,
  });

  const utils = trpc.useUtils();

  const resetCastle = trpc.castle.reset.useMutation({
    onSuccess: () => {
      toast.success("Everything reset! Fresh start.");
      utils.user.getCastleStats.invalidate();
      utils.castle.calculateDamage.invalidate();
      utils.appUsage.getToday.invalidate();
      setLocation("/dashboard");
    },
    onError: (e) => toast.error(e.message || "Failed to reset"),
  });

  const isBlocked = castleDamage?.isBlocked ?? castleStats?.isBlocked ?? false;

  useEffect(() => {
    if (!isBlocked && !authLoading && user) {
      setLocation("/dashboard");
    }
  }, [isBlocked, authLoading, user, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalZombies = castleDamage?.totalZombies ?? castleStats?.zombieCount ?? 0;

  return (
    <div className="min-h-screen bg-destructive/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-destructive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-3xl text-destructive mb-2">
            You are Procrastinating Again
          </CardTitle>
          <CardDescription className="text-lg">
            Your castle has been overrun by {totalZombies} zombies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Castle visualization */}
          <div className="flex justify-center items-end gap-4 py-6">
            <Castle health={0} />
            <div className="flex flex-wrap gap-2 max-w-xs">
              {Array.from({ length: Math.min(totalZombies, 8) }).map((_, i) => (
                <Zombie key={i} type={i % 3 === 0 ? "nudge" : "regular"} isAttacking />
              ))}
            </div>
          </div>

          {/* Override / Reset Button - Prominent */}
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={() => resetCastle.mutate()}
              disabled={resetCastle.isPending}
              className="w-full max-w-sm text-lg py-6"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              {resetCastle.isPending ? "Resetting..." : "Override & Reset Everything"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Resets castle health, removes all zombies, and clears today's app usage timers
            </p>
          </div>

          {/* Info section */}
          <div className="bg-card p-5 rounded-lg space-y-3">
            <h3 className="font-semibold">What happened?</h3>
            <p className="text-sm text-muted-foreground">
              You exceeded your app usage limits. Each hour of excess usage spawned a zombie,
              and your castle couldn't withstand the attack. Use the override button above to
              get a fresh start, or take a break from distracting apps.
            </p>
          </div>

          {/* Secondary actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLocation("/groups")}
            >
              View My Groups
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLocation("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
