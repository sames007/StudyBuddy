import { z } from 'zod';

type GeminiSchema = {
  type: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean';
  properties?: Record<string, GeminiSchema>;
  items?: GeminiSchema;
  enum?: string[];
  required?: string[];
};

type GeminiOptions = {
  responseSchema?: GeminiSchema;
  responseMimeType?: 'application/json';
  maxOutputTokens?: number;
  temperature?: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
};

type GeminiErrorResponse = {
  error?: {
    message?: string;
    status?: string;
  };
};

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  return apiKey;
}

function extractText(response: GeminiResponse) {
  if (response.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked this request: ${response.promptFeedback.blockReason}`);
  }

  const text = response.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

function stripJsonFence(text: string) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export async function generateGeminiText(prompt: string, options: GeminiOptions = {}) {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': getGeminiApiKey(),
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        candidateCount: 1,
        temperature: options.temperature ?? 0.4,
        ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        ...(options.responseMimeType && options.responseSchema
          ? {
              responseMimeType: options.responseMimeType,
              responseJsonSchema: options.responseSchema,
            }
          : {}),
      },
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as GeminiErrorResponse | null;
    const message = payload?.error?.message || '';
    const status = payload?.error?.status;

    if (status === 'RESOURCE_EXHAUSTED' && message.includes('prepayment credits are depleted')) {
      throw new Error(
        'Gemini API is paused because its project has no available prepaid credits. To keep this app free, use a Google AI Studio Free Tier API key from a project that is not on paid/prepay billing.'
      );
    }

    if (status === 'PERMISSION_DENIED') {
      throw new Error(
        'Gemini API permission denied. Check that the API key can call generativelanguage.googleapis.com and that the Gemini API is enabled for its project.'
      );
    }

    if (message.includes('API key not valid')) {
      throw new Error(
        'Gemini API key is invalid or not allowed to call the Gemini API. Create a Google AI Studio API key with Generative Language API access and save it as GEMINI_API_KEY.'
      );
    }

    throw new Error(message || `Gemini API request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as GeminiResponse;
  return extractText(payload);
}

export async function generateGeminiJson<T>(
  prompt: string,
  validator: z.ZodType<T>,
  responseSchema: GeminiSchema,
  options: Omit<GeminiOptions, 'responseMimeType' | 'responseSchema'> = {}
) {
  const rawText = await generateGeminiText(prompt, {
    ...options,
    responseMimeType: 'application/json',
    responseSchema,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(rawText));
  } catch {
    throw new Error('Gemini returned malformed JSON.');
  }

  return validator.parse(parsed);
}
