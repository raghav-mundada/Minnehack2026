import { useAuth } from "@/_core/hooks/useAuth";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Clock, Smartphone, Plus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const COMMON_APPS = [
  "Instagram", "YouTube", "TikTok", "Twitter / X", "Facebook",
  "Snapchat", "Reddit", "WhatsApp", "Netflix", "Twitch",
  "Discord", "Telegram", "Pinterest", "LinkedIn", "Spotify",
];

export default function ScreenTimeTracker() {
  const { user, loading: authLoading } = useAuth();
  const [appName, setAppName] = useState("");
  const [customAppName, setCustomAppName] = useState("");
  const [usageHours, setUsageHours] = useState("");
  const [usageMinutes, setUsageMinutes] = useState("");

  const { data: todayUsage, refetch } = trpc.appUsage.getToday.useQuery(undefined, {
    enabled: !!user,
  });

  const recordUsage = trpc.appUsage.record.useMutation({
    onSuccess: () => {
      toast.success("Usage recorded!");
      setAppName("");
      setCustomAppName("");
      setUsageHours("");
      setUsageMinutes("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record usage");
    },
  });

  const handleRecordUsage = () => {
    const finalAppName = appName === "custom" ? customAppName.trim() : appName;
    if (!finalAppName) {
      toast.error("Please select or enter an app name");
      return;
    }
    const hours = parseInt(usageHours) || 0;
    const mins = parseInt(usageMinutes) || 0;
    const totalMinutes = hours * 60 + mins;
    if (totalMinutes < 1) {
      toast.error("Please enter at least 1 minute of usage");
      return;
    }
    recordUsage.mutate({ appName: finalAppName, usageMinutes: totalMinutes });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationMenu title="Screen Time" showBack backHref="/dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>Please log in to track screen time</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl("/tracker")}>Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu title="Screen Time Tracker" showBack backHref="/dashboard" />

      <div className="container py-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Log Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Log App Usage
              </CardTitle>
              <CardDescription>
                Enter your app usage from your phone's screen time settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>App Name</Label>
                <Select value={appName} onValueChange={setAppName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an app..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_APPS.map((app) => (
                      <SelectItem key={app} value={app}>{app}</SelectItem>
                    ))}
                    <SelectItem value="custom">Other (type custom)</SelectItem>
                  </SelectContent>
                </Select>
                {appName === "custom" && (
                  <Input
                    className="mt-2"
                    placeholder="Enter app name..."
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label>Usage Time</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="0"
                    value={usageHours}
                    onChange={(e) => setUsageHours(e.target.value)}
                    min={0}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">hours</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={usageMinutes}
                    onChange={(e) => setUsageMinutes(e.target.value)}
                    min={0}
                    max={59}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>

              <Button
                onClick={handleRecordUsage}
                disabled={recordUsage.isPending}
                className="w-full"
              >
                {recordUsage.isPending ? "Recording..." : "Record Usage"}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                How to Find Screen Time
              </CardTitle>
              <CardDescription>
                Check your device's built-in screen time data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">iPhone (iOS)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Open <strong>Settings</strong></li>
                  <li>Tap <strong>Screen Time</strong></li>
                  <li>Tap <strong>See All App & Website Activity</strong></li>
                  <li>Note usage time for each app</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Android</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Open <strong>Settings</strong></li>
                  <li>Tap <strong>Digital Wellbeing</strong></li>
                  <li>View dashboard with app usage</li>
                  <li>Note usage time for each app</li>
                </ol>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Log your usage at the end of each day for accurate tracking. Only log usage for apps you've set limits on.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Usage with Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today's Usage
            </CardTitle>
            <CardDescription>
              Your tracked apps with limits and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!todayUsage || todayUsage.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No usage logged today. Start by adding limits on the Dashboard and logging your screen time above.
              </p>
            ) : (
              <div className="space-y-4">
                {todayUsage.map((app) => {
                  const usageH = Math.floor(app.usageMinutes / 60);
                  const usageM = app.usageMinutes % 60;
                  const limitH = Math.floor(app.limitMinutes / 60);
                  const limitM = app.limitMinutes % 60;
                  const pct = app.percentage;
                  const isOver = app.isOverLimit;

                  return (
                    <div key={app.appName} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{app.appName}</p>
                            {isOver && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="h-3 w-3" />
                                Over Limit
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {usageH > 0 ? `${usageH}h ` : ""}{usageM}m used
                            {app.limitMinutes > 0 && (
                              <> / {limitH > 0 ? `${limitH}h ` : ""}{limitM}m limit</>
                            )}
                          </p>
                        </div>
                        <div>
                          {isOver ? (
                            <span className="text-sm font-semibold text-destructive">
                              +{app.excessMinutes}m over
                            </span>
                          ) : app.limitMinutes > 0 ? (
                            <span className="text-sm font-semibold text-green-600">
                              {app.limitMinutes - app.usageMinutes}m left
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">No limit</span>
                          )}
                        </div>
                      </div>

                      {app.limitMinutes > 0 && (
                        <div className="relative">
                          <Progress
                            value={pct}
                            className={`h-5 rounded-full ${isOver ? "[&>div]:bg-destructive" : pct >= 75 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
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
      </div>
    </div>
  );
}
