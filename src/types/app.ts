export type LaunchMode = 'in-app' | 'about-blank';

export interface AppDefinition {
  id: 'cloud-app' | 'cinera' | 'ai-studio';
  name: string;
  category: string;
  tagline: string;
  description: string;
  url: string;
  isExternal: boolean;
  accentColor: string;
  badge: string;
  features: string[];
}

export const APPS: AppDefinition[] = [
  {
    id: 'cloud-app',
    name: 'Cloud App',
    category: 'Cloud Services',
    tagline: 'Infraestructura y herramientas en la nube',
    description: 'Plataforma de servicios en la nube con acceso rápido a herramientas dinámicas, recursos distribuidos y gestión en tiempo real.',
    url: 'https://d3roguffc3an1t.cloudfront.net/',
    isExternal: true,
    accentColor: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    badge: 'Servicio 1',
    features: ['Acceso seguro', 'Infraestructura elástica', 'Optimización fluida'],
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
