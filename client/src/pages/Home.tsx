import { useAuth } from "@/_core/hooks/useAuth";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Castle } from "@/components/Castle";
import { Zombie } from "@/components/Zombie";
import { Shield, Clock, Users, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu />

      {/* Hero Section */}
      <section className="container py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Defend Your Castle.<br />
              <span className="text-primary">Beat Procrastination.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              A gamified accountability app that turns your screen time battle into a zombie
              castle defense. Every hour you procrastinate, another zombie attacks your castle.
              Team up with friends to stay focused.
            </p>
            <div className="flex gap-3">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="text-lg px-8" asChild>
                  <a href={getLoginUrl("/dashboard")}>
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Castle + Zombie illustration */}
          <div className="flex items-end justify-center gap-6 py-8">
            <Castle health={75} />
            <div className="flex flex-col gap-2">
              <Zombie type="regular" />
              <Zombie type="nudge" />
              <Zombie type="regular" isAttacking />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Track Your Usage</CardTitle>
                <CardDescription>
                  Set daily limits for distracting apps. Log your screen time from your
                  phone's settings and see exactly how you're doing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Defend Your Castle</CardTitle>
                <CardDescription>
                  Every hour you exceed your limits, a zombie spawns and attacks your castle.
                  Keep your castle healthy by staying within your limits.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Team Accountability</CardTitle>
                <CardDescription>
                  Create groups with friends. See who's procrastinating on the leaderboard
                  and send nudge zombies to keep each other on track.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Nudge Feature */}
      <section className="container py-16">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">The Nudge System</h2>
            <p className="text-muted-foreground mb-6">
              When you see a friend procrastinating, send them a nudge! This spawns a special
              purple zombie at their castle. It's a fun way to hold each other accountable
              and encourage mending over ending.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0" />
                <span>Share invite links via WhatsApp</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0" />
                <span>Real-time leaderboard in every group</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0" />
                <span>Nudge zombies are a different color</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0" />
                <span>If your castle breaks, you get blocked</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Card className="p-6 max-w-sm w-full">
              <div className="text-center space-y-4">
                <Castle health={40} />
                <div className="flex justify-center gap-2">
                  <Zombie type="nudge" isAttacking />
                  <Zombie type="nudge" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your friend sent you 2 nudge zombies!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/10 py-16">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Defend Your Castle?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Start tracking your screen time, set limits, and invite friends to join your
            accountability group today.
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" className="text-lg px-8" asChild>
              <a href={getLoginUrl("/dashboard")}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Castle Defender - Gamified Anti-Procrastination App</p>
          <p className="mt-1">Mending over Ending</p>
        </div>
      </footer>
    </div>
  );
}
