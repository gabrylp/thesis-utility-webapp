import { useLocation } from "react-router-dom";
import { SyncBadge } from "./SyncBadge";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/runs": "Test Runs",
  "/code": "Code Snippets",
  "/bom": "BOM & Budget",
  "/references": "References",
  "/calculator": "Calculator",
  "/settings": "Settings",
};

export function Header() {
  const location = useLocation();
  const title = titles[location.pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <SyncBadge />
    </header>
  );
}
