export type ProviderId =
  | 'groq'
  | 'openai'
  | 'mistral'
  | 'openrouter'
  | 'gemini'
  | 'nvidia';

export interface ChatImageAttachment {
  dataUrl: string;
  mimeType: string;
  base64: string;
  name?: string;
  size?: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  contextWindow?: string;
  speedRating: 'Ultra rápido' | 'Rápido' | 'Equilibrado' | 'Potente';
  isMultimodal?: boolean;
}

export interface AIProviderInfo {
  id: ProviderId;
  name: string;
  badge: string;
  description: string;
  envKeyName: string;
  defaultModel: string;
  isMultimodal?: boolean;
  models: AIModel[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  model?: string;
  provider?: ProviderId;
  error?: string;
  isStreaming?: boolean;
  image?: ChatImageAttachment;
}

export interface ChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  customKeys: Partial<Record<ProviderId, string>>;
}

export interface ChatRequestPayload {
  provider: ProviderId;
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  customApiKey?: string;
  image?: ChatImageAttachment;
}

export const PROVIDERS_CONFIG: AIProviderInfo[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Multimodal',
    description: 'Modelos de Google de última generación con visión multimodal y alta velocidad.',
    envKeyName: 'GEMINI_API_KEY',
    defaultModel: 'gemini-3.8-flash',
    isMultimodal: true,
    models: [
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        description: 'Modelo insignia de Google de máxima velocidad con comprensión multimodal de fotos y texto',
        contextWindow: '1M',
        speedRating: 'Ultra rápido',
        isMultimodal: true,
      },
      {
        id: 'gemini-flash-latest',
        name: 'Gemini Flash Latest',
        description: 'Alias oficial al modelo Flash más reciente y optimizado',
        contextWindow: '1M',
        speedRating: 'Ultra rápido',
        isMultimodal: true,
      },
      {
        id: 'gemini-3.5-flash',
        name: 'Gemini 3.5 Flash',
        description: 'Excelente balance entre velocidad de respuesta y calidad multimodal',
        contextWindow: '1M',
        speedRating: 'Ultra rápido',
        isMultimodal: true,
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        description: 'Inferencia ultra ligera para respuestas inmediatas de muy baja latencia',
        contextWindow: '1M',
        speedRating: 'Ultra rápido',
        isMultimodal: true,
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'GPT Vision',
    description: 'Modelos de OpenAI con capacidades multimodales avanzadas y razonamiento.',
    envKeyName: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o-mini',
    isMultimodal: true,
    models: [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o mini',
        description: 'Modelo eficiente y rápido con visión multimodal y análisis de fotos',
        contextWindow: '128k',
        speedRating: 'Rápido',
        isMultimodal: true,
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o Omnimodel',
        description: 'Modelo insignia de OpenAI para análisis complejo de visión y lógica',
        contextWindow: '128k',
        speedRating: 'Equilibrado',
        isMultimodal: true,
      },
      {
        id: 'o3-mini',
        name: 'o3-mini (Razonamiento)',
        description: 'Especializado en tareas lógicas, matemáticas y codificación profunda',
        contextWindow: '128k',
        speedRating: 'Equilibrado',
        isMultimodal: false,
      },
    ],
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'LPU Speed',
    description: 'Inferencia a velocidad extrema impulsada por hardware LPU (solo texto).',
    envKeyName: 'GROQ_API_KEY',
    defaultModel: 'qwen/qwen3.8-27b',
    isMultimodal: false,
    models: [
      {
        id: 'qwen/qwen3.8-27b',
        name: 'Qwen 3.8 27B (Groq)',
        description: 'Velocidad LPU extrema con gran solvencia en español y razonamiento',
        contextWindow: '32k',
        speedRating: 'Ultra rápido',
        isMultimodal: false,
      },
      {
        id: 'openai/gpt-oss-120b',
        name: 'GPT OSS 120B (Groq)',
        description: 'Modelo amplio de alta capacidad optimizado para Groq LPU',
        contextWindow: '32k',
        speedRating: 'Ultra rápido',
        isMultimodal: false,
      },
      {
        id: 'openai/gpt-oss-20b',
        name: 'GPT OSS 20B (Groq)',
        description: 'Ultra veloz para respuestas instantáneas de baja latencia',
        contextWindow: '32k',
        speedRating: 'Ultra rápido',
        isMultimodal: false,
      },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    badge: 'Le Chat',
    description: 'Modelos europeos de vanguardia para código y razonamiento en español y multilingüe.',
    envKeyName: 'MISTRAL_API_KEY',
    defaultModel: 'mistral-small-latest',
    isMultimodal: false,
    models: [
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small Latest',
        description: 'Rápido, costo-eficiente y con alta precisión lógica y sintáctica',
        contextWindow: '32k',
        speedRating: 'Rápido',
        isMultimodal: false,
      },
      {
        id: 'mistral-medium-latest',
        name: 'Mistral Medium Latest',
        description: 'Razonamiento complejo, análisis profundo de documentos y argumentación',
        contextWindow: '64k',
        speedRating: 'Equilibrado',
        isMultimodal: false,
      },
      {
        id: 'codestral-latest',
        name: 'Codestral Latest',
        description: 'Especializado en generación, depuración y arquitectura de código',
        contextWindow: '32k',
        speedRating: 'Rápido',
        isMultimodal: false,
      },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'Universal',
    description: 'Enrutador universal con acceso a modelos globales.',
    envKeyName: 'OPENROUTER_API_KEY',
    defaultModel: 'deepseek/deepseek-chat',
    isMultimodal: true,
    models: [
      {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek V3 (Chat)',
        description: 'Excelente modelo open-weights con gran solvencia técnica y matemática',
        contextWindow: '64k',
        speedRating: 'Equilibrado',
        isMultimodal: false,
      },
      {
        id: 'google/gemini-2.0-flash-001',
        name: 'Gemini Flash (OpenRouter)',
        description: 'Inferencia de Gemini multimodal a través de OpenRouter',
        contextWindow: '1M',
        speedRating: 'Rápido',
        isMultimodal: true,
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Meta Llama 3.3 70B Instruct',
        description: 'Inferencia optimizada de Llama 3.3 en clúster OpenRouter',
        contextWindow: '128k',
        speedRating: 'Rápido',
        isMultimodal: false,
      },
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    badge: 'GPU Cloud',
    description: 'Microservicios acelerados por GPU NVIDIA TensorRT-LLM.',
    envKeyName: 'NVIDIA_API_KEY',
    defaultModel: 'meta/llama-3.1-70b-instruct',
    isMultimodal: false,
    models: [
      {
        id: 'meta/llama-3.1-70b-instruct',
        name: 'Llama 3.1 70B (NVIDIA NIM)',
        description: 'Desplegado en infraestructura de supercomputación NVIDIA TensorRT',
        contextWindow: '128k',
        speedRating: 'Rápido',
        isMultimodal: false,
      },
      {
        id: 'deepseek-ai/deepseek-coder-6.7b-instruct',
        name: 'DeepSeek Coder (NVIDIA)',
        description: 'Especializado en análisis algorítmico y código',
        contextWindow: '32k',
        speedRating: 'Rápido',
        isMultimodal: false,
      },
      {
        id: 'ibm/granite-3.0-8b-instruct',
        name: 'IBM Granite 3.0 8B (NVIDIA)',
        description: 'Inferencia corporativa de baja latencia',
        contextWindow: '32k',
        speedRating: 'Ultra rápido',
        isMultimodal: false,
      },
    ],
  },
];
