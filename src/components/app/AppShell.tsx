import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Map, Landmark, GitCompareArrows, Sprout, BellRing, History, Settings2, WifiOff, CloudCheck, FlaskConical, LogOut, User as UserIcon, Users
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; short: string; icon: React.ElementType };

const NAV_ADMIN: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/weather", label: "Weather Map", short: "Map", icon: Map },
  { to: "/panchayat", label: "Panchayat", short: "Panchayat", icon: Landmark },
  { to: "/compare", label: "Compare", short: "Compare", icon: GitCompareArrows },
  { to: "/advisory", label: "Crop Advisory", short: "Advisory", icon: Sprout },
  { to: "/alerts", label: "Alerts & SMS", short: "Alerts", icon: BellRing },
  { to: "/history", label: "History", short: "History", icon: History },
  { to: "/admin", label: "Model & Stack", short: "Admin", icon: Settings2 },
];

const NAV_FARMER: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/weather", label: "Weather Map", short: "Map", icon: Map },
  { to: "/advisory", label: "Advisory", short: "Advisory", icon: Sprout },
  { to: "/alerts", label: "Alerts", short: "Alerts", icon: BellRing },
  { to: "/farmer-profile", label: "My Profile", short: "Profile", icon: UserIcon },
];

const NAV_PANCHAYAT_HEAD: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/panchayat-head", label: "Panchayat Head", short: "My Area", icon: Users },
  { to: "/alerts", label: "Alerts", short: "Alerts", icon: BellRing },
  { to: "/advisory", label: "Advisory", short: "Advisory", icon: Sprout },
  { to: "/history", label: "History", short: "History", icon: History },
];

function useNav() {
  const { user } = useAuth();
  if (!user) return NAV_ADMIN;
  if (user.role === "farmer") return NAV_FARMER;
  if (user.role === "panchayat_head") return NAV_PANCHAYAT_HEAD;
  return NAV_ADMIN;
}


const SYNC_KEY = "sukshma:lastSync";

function useSyncStatus() {
  const [online, setOnline] = useState(true);
  const [minutes, setMinutes] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const on = navigator.onLine;
      setOnline(on);
      if (on && !localStorage.getItem(SYNC_KEY)) localStorage.setItem(SYNC_KEY, String(Date.now() - 8 * 60000));
      const last = Number(localStorage.getItem(SYNC_KEY) ?? Date.now());
      setMinutes(Math.max(0, Math.round((Date.now() - last) / 60000)));
    };
    update();
    const t = setInterval(update, 30000);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      clearInterval(t);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return { online, minutes };
}

function SyncPill() {
  const { online, minutes } = useSyncStatus();
  const ago = minutes === null ? "" : minutes < 1 ? "just now" : `${minutes} min ago`;
  return online ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
      <CloudCheck className="size-3.5 text-primary" />
      <span className="font-semibold text-foreground">Synced</span>
      <span className="hidden sm:inline">· Updated {ago}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/50 bg-amber-soft px-2.5 py-1 text-xs font-semibold text-foreground">
      <WifiOff className="size-3.5" /> Offline
    </span>
  );
}

function OfflineBanner() {
  const { online } = useSyncStatus();
  if (online) return null;
  return (
    <div className="flex items-center gap-2 border-b border-amber/40 bg-amber-soft px-4 py-2 text-sm text-foreground">
      <WifiOff className="size-4" />
      <strong>Offline Mode</strong> — Showing the latest synchronized information. New forecasts arrive once you reconnect.
    </div>
  );
}

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
      <FlaskConical className="size-3" /> Demo Mode
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const nav = useNav();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Link to="/" className="px-5 py-5">
          <Logo />
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "!bg-sidebar-accent !text-sidebar-accent-foreground font-semibold" }}
            >
              <Icon className="size-[18px]" /> {label}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="bg-primary/10 text-primary p-2 rounded-full shrink-0">
                <UserIcon className="size-4" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => logout()}>
              <LogOut className="size-4" />
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            SUKSHMA-AI refines official forecasts for local decisions.
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8">
          <Link to="/" className="lg:hidden">
            <Logo subtitle={false} />
          </Link>
          <div className="hidden text-sm text-muted-foreground lg:block">Thanjavur district · Kuruvai–Samba season</div>
          <div className="flex items-center gap-2">
            <SyncPill />
            <DemoBadge />
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => logout()}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <OfflineBanner />
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card lg:hidden">
        <div className="no-scrollbar flex overflow-x-auto">
          {nav.map(({ to, short, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn("flex min-w-[72px] flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium text-muted-foreground")}
              activeProps={{ className: "!text-primary font-semibold" }}
            >
              <Icon className="size-5" />
              {short}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}


