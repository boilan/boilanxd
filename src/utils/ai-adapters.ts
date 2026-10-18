import type { ProviderId, ChatRequestPayload } from '../types/ai.ts';

export interface ProviderRequestConfig {
  url: string;
  headers: Record<string, string>;
  body: string;
  isGeminiNative: boolean;
}

export function getEnvKeyForProvider(provider: ProviderId): string {
  switch (provider) {
    case 'gemini':
      return 'GEMINI_API_KEY';
    case 'openai':
      return 'OPENAI_API_KEY';
    case 'groq':
      return 'GROQ_API_KEY';
    case 'mistral':
      return 'MISTRAL_API_KEY';
    case 'openrouter':
      return 'OPENROUTER_API_KEY';
    case 'nvidia':
      return 'NVIDIA_API_KEY';
    default:
      return '';
  }
}

/**
 * Normalizes model names if legacy names are provided
 */
export function normalizeModelName(provider: ProviderId, model: string): string {
  if (provider === 'gemini') {
    // Gracefully handle legacy / deprecated names
    if (model === 'gemini-1.5-flash' || model === 'gemini-2.0-flash' || model === 'gemini-2.5-flash') {
      return 'gemini-3.8-flash';
    }
    if (model === 'gemini-1.5-pro' || model === 'gemini-2.5-pro') {
      return 'gemini-3.8-flash';
    }
  }
  return model;
}

/**
 * Builds standard OpenAI-compatible or Gemini-native request configuration
 */
export function buildProviderRequest(
  payload: ChatRequestPayload,
  apiKey: string,
  stream: boolean = true
): ProviderRequestConfig {
  const { provider, messages, temperature = 0.7, maxTokens = 2048, systemPrompt } = payload;
  const model = normalizeModelName(provider, payload.model);

  if (provider === 'gemini') {
    // Gemini REST API endpoint
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}`;
    const endpoint = stream
      ? `${baseUrl}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`
      : `${baseUrl}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const filtered = messages.filter((m) => m.role !== 'system');
    const contents = filtered.map((m, idx) => {
      const isLastUser = m.role === 'user' && idx === filtered.length - 1;
      const parts: Array<Record<string, unknown>> = [];

      if (m.content && m.content.trim().length > 0) {
        parts.push({ text: m.content });
      }

      if (isLastUser && payload.image) {
        parts.push({
          inlineData: {
            mimeType: payload.image.mimeType,
            data: payload.image.base64,
          },
        });
      }

      if (parts.length === 0) {
        parts.push({ text: ' ' });
      }

      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const geminiBody: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: Math.min(Math.max(temperature, 0), 2),
        maxOutputTokens: maxTokens,
      },
    };

    const sys = systemPrompt || messages.find((m) => m.role === 'system')?.content;
    if (sys) {
      geminiBody.systemInstruction = {
        parts: [{ text: sys }],
      };
    }

    return {
      url: endpoint,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiBody),
      isGeminiNative: true,
    };
  }

  // OpenAI-compatible providers
  let url = 'https://api.openai.com/v1/chat/completions';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (provider === 'groq') {
    url = 'https://api.groq.com/openai/v1/chat/completions';
  } else if (provider === 'mistral') {
    url = 'https://api.mistral.ai/v1/chat/completions';
  } else if (provider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['HTTP-Referer'] = 'https://home-clases.app';
    headers['X-Title'] = 'Home - clases';
  } else if (provider === 'nvidia') {
    url = 'https://integrate.api.nvidia.com/v1/chat/completions';
  }

  const formattedMessages: Array<{ role: string; content: unknown }> = [];

  const effectiveSys = systemPrompt || messages.find((m) => m.role === 'system')?.content;
  if (effectiveSys) {
    formattedMessages.push({ role: 'system', content: effectiveSys });
  }

  const filtered = messages.filter((m) => m.role !== 'system');
  filtered.forEach((m, idx) => {
    const isLastUser = m.role === 'user' && idx === filtered.length - 1;
    if (isLastUser && payload.image) {
      formattedMessages.push({
        role: m.role,
        content: [
          { type: 'text', text: m.content || 'Por favor analiza esta imagen adjunta.' },
          {
            type: 'image_url',
            image_url: {
              url: payload.image.dataUrl || `data:${payload.image.mimeType};base64,${payload.image.base64}`,
            },
          },
        ],
      });
    } else {
      formattedMessages.push({ role: m.role, content: m.content });
    }
  });

  const requestBody = {
    model,
    messages: formattedMessages,
    temperature,
    max_tokens: maxTokens,
    stream,
  };

  return {
    url,
    headers,
    body: JSON.stringify(requestBody),
    isGeminiNative: false,
  };
}

/**
 * Normalizes provider error messages into clear, actionable Spanish descriptions
 */
export function formatErrorFriendly(
  provider: ProviderId,
  status: number,
  rawError?: string
): string {
  if (status === 401 || status === 403) {
    return `Error de autenticación con ${provider.toUpperCase()}: la API key configurada en el servidor no es válida o no tiene permisos.`;
  }
  if (status === 429) {
    return `Límite de cuota excedido para ${provider.toUpperCase()}: se ha alcanzado temporalmente el límite de peticiones. Prueba con otro modelo o proveedor.`;
  }
  if (status === 404) {
    return `El modelo seleccionado en ${provider.toUpperCase()} no está disponible en este momento. Selecciona otro modelo en el menú.`;
  }
  if (status >= 500) {
    return `Los servidores de ${provider.toUpperCase()} están experimentando incidencias temporales (${status}). Intenta nuevamente en unos instantes.`;
  }

  if (rawError && rawError.length > 0) {
    return `Error (${status}): ${rawError}`;
  }

  return `Ocurrió un error inesperado al conectar con ${provider.toUpperCase()} (${status}).`;
}
