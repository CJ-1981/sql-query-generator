"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Database, Github } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SchemaPanel } from "@/components/sql-generator/schema-panel";
import { QueryPanel } from "@/components/sql-generator/query-panel";
import { SettingsDialog } from "@/components/sql-generator/settings-dialog";
import { DEFAULT_MODELS, type ModelConfig } from "@/lib/ai-providers";

const DEFAULT_SCHEMA = `-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Products table
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items table
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);`;

const STORAGE_KEY = "sql-generator-api-keys";
const MODEL_STORAGE_KEY = "sql-generator-models";

export default function SQLGeneratorPage() {
  const [schema, setSchema] = useState(DEFAULT_SCHEMA);
  const [question, setQuestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ sql: string; provider: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyConfig, setApiKeyConfig] = useState({
    gemini: "",
    anthropic: "",
    groq: "",
    cerebras: "",
    openrouter: "",
  });
  const [modelConfig, setModelConfig] = useState<ModelConfig>({ ...DEFAULT_MODELS });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setApiKeyConfig({
          gemini: parsed.gemini || "",
          anthropic: parsed.anthropic || "",
          groq: parsed.groq || "",
          cerebras: parsed.cerebras || "",
          openrouter: parsed.openrouter || "",
        });
      }
    } catch {
      // Ignore parsing errors
    }
    try {
      const storedModels = localStorage.getItem(MODEL_STORAGE_KEY);
      if (storedModels) {
        const parsed = JSON.parse(storedModels);
        setModelConfig({
          geminiModel: parsed.geminiModel || DEFAULT_MODELS.geminiModel,
          anthropicModel: parsed.anthropicModel || DEFAULT_MODELS.anthropicModel,
          groqModel: parsed.groqModel || DEFAULT_MODELS.groqModel,
          cerebrasModel: parsed.cerebrasModel || DEFAULT_MODELS.cerebrasModel,
          openrouterModel: parsed.openrouterModel || DEFAULT_MODELS.openrouterModel,
        });
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!question.trim() || !schema.trim()) return;

    const hasAnyKey = Object.values(apiKeyConfig).some(
      (key) => key && key.trim().length > 0
    );

    if (!hasAnyKey) {
      setSettingsOpen(true);
      setError(
        "Please configure at least one API key in Settings before generating SQL."
      );
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/sql-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: schema.trim(),
          question: question.trim(),
          apiKeyConfig,
          modelConfig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ sql: data.sql, provider: data.provider });
        setError(null);
      } else {
        setError(data.error || "Failed to generate SQL.");
        setResult(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error. Please check your connection and try again."
      );
      setResult(null);
    } finally {
      setIsGenerating(false);
    }
  }, [question, schema, apiKeyConfig, modelConfig]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              SQL Query Generator
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Convert natural language to SQL with AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="h-9 w-9 p-0 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 p-3 sm:p-4">
        <ResizablePanelGroup
          direction="vertical"
          className="h-full rounded-xl border bg-white shadow-sm overflow-hidden"
        >
          {/* Schema Panel */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
            <div className="h-full p-4">
              <SchemaPanel schema={schema} onSchemaChange={setSchema} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-emerald-200/60 hover:bg-emerald-300/60" />

          {/* Query Panel */}
          <ResizablePanel defaultSize={65} minSize={30}>
            <div className="h-full p-4 overflow-auto">
              <QueryPanel
                question={question}
                onQuestionChange={setQuestion}
                schema={schema}
                apiKeyConfig={apiKeyConfig}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                result={result}
                error={error}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* Footer */}
      <footer className="px-4 py-2 border-t bg-white/50 backdrop-blur-sm text-center">
        <a
          href="https://github.com/CJ-1981/sql-query-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-emerald-600 transition-colors"
        >
          <Github className="h-3.5 w-3.5" />
          <span>View on GitHub</span>
        </a>
      </footer>

      {/* Settings Dialog */}
      {settingsOpen && (
        <SettingsDialog
          key="settings-open"
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          apiKeyConfig={apiKeyConfig}
          modelConfig={modelConfig}
          onApiKeyConfigChange={setApiKeyConfig}
          onModelConfigChange={setModelConfig}
        />
      )}
    </div>
  );
}

