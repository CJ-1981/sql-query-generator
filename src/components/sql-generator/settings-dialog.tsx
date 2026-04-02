"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Key, ShieldCheck, ExternalLink, Cpu } from "lucide-react";
import { useState } from "react";
import { DEFAULT_MODELS, type ModelConfig } from "@/lib/ai-providers";

interface ApiKeyState {
  gemini: string;
  anthropic: string;
  groq: string;
  cerebras: string;
  openrouter: string;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKeyConfig: ApiKeyState;
  modelConfig: ModelConfig;
  onApiKeyConfigChange: (config: ApiKeyState) => void;
  onModelConfigChange: (config: ModelConfig) => void;
}

const STORAGE_KEY = "sql-generator-api-keys";
const MODEL_STORAGE_KEY = "sql-generator-models";

export function SettingsDialog({
  open,
  onOpenChange,
  apiKeyConfig,
  modelConfig,
  onApiKeyConfigChange,
  onModelConfigChange,
}: SettingsDialogProps) {
  const [localKeys, setLocalKeys] = useState(apiKeyConfig);
  const [localModels, setLocalModels] = useState(modelConfig);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localKeys));
      localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(localModels));
    } catch {
      // Ignore storage errors
    }
    onApiKeyConfigChange(localKeys);
    onModelConfigChange(localModels);
    onOpenChange(false);
  };

  const updateKey = (provider: string, value: string) => {
    setLocalKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const updateModel = (key: keyof ModelConfig, value: string) => {
    setLocalModels((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-emerald-600" />
            API Key Settings
          </DialogTitle>
          <DialogDescription>
            Add at least one API key to start generating SQL queries.
            Keys are stored locally in your browser only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Gemini — Primary */}
          <ProviderCard
            name="Google Gemini"
            badge="Primary"
            badgeVariant="emerald"
            apiKey={localKeys.gemini}
            onApiKeyChange={(v) => updateKey("gemini", v)}
            apiKeyPlaceholder="AIza..."
            model={localModels.geminiModel}
            onModelChange={(v) => updateModel("geminiModel", v)}
            defaultModel={DEFAULT_MODELS.geminiModel}
            signupUrl="https://aistudio.google.com/apikey"
          />

          {/* Anthropic — Fallback 1 */}
          <ProviderCard
            name="Anthropic Claude"
            badge="Fallback 1"
            badgeVariant="secondary"
            apiKey={localKeys.anthropic}
            onApiKeyChange={(v) => updateKey("anthropic", v)}
            apiKeyPlaceholder="sk-ant-..."
            model={localModels.anthropicModel}
            onModelChange={(v) => updateModel("anthropicModel", v)}
            defaultModel={DEFAULT_MODELS.anthropicModel}
            signupUrl="https://console.anthropic.com/"
            note="$5 free credits for new accounts"
          />

          {/* Groq — Fallback 2 */}
          <ProviderCard
            name="Groq"
            badge="Fallback 2"
            badgeVariant="secondary"
            apiKey={localKeys.groq}
            onApiKeyChange={(v) => updateKey("groq", v)}
            apiKeyPlaceholder="gsk_..."
            model={localModels.groqModel}
            onModelChange={(v) => updateModel("groqModel", v)}
            defaultModel={DEFAULT_MODELS.groqModel}
            signupUrl="https://console.groq.com/keys"
            note="Ultra-fast inference, generous free tier"
          />

          {/* Cerebras — Fallback 3 */}
          <ProviderCard
            name="Cerebras"
            badge="Fallback 3"
            badgeVariant="secondary"
            apiKey={localKeys.cerebras}
            onApiKeyChange={(v) => updateKey("cerebras", v)}
            apiKeyPlaceholder="csk-..."
            model={localModels.cerebrasModel}
            onModelChange={(v) => updateModel("cerebrasModel", v)}
            defaultModel={DEFAULT_MODELS.cerebrasModel}
            signupUrl="https://cloud.cerebras.ai/"
            note="1M tokens/day free, fastest inference"
          />

          {/* OpenRouter — Fallback 4 */}
          <ProviderCard
            name="OpenRouter"
            badge="Fallback 4"
            badgeVariant="outline"
            apiKey={localKeys.openrouter}
            onApiKeyChange={(v) => updateKey("openrouter", v)}
            apiKeyPlaceholder="sk-or-..."
            model={localModels.openrouterModel}
            onModelChange={(v) => updateModel("openrouterModel", v)}
            defaultModel={DEFAULT_MODELS.openrouterModel}
            signupUrl="https://openrouter.ai/keys"
            note="29+ free models, great backup"
          />

          <Separator />

          {/* Security Note */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200/60">
            <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-700 leading-relaxed">
              All keys and model names are stored only in your browser&apos;s localStorage
              and are never sent to any third-party server.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Reusable provider card component ─── */

function ProviderCard({
  name,
  badge,
  badgeVariant,
  apiKey,
  onApiKeyChange,
  apiKeyPlaceholder,
  model,
  onModelChange,
  defaultModel,
  signupUrl,
  note,
}: {
  name: string;
  badge: string;
  badgeVariant: "emerald" | "secondary" | "outline";
  apiKey: string;
  onApiKeyChange: (v: string) => void;
  apiKeyPlaceholder: string;
  model: string;
  onModelChange: (v: string) => void;
  defaultModel: string;
  signupUrl: string;
  note?: string;
}) {
  const isPrimary = badgeVariant === "emerald";
  const borderClass = isPrimary
    ? "border-emerald-200 bg-emerald-50/50"
    : "border-muted bg-background";

  return (
    <div className={`space-y-3 p-4 rounded-lg border ${borderClass}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{name}</Label>
        <Badge
          className={
            badgeVariant === "emerald"
              ? "bg-emerald-600 text-white text-[10px] px-2 py-0"
              : badgeVariant === "secondary"
                ? "text-[10px] px-2 py-0"
                : "text-[10px] px-2 py-0"
          }
          variant={badgeVariant === "emerald" ? undefined : badgeVariant}
        >
          {badge}
        </Badge>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">API Key</Label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={apiKeyPlaceholder}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Cpu className="h-3 w-3" /> Model
          </Label>
          <button
            type="button"
            onClick={() => onModelChange(defaultModel)}
            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Reset
          </button>
        </div>
        <Input
          type="text"
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
        <a
          href={signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium shrink-0 ml-auto"
        >
          Get Key <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
