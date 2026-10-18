import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PROVIDERS_CONFIG, ProviderId, ChatRequestPayload } from './src/types/ai.js';
import {
  buildProviderRequest,
  formatErrorFriendly,
  getEnvKeyForProvider,
} from './src/utils/ai-adapters.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Body parser for JSON with base64 image support (up to 15MB)
  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Home - clases Portal Server',
      timestamp: Date.now(),
    });
  });

  // Providers configuration status (clean metadata, no external web links)
  app.get('/api/providers', (_req: Request, res: Response) => {
    const providers = PROVIDERS_CONFIG.map((p) => {
      const envKey = getEnvKeyForProvider(p.id);
      const isConfigured = Boolean(process.env[envKey] && process.env[envKey]!.trim().length > 0);
      return {
        id: p.id,
        name: p.name,
        badge: p.badge,
        description: p.description,
        defaultModel: p.defaultModel,
        models: p.models,
        isConfigured,
        isMultimodal: p.isMultimodal === true,
      };
    });

    res.json({ providers });
  });

  // Chat completions endpoint with streaming and vision support
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const payload: ChatRequestPayload = req.body;
      const { provider, model, messages, customApiKey, image } = payload;

      if (!provider || !model || !messages || !Array.isArray(messages)) {
        res.status(400).json({
          error: 'Parámetros incompletos: se requiere provider, model y messages.',
        });
        return;
      }

      // Check multimodal support
      const isMultimodalSupported =
        provider === 'gemini' ||
        provider === 'openai' ||
        (provider === 'openrouter' && model.includes('gemini'));

      if (image && !isMultimodalSupported) {
        res.status(400).json({
          error: `El modelo seleccionado en ${provider.toUpperCase()} está optimizado solo para texto. Para analizar fotos e imágenes, selecciona Google Gemini (Gemini 3.8 Flash) u OpenAI.`,
        });
        return;
      }

      // Resolve API key: server env key or user custom key
      const envKeyName = getEnvKeyForProvider(provider);
      const effectiveKey =
        (customApiKey && customApiKey.trim().length > 0)
          ? customApiKey.trim()
          : process.env[envKeyName]?.trim();

      if (!effectiveKey) {
        res.status(400).json({
          error: `No se encontró clave de API configurada para ${provider.toUpperCase()} en las variables de entorno del servidor.`,
        });
        return;
      }

      const stream = req.query.stream !== 'false';
      let requestConfig = buildProviderRequest(payload, effectiveKey, stream);

      let upstreamResponse = await fetch(requestConfig.url, {
        method: 'POST',
        headers: requestConfig.headers,
        body: requestConfig.body,
      });

      // Automatic fallback for Gemini if a specific model returns 404
      if (!upstreamResponse.ok && upstreamResponse.status === 404 && provider === 'gemini' && model !== 'gemini-3.8-flash') {
        const fallbackPayload = { ...payload, model: 'gemini-3.8-flash' };
        requestConfig = buildProviderRequest(fallbackPayload, effectiveKey, stream);
        upstreamResponse = await fetch(requestConfig.url, {
          method: 'POST',
          headers: requestConfig.headers,
          body: requestConfig.body,
        });
      }

      if (!upstreamResponse.ok) {
        let errBody = '';
        try {
          errBody = await upstreamResponse.text();
          const parsed = JSON.parse(errBody);
          errBody = parsed.error?.message || parsed.message || errBody;
        } catch {
          // ignore json parse error
        }
        const friendlyMessage = formatErrorFriendly(provider, upstreamResponse.status, errBody);
        res.status(upstreamResponse.status).json({
          error: friendlyMessage,
          status: upstreamResponse.status,
        });
        return;
      }

      if (!stream) {
        const data = await upstreamResponse.json();
        let content = '';
        if (requestConfig.isGeminiNative) {
          content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          content = data.choices?.[0]?.message?.content || '';
        }
        res.json({ content, provider, model });
        return;
      }

      // Stream via Server-Sent Events (SSE)
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      if (!upstreamResponse.body) {
        res.write(`data: ${JSON.stringify({ error: 'La respuesta del proveedor no contiene un flujo legible.' })}\n\n`);
        res.end();
        return;
      }

      const reader = upstreamResponse.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                res.write('data: [DONE]\n\n');
                continue;
              }

              try {
                const parsed = JSON.parse(dataStr);
                let textDelta = '';

                if (requestConfig.isGeminiNative) {
                  textDelta = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                } else {
                  textDelta = parsed.choices?.[0]?.delta?.content || '';
                }

                if (textDelta) {
                  res.write(`data: ${JSON.stringify({ text: textDelta })}\n\n`);
                }
              } catch {
                // Ignore partial JSON line
              }
            }
          }
        }

        // Process leftover buffer if any
        if (buffer.trim().startsWith('data: ')) {
          const dataStr = buffer.trim().slice(6);
          if (dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr);
              let textDelta = '';
              if (requestConfig.isGeminiNative) {
                textDelta = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              } else {
                textDelta = parsed.choices?.[0]?.delta?.content || '';
              }
              if (textDelta) {
                res.write(`data: ${JSON.stringify({ text: textDelta })}\n\n`);
              }
            } catch {
              // ignore
            }
          }
        }

        res.write('data: [DONE]\n\n');
        res.end();
      } catch (streamErr) {
        console.error('Error during stream processing:', streamErr);
        res.write(`data: ${JSON.stringify({ error: 'Error durante la transmisión del flujo.' })}\n\n`);
        res.end();
      }
    } catch (err: unknown) {
      console.error('Error in /api/chat:', err);
      const msg = err instanceof Error ? err.message : 'Error interno del servidor';
      if (!res.headersSent) {
        res.status(500).json({ error: msg });
      } else {
        res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
        res.end();
      }
    }
  });

  // Dev server or Production static serving
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Home - clases] Portal server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
