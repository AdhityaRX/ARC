"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Shield,
} from "lucide-react";
import { useProjectStore, type Project } from "@/stores/projectStore";
import { Button } from "@/components/ui/Button";
import { cn, groupByDate } from "@/lib/utils";

interface SidebarProps {
  userRole?: string;
}

function useIsMobile() {
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) {
        useProjectStore.getState().setSidebarOpen(false);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
}

export function Sidebar({ userRole }: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const {
    projects,
    setProjects,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    setCurrentProject,
  } = useProjectStore();

  useIsMobile();

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(console.error);
  }, [setProjects]);

  const closeSidebarOnMobile = useCallback(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  const createProject = async () => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Project" }),
    });
    if (res.ok) {
      const project = await res.json();
      setProjects([project, ...projects]);
      router.push(`/project/${project.id}`);
      closeSidebarOnMobile();
    }
  };

  const grouped = groupByDate(projects);
  const currentId = params?.id as string;

  return (
    <>
      {/* Toggle button when closed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-[var(--arc-radius-sm)] bg-[var(--arc-bg-secondary)] border border-[var(--arc-border-subtle)] hover:bg-[var(--arc-bg-hover)] transition-colors cursor-pointer"
        >
          <PanelLeft className="w-5 h-5 text-[var(--arc-text-secondary)]" />
        </button>
      )}

      {/* Backdrop overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] bg-[var(--arc-bg-secondary)] border-r border-[var(--arc-border-subtle)] flex flex-col transition-transform duration-[var(--arc-transition-slow)]",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--arc-border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--arc-radius-sm)] bg-[var(--arc-crimson-500)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-[var(--arc-text-primary)] tracking-tight">
              ARC
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-[var(--arc-radius-sm)] hover:bg-[var(--arc-bg-hover)] transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4 text-[var(--arc-text-tertiary)]" />
          </button>
        </div>

        {/* New Project */}
        <div className="p-3">
          <Button
            onClick={createProject}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto px-2">
          {Object.entries(grouped).map(([label, items]) => (
            <div key={label} className="mb-4">
              <div className="px-2 py-1.5 text-xs font-medium text-[var(--arc-text-tertiary)] uppercase tracking-wider">
                {label}
              </div>
              {(items as Project[]).map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProject(project);
                    router.push(`/project/${project.id}`);
                    closeSidebarOnMobile();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-[var(--arc-radius-sm)] text-sm text-left transition-colors cursor-pointer",
                    currentId === project.id
                      ? "bg-[var(--arc-bg-active)] text-[var(--arc-text-primary)]"
                      : "text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)] hover:text-[var(--arc-text-primary)]"
                  )}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--arc-border-subtle)] space-y-1">
          {userRole === "super_admin" && (
            <button
              onClick={() => {
                router.push("/admin");
                closeSidebarOnMobile();
              }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-[var(--arc-radius-sm)] text-sm text-[var(--arc-text-secondary)] hover:bg-[var(--arc-bg-hover)] hover:text-[var(--arc-text-primary)] transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
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
