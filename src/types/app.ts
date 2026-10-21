export type LaunchMode = 'in-app' | 'about-blank';

export interface AppDefinition {
  id: 'cloud-app' | 'cinera' | 'ai-studio';
  name: string;
  category: string;
  tagline: string;
  description: string;
  url: string;
  urls?: string[];
  isExternal: boolean;
  accentColor: string;
  badge: string;
  features: string[];
}

export const RAMMERHEAD_ROTATING_URLS = [
  'https://cloudflare.rammerhead.org',
  'https://direct2.rammerhead.org',
  'https://direct.rammerhead.org',
];

/**
 * Obtains the next rotating URL for an app in round-robin sequence
 */
export function getNextRotatingUrl(app: AppDefinition): string {
  if (!app.urls || app.urls.length === 0) {
    return app.url;
  }
  const key = `app_rotating_idx_${app.id}`;
  let nextIdx = 0;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      nextIdx = (parseInt(saved, 10) + 1) % app.urls.length;
    }
    localStorage.setItem(key, nextIdx.toString());
  } catch {
    nextIdx = Math.floor(Math.random() * app.urls.length);
  }
  return app.urls[nextIdx];
}

export const APPS: AppDefinition[] = [
  {
    id: 'cloud-app',
    name: 'Cloud App',
    category: 'Cloud Services',
    tagline: 'Infraestructura y herramientas en la nube (Servidores rotativos)',
    description: 'Plataforma de servicios en la nube con rotación automática entre 3 servidores espejo (Cloudflare, Direct2 y Direct) para garantizar alta disponibilidad y evitar bloqueos.',
    url: RAMMERHEAD_ROTATING_URLS[0],
    urls: RAMMERHEAD_ROTATING_URLS,
    isExternal: true,
    accentColor: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    badge: 'Rotativo (3)',
    features: ['3 Servidores espejo', 'Rotación automática', 'Acceso seguro'],
  },
  {
    id: 'cinera',
    name: 'Cinera',
    category: 'Multimedia & Streaming',
    tagline: 'Archivo y reproducción cinematográfica',
    description: 'Plataforma especializada en indexación, análisis y reproducción de contenido multimedia y cinematográfico con alta fidelidad.',
    url: 'https://cinera.marginaltax.com/',
    isExternal: true,
    accentColor: 'from-amber-500/20 via-orange-500/10 to-transparent',
    badge: 'Servicio 2',
    features: ['Indexación multimedia', 'Reproducción fluida', 'Archivo extendido'],
  },
  {
    id: 'ai-studio',
    name: 'AI Studio',
    category: 'Inteligencia Artificial',
    tagline: 'Plataforma multimodelo de IA integrada',
    description: 'Estudio minimalista de generación y razonamiento con selector de entre 6 proveedores líderes (Groq, OpenAI, Mistral, OpenRouter, Gemini, NVIDIA).',
    url: '', // Aplicación nativa interna
    isExternal: false,
    accentColor: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    badge: 'Nativo',
    features: ['Streaming en vivo', '6 proveedores', 'Markdown y código'],
  },
];
