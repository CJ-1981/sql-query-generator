"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SqlOutput } from "./sql-output";
import { Send, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";

interface QueryPanelProps {
  question: string;
  onQuestionChange: (value: string) => void;
  schema: string;
  apiKeyConfig: {
    gemini: string;
    groq: string;
    openrouter: string;
  };
  onGenerate: () => void;
  isGenerating: boolean;
  result: { sql: string; provider: string } | null;
  error: string | null;
}

const SUGGESTION_QUERIES = [
  "Show all users who placed orders this month",
  "Get top 5 products by total sales revenue",
  "Find users who haven't placed any orders",
  "Calculate average order value by status",
  "List products that are out of stock",
  "Show revenue trends by month",
];

export function QueryPanel({
  question,
  onQuestionChange,
  onGenerate,
  isGenerating,
  result,
  error,
}: QueryPanelProps) {
  const [suggestions] = useState(SUGGESTION_QUERIES);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && question.trim()) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Input Area */}
      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Ask a Question
        </label>
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Show all orders from the last 30 days..."
            className="flex-1 h-10 border-emerald-200/50 focus-visible:ring-emerald-500/30"
            disabled={isGenerating}
          />
          <Button
            onClick={onGenerate}
            disabled={isGenerating || !question.trim()}
            className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generate SQL
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      {!result && !error && !isGenerating && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => onQuestionChange(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <Sparkles className="h-5 w-5 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground">
            Generating your SQL query...
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">
              Generation Failed
            </p>
            <p className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-words">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* SQL Output */}
      {result && !isGenerating && (
        <SqlOutput sql={result.sql} provider={result.provider} />
      )}
    </div>
  );
}
