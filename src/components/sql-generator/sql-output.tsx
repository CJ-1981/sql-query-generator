"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface SqlOutputProps {
  sql: string;
  provider: string;
}

export function SqlOutput({ sql, provider }: SqlOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = sql;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Generated SQL
        </h3>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          >
            {provider}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-xs gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="rounded-lg overflow-auto border border-border flex-1 min-h-[120px]">
        <SyntaxHighlighter
          language="sql"
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.8125rem",
            lineHeight: "1.6",
            background: "#1a1b26",
            minHeight: "120px",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
          }}
          showLineNumbers
          lineNumberStyle={{
            color: "#565f89",
            minWidth: "2.5em",
            paddingRight: "1em",
          }}
          wrapLongLines
        >
          {sql}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
