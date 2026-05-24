"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Briefcase,
  Users,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Shield,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole?: string;
  userName?: string | null;
  userEmail?: string;
}

interface JobSummary {
  id: string;
  title: string;
  status: string;
  _count?: { applicants: number };
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [recentJobs, setRecentJobs] = useState<JobSummary[]>([]);

  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) setOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setRecentJobs(d.slice(0, 8));
      })
      .catch(() => {});
  }, [pathname]);

  const closeOnMobile = useCallback(() => {
    if (window.innerWidth < 768) setOpen(false);
  }, []);

  const isActive = (path: string) => {
    if (path === "/jobs") return pathname === "/jobs" || pathname.startsWith("/jobs/");
    if (path === "/applicants")
      return pathname === "/applicants" || pathname.startsWith("/applicants/");
    return pathname === path;
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-[var(--arc-radius-sm)] bg-[var(--arc-bg-secondary)] border border-[var(--arc-border-subtle)] hover:bg-[var(--arc-bg-hover)] transition-colors cursor-pointer"
        >
          <PanelLeft className="w-5 h-5 text-[var(--arc-text-secondary)]" />
        </button>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] bg-[var(--arc-bg-secondary)] border-r border-[var(--arc-border-subtle)] flex flex-col transition-transform duration-[var(--arc-transition-slow)]",
          !open && "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--arc-border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--arc-radius-sm)] bg-[var(--arc-crimson-500)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <p className="font-semibold text-[var(--arc-text-primary)] tracking-tight leading-none">
                ARC HR
              </p>
              <p className="text-[10px] text-[var(--arc-text-tertiary)] mt-0.5">
                Resume Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-[var(--arc-radius-sm)] hover:bg-[var(--arc-bg-hover)] transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4 text-[var(--arc-text-tertiary)]" />
          </button>
        </div>

        <div className="p-3">
          <Button
            onClick={() => {
              router.push("/jobs/new");
              closeOnMobile();
            }}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            New Job Opening
          </Button>
        </div>

        <nav className="px-2 space-y-0.5">
          <NavLink
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            active={isActive("/dashboard")}
            onClick={() => {
              router.push("/dashboard");
              closeOnMobile();
            }}
          />
          <NavLink
            href="/jobs"
            label="Job Openings"
            icon={Briefcase}
            active={isActive("/jobs")}
            onClick={() => {
              router.push("/jobs");
              closeOnMobile();
            }}
          />
          <NavLink
            href="/applicants"
            label="Applicants"
            icon={Users}
            active={isActive("/applicants")}
            onClick={() => {
              router.push("/applicants");
              closeOnMobile();
            }}
          />
        </nav>

        <div className="flex-1 overflow-y-auto px-2 mt-4">
          {recentJobs.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1.5 text-[10px] font-medium text-[var(--arc-text-tertiary)] uppercase tracking-wider">
                Recent Jobs
              </div>
              {recentJobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => {
                    router.push(`/jobs/${j.id}`);
                    closeOnMobile();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[var(--arc-radius-sm)] text-sm text-left transition-colors cursor-pointer",
                    pathname === `/jobs/${j.id}`
                      ? "bg-[var(--arc-bg-active)] text-[var(--arc-text-primary)]"
                      : "text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)] hover:text-[var(--arc-text-primary)]"
                  )}
                >
                  <span className="truncate flex-1">{j.title}</span>
                  {j._count && j._count.applicants > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--arc-grey-700)] text-[var(--arc-text-tertiary)]">
                      {j._count.applicants}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[var(--arc-border-subtle)] space-y-1">
          <div className="px-2 py-1.5 mb-1">
            <p className="text-sm font-medium text-[var(--arc-text-primary)] truncate">
              {userName || userEmail}
            </p>
            <p className="text-[10px] text-[var(--arc-text-tertiary)] uppercase tracking-wider">
              {userRole === "super_admin" ? "Super Admin" : userRole === "hr" ? "HR" : "User"}
            </p>
          </div>
          {userRole === "super_admin" && (
            <button
              onClick={() => {
                router.push("/admin");
                closeOnMobile();
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 rounded-[var(--arc-radius-sm)] text-sm transition-colors cursor-pointer",
                isActive("/admin")
                  ? "bg-[var(--arc-bg-active)] text-[var(--arc-crimson-400)]"
                  : "text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)] hover:text-[var(--arc-text-primary)]"
              )}
            >
              <Shield className="w-4 h-4" />
              Admin Settings
            </button>
          )}
          <button
            onClick={() => router.push("/api/auth/signout")}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-[var(--arc-radius-sm)] text-sm text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)] hover:text-[var(--arc-text-primary)] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: typeof Briefcase;
  active: boolean;
  onClick: () => void;
}

function NavLink({ label, icon: Icon, active, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-2 rounded-[var(--arc-radius-sm)] text-sm transition-colors cursor-pointer",
        active
          ? "bg-[var(--arc-bg-active)] text-[var(--arc-crimson-400)]"
          : "text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)] hover:text-[var(--arc-text-primary)]"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
