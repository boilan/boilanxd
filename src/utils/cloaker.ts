/**
 * Cloaker utility for Modo B (about:blank container)
 * Generates an unbranded, zero-margin about:blank tab with title 'Home - clases'
 * and Google Classroom inspired favicon.
 */

export const CLASSROOM_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect x="3" y="6" width="42" height="34" rx="5" fill="#fbbc04"/>
  <rect x="6" y="9" width="36" height="28" rx="3" fill="#137333"/>
  <circle cx="24" cy="18" r="3.6" fill="#ffffff"/>
  <path d="M18.5 29 C18.5 24.5 21 23 24 23 C27 23 29.5 24.5 29.5 29 Z" fill="#ffffff"/>
  <circle cx="16" cy="20" r="2.6" fill="#ffffff" opacity="0.9"/>
  <path d="M12 29 C12 25.5 14 24.2 16 24.2 C17.3 24.2 18.5 24.8 19.2 25.8 C18.7 26.7 18.5 27.8 18.5 29 Z" fill="#ffffff" opacity="0.9"/>
  <circle cx="32" cy="20" r="2.6" fill="#ffffff" opacity="0.9"/>
  <path d="M36 29 C36 25.5 34 24.2 32 24.2 C30.7 24.2 29.5 24.8 28.8 25.8 C29.3 26.7 29.5 27.8 29.5 29 Z" fill="#ffffff" opacity="0.9"/>
</svg>`;

export const CLASSROOM_FAVICON_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(CLASSROOM_FAVICON_SVG)}`;

export interface CloakerHtmlOptions {
  title?: string;
  targetUrl: string;
  faviconDataUri?: string;
  appName?: string;
}

export function generateCloakerHtml(options: CloakerHtmlOptions): string {
  const title = options.title || 'Home - clases';
  const targetUrl = options.targetUrl;
  const favicon = options.faviconDataUri || CLASSROOM_FAVICON_DATA_URI;
  const appName = options.appName || 'Aplicación';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" type="image/svg+xml" href="${favicon}">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #0b0e14;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #cloak-frame {
      border: none;
      width: 100%;
      height: 100%;
      display: block;
    }
    #loading-indicator {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #0b0e14;
      color: #94a3b8;
      z-index: 10;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 12px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

  </style>
</head>
<body>
  <div id="loading-indicator">
    <div class="spinner"></div>
    <span style="font-size: 13px; letter-spacing: 0.05em;">Cargando ${escapeHtml(appName)}...</span>
  </div>

  <iframe
    id="cloak-frame"
    src="${escapeHtml(targetUrl)}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
    allowfullscreen
    onload="document.getElementById('loading-indicator').style.opacity = '0'; setTimeout(function(){ document.getElementById('loading-indicator').style.display = 'none'; }, 250);"
  ></iframe>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface LaunchResult {
  success: boolean;
  blocked: boolean;
  popup: Window | null;
  mode: 'about-blank' | 'direct';
}

/**
 * Attempts to open target URL inside an about:blank container.
 * If blocked by popup blocker, returns blocked: true so UI can show a retry button.
 */
export function openInAboutBlank(
  targetUrl: string,
  title: string = 'Home - clases',
  appName: string = 'Aplicación'
): LaunchResult {
  try {
    const popup = window.open('about:blank', '_blank');

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      return { success: false, blocked: true, popup: null, mode: 'about-blank' };
    }

    const html = generateCloakerHtml({
      title,
      targetUrl,
      faviconDataUri: CLASSROOM_FAVICON_DATA_URI,
      appName,
    });

    popup.document.open();
    popup.document.write(html);
    popup.document.close();

    // Ensure title remains exact
    if (popup.document) {
      popup.document.title = title;
    }

    return { success: true, blocked: false, popup, mode: 'about-blank' };
  } catch (err) {
    console.warn('Failed to populate about:blank tab, falling back:', err);
    // Fallback: try opening target URL directly
    try {
      const direct = window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return { success: !!direct, blocked: !direct, popup: direct, mode: 'direct' };
    } catch {
      return { success: false, blocked: true, popup: null, mode: 'direct' };
    }
  }
}
