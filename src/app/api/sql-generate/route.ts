import { NextRequest, NextResponse } from "next/server";
import { generateSQL, DEFAULT_MODELS, type ApiKeyConfig, type ModelConfig } from "@/lib/ai-providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schema, question, apiKeyConfig, modelConfig } = body as {
      schema?: string;
      question?: string;
      apiKeyConfig?: ApiKeyConfig;
      modelConfig?: Partial<ModelConfig>;
    };

    if (!schema || typeof schema !== "string" || schema.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Database schema is required." },
        { status: 400 }
      );
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "A natural language question is required." },
        { status: 400 }
      );
    }

    const config: ApiKeyConfig = {
      gemini: apiKeyConfig?.gemini,
      anthropic: apiKeyConfig?.anthropic,
      groq: apiKeyConfig?.groq,
      cerebras: apiKeyConfig?.cerebras,
      openrouter: apiKeyConfig?.openrouter,
    };

    const models: ModelConfig = {
      geminiModel: modelConfig?.geminiModel || DEFAULT_MODELS.geminiModel,
      anthropicModel: modelConfig?.anthropicModel || DEFAULT_MODELS.anthropicModel,
      groqModel: modelConfig?.groqModel || DEFAULT_MODELS.groqModel,
      cerebrasModel: modelConfig?.cerebrasModel || DEFAULT_MODELS.cerebrasModel,
      openrouterModel: modelConfig?.openrouterModel || DEFAULT_MODELS.openrouterModel,
    };

    const hasAnyKey = Object.values(config).some(
      (key) => key && key.trim().length > 0
    );

    if (!hasAnyKey) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one API key is required. Please configure your API keys in Settings.",
        },
        { status: 400 }
      );
    }

    const result = await generateSQL(schema.trim(), question.trim(), config, models);

    return NextResponse.json({
      success: true,
      sql: result.sql,
      provider: result.provider,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
