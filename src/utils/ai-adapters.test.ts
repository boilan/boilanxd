import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildProviderRequest,
  formatErrorFriendly,
  getEnvKeyForProvider,
} from './ai-adapters.ts';

test('getEnvKeyForProvider returns expected env keys', () => {
  assert.equal(getEnvKeyForProvider('groq'), 'GROQ_API_KEY');
  assert.equal(getEnvKeyForProvider('openai'), 'OPENAI_API_KEY');
  assert.equal(getEnvKeyForProvider('gemini'), 'GEMINI_API_KEY');
  assert.equal(getEnvKeyForProvider('mistral'), 'MISTRAL_API_KEY');
  assert.equal(getEnvKeyForProvider('openrouter'), 'OPENROUTER_API_KEY');
  assert.equal(getEnvKeyForProvider('nvidia'), 'NVIDIA_API_KEY');
});

test('buildProviderRequest builds valid OpenAI-compatible payload for Groq', () => {
  const req = buildProviderRequest(
    {
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Hola mundo' }],
      systemPrompt: 'Asistente conciso',
      temperature: 0.5,
    },
    'gsk_test_123',
    false
  );

  assert.equal(req.url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(req.headers['Authorization'], 'Bearer gsk_test_123');
  assert.equal(req.isGeminiNative, false);

  const parsed = JSON.parse(req.body);
  assert.equal(parsed.model, 'llama-3.3-70b-versatile');
  assert.equal(parsed.messages.length, 2);
  assert.equal(parsed.messages[0].role, 'system');
  assert.equal(parsed.messages[0].content, 'Asistente conciso');
  assert.equal(parsed.messages[1].role, 'user');
  assert.equal(parsed.messages[1].content, 'Hola mundo');
});

test('buildProviderRequest formats Gemini REST payloads correctly', () => {
  const req = buildProviderRequest(
    {
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      messages: [
        { role: 'user', content: 'Pregunta' },
        { role: 'assistant', content: 'Respuesta' },
      ],
      systemPrompt: 'Instrucción de sistema',
    },
    'gemini_test_key',
    true
  );

  assert.ok(req.url.includes('streamGenerateContent?alt=sse'));
  assert.ok(req.url.includes('key=gemini_test_key'));
  assert.equal(req.isGeminiNative, true);

  const parsed = JSON.parse(req.body);
  assert.equal(parsed.contents.length, 2);
  assert.equal(parsed.contents[0].role, 'user');
  assert.equal(parsed.contents[1].role, 'model');
  assert.equal(parsed.systemInstruction.parts[0].text, 'Instrucción de sistema');
});

test('formatErrorFriendly returns clear Spanish guidance', () => {
  const authErr = formatErrorFriendly('openai', 401);
  assert.ok(authErr.includes('Error de autenticación con OPENAI'));

  const quotaErr = formatErrorFriendly('groq', 429);
  assert.ok(quotaErr.includes('Límite de cuota excedido'));
});
