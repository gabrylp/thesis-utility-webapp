import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FlaskConical,
  BarChart3,
  FileCode2,
  Package,
  BookOpen,
  Calculator,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/runs", label: "Test Runs", icon: FlaskConical },
  { to: "/analysis", label: "Analysis", icon: BarChart3 },
  { to: "/code", label: "Code Snippets", icon: FileCode2 },
  { to: "/bom", label: "BOM & Budget", icon: Package, disabled: true },
  { to: "/references", label: "References", icon: BookOpen },
  { to: "/calculator", label: "Calculator", icon: Calculator, disabled: true },
  { to: "/settings", label: "Settings", icon: Settings, disabled: true },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
          GH
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Group H</p>
          <p className="text-[10px] text-muted-foreground">Thesis Utility</p>
        </div>
      </div>

      <nav className="space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={(e) => item.disabled && e.preventDefault()}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  item.disabled
                    ? "cursor-not-allowed opacity-40"
                    : isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-[10px] text-muted-foreground">Soon</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <p className="text-[10px] text-muted-foreground text-center">
          USC CPE Dept. &mdash; Group H
        </p>
      </div>
    </aside>
  );
}
