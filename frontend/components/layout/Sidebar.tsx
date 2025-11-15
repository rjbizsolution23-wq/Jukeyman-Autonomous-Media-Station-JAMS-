"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Music,
  Folder,
  Activity,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Workflows", href: "/workflows", icon: GitBranch },
  { name: "Audio Library", href: "/library", icon: Music },
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Monitor", href: "/monitor", icon: Activity },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-gray-800 bg-gray-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-100">JAMS</h1>
              <p className="text-xs text-gray-500">AGI Music Studio</p>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100",
                collapsed && "justify-center"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4">
          <div className="rounded-lg bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-600/20 p-3">
            <div className="text-xs font-semibold text-violet-400 mb-1">
              System Status
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>All Systems Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

