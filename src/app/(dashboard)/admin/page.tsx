"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Users,
  Briefcase,
  FileText,
  Cpu,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";

interface UsageData {
  totalUsers: number;
  totalProjects: number;
  totalMessages: number;
  totalTokensInput: number;
  totalTokensOutput: number;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count?: { jobOpenings: number; uploadedResumes: number };
}

export default function AdminPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("claude-opus-4-7");
  const [maxTokens, setMaxTokens] = useState("8192");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "users">(
    "overview"
  );

  // New user form
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"hr" | "super_admin">("hr");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadAll = () => {
    fetch("/api/admin/usage").then((r) => r.json()).then(setUsage).catch(() => {});
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setUsers(d))
      .catch(() => {});
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d);
        if (d.model) setModel(d.model);
        if (d.max_tokens) setMaxTokens(String(d.max_tokens));
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = {
      model,
      max_tokens: parseInt(maxTokens),
    };
    if (apiKey) payload.anthropic_api_key = apiKey;

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setSavedAt(Date.now());
      setApiKey("");
      loadAll();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create user");
      }
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("hr");
      setShowNew(false);
      loadAll();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user? Their job openings will also be removed."))
      return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) loadAll();
  };

  const statCards = [
    {
      label: "Users",
      value: usage?.totalUsers ?? users.length,
      icon: Users,
    },
    {
      label: "Job Openings",
      value: users.reduce((s, u) => s + (u._count?.jobOpenings ?? 0), 0),
      icon: Briefcase,
    },
    {
      label: "Resumes Analyzed",
      value: users.reduce((s, u) => s + (u._count?.uploadedResumes ?? 0), 0),
      icon: FileText,
    },
    {
      label: "Tokens Used",
      value: (
        (usage?.totalTokensInput ?? 0) + (usage?.totalTokensOutput ?? 0)
      ).toLocaleString(),
      icon: Cpu,
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Super Admin</h1>
        <p className="text-[var(--arc-text-secondary)] text-sm mb-8 mt-1">
          Manage HR users, API configuration, and platform usage.
        </p>

        <div className="flex gap-1 mb-8 border-b border-[var(--arc-border-subtle)]">
          {(["overview", "settings", "users"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors cursor-pointer ${
                activeTab === tab
                  ? "text-[var(--arc-crimson-400)] border-b-2 border-[var(--arc-crimson-500)]"
                  : "text-[var(--arc-text-secondary)] hover:text-[var(--arc-text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--arc-radius-sm)] bg-[var(--arc-crimson-900)] flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-[var(--arc-crimson-400)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                    <p className="text-xs text-[var(--arc-text-tertiary)] uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-1">AI Configuration</h2>
            <p className="text-xs text-[var(--arc-text-tertiary)] mb-6">
              The Anthropic API key is used by all HR users. Store it here so HRs
              never need to see it. Recommended model: Claude Opus 4.7.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                  Anthropic API Key
                </label>
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={settings.anthropic_api_key || "sk-ant-..."}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--arc-text-tertiary)] hover:text-[var(--arc-text-secondary)] cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {settings.anthropic_api_key && (
                  <p className="text-[10px] text-emerald-400 mt-1">
                    Key configured · leave blank to keep existing
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                    Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-10 px-3 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-sm"
                  >
                    <option value="claude-opus-4-7">Claude Opus 4.7 (recommended)</option>
                    <option value="claude-opus-4-6">Claude Opus 4.6</option>
                    <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                    <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                    Max Tokens (per call)
                  </label>
                  <Input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                    min={1024}
                    max={128000}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
                {savedAt && Date.now() - savedAt < 4000 && (
                  <span className="text-xs text-emerald-400">Saved</span>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">HR Users</h2>
              <Button size="sm" onClick={() => setShowNew(!showNew)}>
                <Plus className="w-4 h-4" />
                {showNew ? "Cancel" : "Create User"}
              </Button>
            </div>

            {showNew && (
              <Card className="p-5" accent>
                <form
                  onSubmit={handleCreateUser}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <Input
                    placeholder="Full name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="email@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Temporary password (min 8)"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "hr" | "super_admin")}
                    className="h-11 px-3 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-base"
                  >
                    <option value="hr">HR</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  {createError && (
                    <div className="sm:col-span-2 bg-red-900/30 border border-red-900/50 text-red-400 text-sm px-3 py-2 rounded-[var(--arc-radius-sm)]">
                      {createError}
                    </div>
                  )}
                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" disabled={creating}>
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {creating ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--arc-border-default)]">
                    <th className="text-left px-4 py-3 text-[var(--arc-text-secondary)] font-medium bg-[var(--arc-bg-secondary)]">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-[var(--arc-text-secondary)] font-medium bg-[var(--arc-bg-secondary)]">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-[var(--arc-text-secondary)] font-medium bg-[var(--arc-bg-secondary)]">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 text-[var(--arc-text-secondary)] font-medium bg-[var(--arc-bg-secondary)]">
                      Jobs
                    </th>
                    <th className="text-left px-4 py-3 text-[var(--arc-text-secondary)] font-medium bg-[var(--arc-bg-secondary)]">
                      Resumes
                    </th>
                    <th className="text-left px-4 py-3 text-[var(--arc-text-secondary)] font-medium bg-[var(--arc-bg-secondary)]">
                      Joined
                    </th>
                    <th className="w-10 px-4 py-3 bg-[var(--arc-bg-secondary)]"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[var(--arc-border-subtle)] hover:bg-[var(--arc-bg-hover)] transition-colors"
                    >
                      <td className="px-4 py-3">{user.name || "—"}</td>
                      <td className="px-4 py-3 text-[var(--arc-text-secondary)]">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            user.role === "super_admin"
                              ? "bg-[var(--arc-crimson-900)] text-[var(--arc-crimson-400)]"
                              : user.role === "hr"
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-[var(--arc-grey-700)] text-[var(--arc-text-secondary)]"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {user._count?.jobOpenings ?? 0}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {user._count?.uploadedResumes ?? 0}
                      </td>
                      <td className="px-4 py-3 text-[var(--arc-text-tertiary)]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 rounded hover:bg-red-900/30 text-[var(--arc-text-tertiary)] hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
