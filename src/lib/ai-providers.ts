export interface ApiKeyConfig {
  gemini?: string;
  anthropic?: string;
  groq?: string;
  cerebras?: string;
  openrouter?: string;
}

export interface ModelConfig {
  geminiModel: string;
  anthropicModel: string;
  groqModel: string;
  cerebrasModel: string;
  openrouterModel: string;
}

export const DEFAULT_MODELS: ModelConfig = {
  geminiModel: "gemini-2.5-flash",
  anthropicModel: "claude-sonnet-4-20250514",
  groqModel: "llama-3.3-70b-versatile",
  cerebrasModel: "llama-3.3-70b",
  openrouterModel: "meta-llama/llama-3.3-70b-instruct:free",
};

interface GenerateResult {
  sql: string;
  provider: string;
}

interface GenerateError {
  error: string;
  provider: string;
}

function buildSystemPrompt(): string {
  return `You are an expert SQL developer. Given a database schema and a natural language question, generate accurate SQL queries.

Rules:
- Only return the SQL query, nothing else
- Use proper SQL syntax
- Include comments if the query is complex
- Support standard SQL (MySQL/PostgreSQL compatible)
- If the question is ambiguous, make reasonable assumptions`;
}

function buildUserPrompt(schema: string, question: string): string {
  return `Database Schema:
${schema}

Question: ${question}`;
}

function buildFullPrompt(schema: string, question: string): string {
  return `${buildSystemPrompt()}

${buildUserPrompt(schema, question)}`;
}

function extractSql(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```sql")) {
    cleaned = cleaned.slice(6);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// ─── Provider 1: Google Gemini ───

async function generateWithGemini(
  schema: string,
  question: string,
  apiKey: string,
  model: string
): Promise<GenerateResult> {
  const prompt = buildFullPrompt(schema, question);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const sql = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!sql) {
    throw new Error("No SQL returned from Gemini");
  }

  return { sql: extractSql(sql), provider: `Gemini (${model})` };
}

// ─── Provider 2: Anthropic Claude ───

async function generateWithAnthropic(
  schema: string,
  question: string,
  apiKey: string,
  model: string
): Promise<GenerateResult> {
  const response = await fetch(
    `https://api.anthropic.com/v1/messages`,
    {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: buildSystemPrompt(),
        messages: [
          { role: "user", content: buildUserPrompt(schema, question) },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  // Anthropic returns content as array of blocks
  const textBlocks = data?.content?.filter(
    (block: { type: string }) => block.type === "text"
  );
  const sql = textBlocks?.map((b: { text: string }) => b.text).join("\n") || "";
  if (!sql) {
    throw new Error("No SQL returned from Anthropic");
  }

  return { sql: extractSql(sql), provider: `Anthropic (${model})` };
}

// ─── Provider 3: Groq ───

async function generateWithGroq(
  schema: string,
  question: string,
  apiKey: string,
  model: string
): Promise<GenerateResult> {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(schema, question) },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const sql = data?.choices?.[0]?.message?.content;
  if (!sql) {
    throw new Error("No SQL returned from Groq");
  }

  return { sql: extractSql(sql), provider: `Groq (${model})` };
}

// ─── Provider 4: Cerebras ───

async function generateWithCerebras(
  schema: string,
  question: string,
  apiKey: string,
  model: string
): Promise<GenerateResult> {
  const response = await fetch(
    "https://api.cerebras.ai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(schema, question) },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cerebras API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const sql = data?.choices?.[0]?.message?.content;
  if (!sql) {
    throw new Error("No SQL returned from Cerebras");
  }

  return { sql: extractSql(sql), provider: `Cerebras (${model})` };
}

// ─── Provider 5: OpenRouter ───

async function generateWithOpenRouter(
  schema: string,
  question: string,
  apiKey: string,
  model: string
): Promise<GenerateResult> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://sql-generator.app",
      "X-Title": "SQL Generator",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(schema, question) },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const sql = data?.choices?.[0]?.message?.content;
  if (!sql) {
    throw new Error("No SQL returned from OpenRouter");
  }

  return { sql: extractSql(sql), provider: `OpenRouter (${model})` };
}

// ─── Provider chain ───

const providerDefs = [
  { name: "Gemini", key: "gemini" as const, modelKey: "geminiModel" as const, generate: generateWithGemini },
  { name: "Anthropic", key: "anthropic" as const, modelKey: "anthropicModel" as const, generate: generateWithAnthropic },
  { name: "Groq", key: "groq" as const, modelKey: "groqModel" as const, generate: generateWithGroq },
  { name: "Cerebras", key: "cerebras" as const, modelKey: "cerebrasModel" as const, generate: generateWithCerebras },
  { name: "OpenRouter", key: "openrouter" as const, modelKey: "openrouterModel" as const, generate: generateWithOpenRouter },
];

export async function generateSQL(
  schema: string,
  question: string,
  apiKeyConfig: ApiKeyConfig,
  modelConfig: ModelConfig
): Promise<GenerateResult> {
  const errors: GenerateError[] = [];

  for (const provider of providerDefs) {
    const apiKey = apiKeyConfig[provider.key];
    if (!apiKey) {
      errors.push({ error: "No API key configured", provider: provider.name });
      continue;
    }

    const model = modelConfig[provider.modelKey] || DEFAULT_MODELS[provider.modelKey];

    try {
      const result = await provider.generate(schema, question, apiKey, model);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ error: message, provider: `${provider.name} (${model})` });
    }
  }

  throw new Error(
    `All providers failed:\n${errors.map((e) => `• ${e.provider}: ${e.error}`).join("\n")}`
  );
}
