import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, Globe2, LogOut, Bell, MessageSquare, CloudRain, ShieldCheck, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT, type Lang, LANG_LABELS } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const refresh = async (session: any) => {
      setAuthed(!!session);
      if (!session) { setUnread(0); setIsAdmin(false); return; }
      const [{ count }, { data: roles }] = await Promise.all([
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("read", false),
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin"),
      ]);
      setUnread(count ?? 0);
      setIsAdmin((roles ?? []).length > 0);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => refresh(session));
    supabase.auth.getSession().then(({ data }) => refresh(data.session));
    const ch = supabase
      .channel(`notif-bell-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        supabase.auth.getSession().then(({ data }) => refresh(data.session));
      })
      .subscribe();
    return () => {
      sub.subscription.unsubscribe();
      supabase.removeChannel(ch);
    };
  }, []);

  const langs: { code: Lang; label: string }[] = (Object.keys(LANG_LABELS) as Lang[]).map(
    (code) => ({ code, label: LANG_LABELS[code] })
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-leaf)]">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            AgroAI
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/detect" className="text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t.nav.detect}
          </Link>
          <Link to="/assistant" className="text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t.nav.assistant}
          </Link>
          <Link to="/weather" className="text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t.nav.weather}
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t.nav.dashboard}
          </Link>
          <Link to="/tips" className="text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t.nav.tips}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {t.nav.admin}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {authed && (
            <Link to="/alerts" className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{unread > 9 ? "9+" : unread}</span>
              )}
            </Link>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild><Link to="/detect">{t.nav.detect}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/assistant"><MessageSquare className="mr-2 h-4 w-4" />{t.nav.assistant}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/weather"><CloudRain className="mr-2 h-4 w-4" />{t.nav.weather}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard">{t.nav.dashboard}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/tips">{t.nav.tips}</Link></DropdownMenuItem>
              {isAdmin && <><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/admin"><ShieldCheck className="mr-2 h-4 w-4" />{t.nav.admin}</Link></DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {langs.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {authed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild size="sm" variant="default">
              <Link to="/auth">{t.nav.login}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}