import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, Globe2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT, type Lang } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "ta", label: "தமிழ்" },
  ];

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
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t.nav.dashboard}
          </Link>
          <Link to="/tips" className="text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t.nav.tips}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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