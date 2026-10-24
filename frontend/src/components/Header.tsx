import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export type View = "inventory" | "manage";

export function Header({ view, onViewChange }: { view: View; onViewChange: (view: View) => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="2.5" />
              <path d="M12 4v5.5M12 14.5V20M4.5 9.5l5 1.8M14.5 12.7l5 1.8" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">Showroom</span>
        </div>

        <nav aria-label="Primary" className="ml-2 flex gap-1">
          <Button variant={view === "inventory" ? "secondary" : "ghost"} size="sm" onClick={() => onViewChange("inventory")}>
            Inventory
          </Button>
          {user?.role === "ADMIN" && (
            <Button variant={view === "manage" ? "secondary" : "ghost"} size="sm" onClick={() => onViewChange("manage")}>
              Manage
            </Button>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
          <Badge variant="outline">{user?.role === "ADMIN" ? "Admin" : "Customer"}</Badge>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}