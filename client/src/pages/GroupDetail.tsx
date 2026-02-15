import { useAuth } from "@/_core/hooks/useAuth";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Castle } from "@/components/Castle";
import { Zombie } from "@/components/Zombie";
import { Users, Send, Trophy, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GroupDetailProps {
  params: { groupId: string };
}

export default function GroupDetail({ params }: GroupDetailProps) {
  const { user, loading: authLoading } = useAuth();
  const groupId = parseInt(params.groupId);
  const [nudgeMessage, setNudgeMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isNudgeDialogOpen, setIsNudgeDialogOpen] = useState(false);

  const { data: group } = trpc.groups.getDetail.useQuery(
    { groupId },
    { enabled: !!user && !isNaN(groupId) }
  );

  const { data: members, isLoading, refetch } = trpc.groups.getMembers.useQuery(
    { groupId },
    { enabled: !!user && !isNaN(groupId) }
  );

  const { data: nudges } = trpc.nudges.list.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
  });

  const sendNudge = trpc.nudges.send.useMutation({
    onSuccess: () => {
      toast.success("Nudge sent! A zombie has been dispatched.");
      setNudgeMessage("");
      setSelectedUserId(null);
      setIsNudgeDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send nudge");
    },
  });

  const handleSendNudge = () => {
    if (!selectedUserId) return;
    sendNudge.mutate({
      toUserId: selectedUserId,
      groupId,
      message: nudgeMessage.trim() || undefined,
    });
  };

  const openNudgeDialog = (userId: number) => {
    setSelectedUserId(userId);
    setIsNudgeDialogOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationMenu title="Group" showBack backHref="/groups" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user || !members) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationMenu title="Group" showBack backHref="/groups" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Group Not Found</CardTitle>
              <CardDescription>Unable to load group members</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const sortedMembers = [...members].sort((a, b) => b.castleHealth - a.castleHealth);
  const recentNudges = nudges?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu title={group?.name || "Group"} showBack backHref="/groups" />

      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {group?.name || "Group"} Leaderboard
          </h1>
          <p className="text-muted-foreground">
            {members.length} {members.length === 1 ? "member" : "members"} - Compare castle health and help each other stay focused
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Leaderboard */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Member Rankings
              </CardTitle>
              <CardDescription>Ranked by castle health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedMembers.map((member, index) => (
                  <div key={member.userId} className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-lg">
                              {member.name || member.email || "Anonymous"}
                              {member.userId === user.id && (
                                <span className="text-sm text-muted-foreground ml-2">(You)</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span>Castle: {member.castleHealth}%</span>
                            <span>Zombies: {member.zombieCount}</span>
                            {member.isBlocked && (
                              <span className="text-destructive font-medium">
                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                Blocked
                              </span>
                            )}
                          </div>
                          <Progress
                            value={member.castleHealth}
                            className={`h-3 ${member.castleHealth <= 25 ? "[&>div]:bg-destructive" : member.castleHealth <= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Castle health={member.castleHealth} className="scale-50" />
                        {member.userId !== user.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNudgeDialog(member.userId)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Nudge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Nudges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Recent Nudges
              </CardTitle>
              <CardDescription>Nudges you've received</CardDescription>
            </CardHeader>
            <CardContent>
              {recentNudges.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No nudges yet. Send one to a group member who's procrastinating!
                </p>
              ) : (
                <div className="space-y-4">
                  {recentNudges.map((nudge) => (
                    <div key={nudge.id} className="border-l-2 border-primary pl-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Zombie type="nudge" className="scale-50" />
                        <p className="font-medium text-sm">{nudge.fromUserName}</p>
                      </div>
                      {nudge.message && (
                        <p className="text-sm text-muted-foreground">{nudge.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(nudge.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nudge Dialog */}
        <Dialog open={isNudgeDialogOpen} onOpenChange={setIsNudgeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send a Nudge</DialogTitle>
              <DialogDescription>
                Send a motivational nudge to help your friend stay focused. This will spawn a special zombie at their castle!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex justify-center">
                <Zombie type="nudge" isAttacking />
              </div>
              <div>
                <Textarea
                  placeholder="Add an optional message (e.g., 'Stay strong!', 'You got this!')"
                  value={nudgeMessage}
                  onChange={(e) => setNudgeMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSendNudge}
                disabled={sendNudge.isPending}
                className="w-full"
              >
                {sendNudge.isPending ? "Sending..." : "Send Nudge Zombie"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
