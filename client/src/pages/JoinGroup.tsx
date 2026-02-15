import { useAuth } from "@/_core/hooks/useAuth";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Check, AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

interface JoinGroupProps {
  params: { inviteCode: string };
}

export default function JoinGroup({ params }: JoinGroupProps) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const joinGroup = trpc.groups.join.useMutation({
    onSuccess: (data) => {
      toast.success(`Joined "${data.group?.name || 'group'}" successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to join group");
    },
  });

  useEffect(() => {
    if (user && params.inviteCode && !joinGroup.isPending && !joinGroup.isSuccess && !joinGroup.isError) {
      joinGroup.mutate({ inviteCode: params.inviteCode });
    }
  }, [user, params.inviteCode]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavigationMenu title="Join Group" />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Join Accountability Group</CardTitle>
              <CardDescription>
                You've been invited to join a Castle Defender group. Log in to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl(`/join/${params.inviteCode}`)}>
                  Log In to Join
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavigationMenu title="Join Group" showBack backHref="/groups" />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            {joinGroup.isSuccess ? (
              <>
                <Check className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <CardTitle>You're In!</CardTitle>
                <CardDescription>
                  You've successfully joined the group
                </CardDescription>
              </>
            ) : joinGroup.isError ? (
              <>
                <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-2" />
                <CardTitle>Couldn't Join</CardTitle>
                <CardDescription>{joinGroup.error.message}</CardDescription>
              </>
            ) : (
              <>
                <Loader2 className="h-12 w-12 mx-auto text-primary mb-2 animate-spin" />
                <CardTitle>Joining Group...</CardTitle>
                <CardDescription>Please wait</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {joinGroup.isSuccess && (
              <Button className="w-full" onClick={() => setLocation("/groups")}>
                View My Groups
              </Button>
            )}
            {joinGroup.isError && (
              <>
                <Button className="w-full" onClick={() => setLocation("/groups")}>
                  Go to My Groups
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
                  Go Home
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
