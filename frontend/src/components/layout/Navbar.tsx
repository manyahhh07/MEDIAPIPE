import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/translate", label: "Live Translate" },
];

export function Navbar() {
  return (
    <nav className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="font-display text-lg font-semibold tracking-tight">
          SignBridge <span className="text-accent-600">AI</span>
        </span>

        <div className="flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-50 dark:bg-accent-700/20 text-accent-700 dark:text-accent-300"
                    : "text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}