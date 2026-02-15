import { useAuth } from "@/_core/hooks/useAuth";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Groups() {
  const { user, loading: authLoading } = useAuth();
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: groups, isLoading, refetch } = trpc.groups.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createGroup = trpc.groups.create.useMutation({
    onSuccess: () => {
      toast.success("Group created!");
      setNewGroupName("");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create group");
    },
  });

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    createGroup.mutate({ name: newGroupName });
  };

  const handleCopyInviteCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    toast.success("Invite link copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareWhatsApp = (groupName: string, inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `Join my Castle Defender group "${groupName}"! Defend your castle against procrastination zombies together. ${inviteUrl}`
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationMenu title="My Groups" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationMenu title="My Groups" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>Please log in to manage groups</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl("/groups")}>Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu title="My Groups" />

      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">My Groups</h1>
            <p className="text-muted-foreground">
              Create accountability groups and invite friends
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create an accountability group and invite friends to join
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., Study Buddies, Work Warriors"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                  />
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={createGroup.isPending}
                  className="w-full"
                >
                  {createGroup.isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {groups && groups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first accountability group to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups?.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {group.name}
                  </CardTitle>
                  <CardDescription>
                    {group.memberCount || 1} {(group.memberCount || 1) === 1 ? "member" : "members"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCopyInviteCode(group.inviteCode)}
                    >
                      {copiedCode === group.inviteCode ? (
                        <><Check className="mr-2 h-4 w-4" /> Copied!</>
                      ) : (
                        <><Copy className="mr-2 h-4 w-4" /> Copy Invite Link</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleShareWhatsApp(group.name, group.inviteCode)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Link href={`/groups/${group.id}`}>
                    <Button variant="secondary" className="w-full">
                      View Members & Leaderboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
