"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Users,
  FolderOpen,
  MessageSquare,
  Cpu,
  Save,
  Eye,
  EyeOff,
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
  _count: { projects: number };
}

export default function AdminPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("claude-opus-4-6");
  const [maxTokens, setMaxTokens] = useState("16384");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "users">("overview");

  useEffect(() => {
    fetch("/api/admin/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(console.error);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setUsers(d); })
      .catch(console.error);
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d);
        if (d.model) setModel(d.model);
        if (d.max_tokens) setMaxTokens(String(d.max_tokens));
        if (d.system_prompt) setSystemPrompt(d.system_prompt);
      })
      .catch(console.error);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = {
      model,
      max_tokens: parseInt(maxTokens),
    };
    if (apiKey) payload.anthropic_api_key = apiKey;
    if (systemPrompt) payload.system_prompt = systemPrompt;

    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
  };

  const statCards = [
    { label: "Total Users", value: usage?.totalUsers ?? 0, icon: Users },
    { label: "Projects", value: usage?.totalProjects ?? 0, icon: FolderOpen },
    { label: "Messages", value: usage?.totalMessages ?? 0, icon: MessageSquare },
    {
      label: "Total Tokens",
      value: ((usage?.totalTokensInput ?? 0) + (usage?.totalTokensOutput ?? 0)).toLocaleString(),
      icon: Cpu,
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-1">Admin Panel</h1>
        <p className="text-[var(--arc-text-secondary)] text-sm mb-8">
          Manage ARC configuration, users, and usage
        </p>

        {/* Tabs */}
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

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--arc-radius-sm)] bg-[var(--arc-crimson-900)] flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-[var(--arc-crimson-400)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-xs text-[var(--arc-text-tertiary)]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">AI Configuration</h2>
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
                    placeholder={
                      settings.anthropic_api_key || "sk-ant-..."
                    }
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--arc-text-tertiary)] hover:text-[var(--arc-text-secondary)] cursor-pointer"
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
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
                    <option value="claude-opus-4-6">Claude Opus 4.6</option>
                    <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                    <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                    Max Tokens
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

              <div>
                <label className="block text-sm text-[var(--arc-text-secondary)] mb-1.5">
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Custom system prompt (leave empty for default ARC prompt)"
                  rows={8}
                  className="w-full px-3 py-2 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-sm placeholder:text-[var(--arc-text-tertiary)] resize-y outline-none focus:border-[var(--arc-crimson-500)]"
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
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
                    Projects
                  </th>
                  <th className="text-left px-4 py-3 text-[var(--arc-text-secondary)] font-medium bg-[var(--arc-bg-secondary)]">
                    Joined
                  </th>
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
                            : "bg-[var(--arc-grey-700)] text-[var(--arc-text-secondary)]"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user._count.projects}</td>
                    <td className="px-4 py-3 text-[var(--arc-text-tertiary)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
