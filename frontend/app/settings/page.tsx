"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import * as Switch from "@radix-ui/react-switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Settings as SettingsIcon,
  Key,
  Palette,
  Bell,
  DollarSign,
  Globe,
  Shield,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = React.useState({
    // API Configuration
    openrouterKey: "sk-or-v1-a001...f93",
    huggingfaceKey: "hf_...",
    apiEndpoint: "https://jams-api.rickjefferson.workers.dev",
    
    // Model Preferences
    defaultModel: "google/gemini-2.0-flash-exp:free",
    maxTokens: 2048,
    temperature: 0.7,
    
    // Notifications
    emailNotifications: true,
    taskCompletionAlert: true,
    errorAlerts: true,
    weeklyReport: false,
    
    // Budget
    dailyBudget: 1.0,
    monthlyBudget: 10.0,
    budgetAlertThreshold: 80,
    
    // Preferences
    theme: "dark",
    language: "en",
    autoSave: true,
    enableAnalytics: true,
  });

  const handleSave = () => {
    // Save settings to backend
    toast.success("Settings saved successfully!");
  };

  const handleReset = () => {
    // Reset to defaults
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        description="Configure your Jukeyman AGI Music Studio (JAMS) system"
        showSearch={false}
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto scrollbar-thin">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-violet-400" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                OpenRouter API Key
              </label>
              <Input
                type="password"
                value={settings.openrouterKey}
                onChange={(e) =>
                  setSettings({ ...settings, openrouterKey: e.target.value })
                }
                placeholder="sk-or-v1-..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                HuggingFace API Key
              </label>
              <Input
                type="password"
                value={settings.huggingfaceKey}
                onChange={(e) =>
                  setSettings({ ...settings, huggingfaceKey: e.target.value })
                }
                placeholder="hf_..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                API Endpoint
              </label>
              <Input
                value={settings.apiEndpoint}
                onChange={(e) =>
                  setSettings({ ...settings, apiEndpoint: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Model Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-blue-400" />
              Model Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Default Model
              </label>
              <Select
                value={settings.defaultModel}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-2.0-flash-exp:free">
                    Gemini 2.0 Flash (Free)
                  </SelectItem>
                  <SelectItem value="deepseek/deepseek-chat">
                    DeepSeek Chat ($0.14/M)
                  </SelectItem>
                  <SelectItem value="deepseek/deepseek-r1">
                    DeepSeek R1 ($0.14/M)
                  </SelectItem>
                  <SelectItem value="google/gemini-flash-1.5-8b">
                    Gemini Flash 1.5 ($0.08/M)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Max Tokens
              </label>
              <Input
                type="number"
                value={settings.maxTokens}
                onChange={(e) =>
                  setSettings({ ...settings, maxTokens: parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Temperature: {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) =>
                  setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-400" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "emailNotifications", label: "Email Notifications" },
              { key: "taskCompletionAlert", label: "Task Completion Alerts" },
              { key: "errorAlerts", label: "Error Alerts" },
              { key: "weeklyReport", label: "Weekly Summary Report" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{item.label}</span>
                <Switch.Root
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, [item.key]: checked })
                  }
                  className="w-11 h-6 bg-gray-700 rounded-full relative data-[state=checked]:bg-violet-600 transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform transform data-[state=checked]:translate-x-5 translate-x-0.5" />
                </Switch.Root>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Budget Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Budget Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Daily Budget ($)
              </label>
              <Input
                type="number"
                step="0.1"
                value={settings.dailyBudget}
                onChange={(e) =>
                  setSettings({ ...settings, dailyBudget: parseFloat(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Monthly Budget ($)
              </label>
              <Input
                type="number"
                step="1"
                value={settings.monthlyBudget}
                onChange={(e) =>
                  setSettings({ ...settings, monthlyBudget: parseFloat(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Alert Threshold: {settings.budgetAlertThreshold}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={settings.budgetAlertThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    budgetAlertThreshold: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* General Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-400" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Theme
              </label>
              <Select
                value={settings.theme}
                onValueChange={(value) => setSettings({ ...settings, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Language
              </label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  setSettings({ ...settings, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Auto-Save</span>
              <Switch.Root
                checked={settings.autoSave}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoSave: checked })
                }
                className="w-11 h-6 bg-gray-700 rounded-full relative data-[state=checked]:bg-violet-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform transform data-[state=checked]:translate-x-5 translate-x-0.5" />
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Enable Analytics</span>
              <Switch.Root
                checked={settings.enableAnalytics}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableAnalytics: checked })
                }
                className="w-11 h-6 bg-gray-700 rounded-full relative data-[state=checked]:bg-violet-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform transform data-[state=checked]:translate-x-5 translate-x-0.5" />
              </Switch.Root>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} size="lg" className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button onClick={handleReset} size="lg" variant="outline">
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
