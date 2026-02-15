import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Shield, Clock, Users, Home, ArrowLeft, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavigationMenuProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function NavigationMenu({ title, showBack = false, backHref = "/" }: NavigationMenuProps) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: Shield },
    { href: "/tracker", label: "Screen Time", icon: Clock },
    { href: "/groups", label: "Groups", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-14 items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Castle Defender
              </SheetTitle>
              <SheetDescription>Navigate to different sections</SheetDescription>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              {user && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 mt-4 text-destructive"
                  onClick={() => { logout(); setOpen(false); }}
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Back button */}
        {showBack && (
          <Link href={backHref}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}

        {/* Title / Logo */}
        <Link href="/">
          <span className="font-bold text-lg flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary hidden sm:block" />
            {title || "Castle Defender"}
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.name || user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="hidden md:flex gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
