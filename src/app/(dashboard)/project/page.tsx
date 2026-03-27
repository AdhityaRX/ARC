import { Zap } from "lucide-react";

export default function ProjectIndexPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--arc-crimson-900)] flex items-center justify-center mb-6">
        <Zap className="w-8 h-8 text-[var(--arc-crimson-500)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--arc-text-primary)] mb-2">
        Welcome to ARC
      </h2>
      <p className="text-[var(--arc-text-secondary)] max-w-md">
        Select a project from the sidebar or create a new one to get started.
        ARC will help you transform your ideas into fully architected plans.
      </p>
    </div>
  );
}
