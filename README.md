# boilanxd (Home - clases Portal)

Portal web minimalista y fluido que funciona como lanzador de 3 aplicaciones integradas:
1. **Cloud App**: Plataforma de servicios e infraestructura en la nube.
2. **Cinera**: Plataforma especializada en indexación y streaming multimedia.
3. **AI Studio**: Estudio multimodelo de IA con streaming en tiempo real (Google Gemini, OpenAI, Groq, Mistral, OpenRouter, NVIDIA Cloud).

---

## 🚀 Despliegue en DockHosting (`dockhosting.dev`)

DockHosting permite desplegar aplicaciones web y contenedores Docker con SSL automático y CI/CD desde GitHub.

### Opción 1: Despliegue mediante GitHub (Recomendado)

1. **Haz push de tus cambios a GitHub**:
   ```bash
   git add .
   git commit -m "fix: production build & DockHosting configuration"
   git push origin main
   ```

2. **Inicia sesión en DockHosting**:
   * Entra a [https://dockhosting.dev](https://dockhosting.dev) e inicia sesión con tu cuenta.

3. **Crea un nuevo proyecto**:
   * Haz clic en **New Project / Nuevo Proyecto**.
   * Selecciona **Import Git Repository** y conecta tu cuenta de GitHub.
   * Elige tu repositorio `boilan/boilanxd`.

4. **Configura las variables de entorno (Environment Variables)**:
   En la sección de configuración de tu aplicación en DockHosting, añade las claves de API que desees utilizar:
   * `PORT`: `3000` (o el puerto por defecto que asigne DockHosting)
   * `NODE_ENV`: `production`
   * `GEMINI_API_KEY`: Tu clave de Google Gemini
   * `GROQ_API_KEY`: *(Opcional)* Tu clave de Groq
   * `OPENAI_API_KEY`: *(Opcional)* Tu clave de OpenAI
   * `MISTRAL_API_KEY`: *(Opcional)* Tu clave de Mistral
   * `OPENROUTER_API_KEY`: *(Opcional)* Tu clave de OpenRouter
   * `NVIDIA_API_KEY`: *(Opcional)* Tu clave de NVIDIA NIM

5. **Desplegar**:
   * Haz clic en **Deploy**. DockHosting detectará automáticamente el `Dockerfile`, compilará la aplicación y la publicará con un subdominio gratis (ejemplo: `https://boilanxd.dockhosting.dev`) con certificado SSL automático.

---

### Opción 2: Despliegue vía Dock CLI

Si tienes instalada la herramienta de línea de comandos de DockHosting:

```bash
# 1. Iniciar sesión en DockHosting
dock login

# 2. Desplegar en la nube
dock deploy
```

---

### Opción 3: Ejecución Local con Docker

Para probar la imagen localmente con Docker o Docker Compose:

```bash
# Construir y levantar el contenedor
docker compose up -d --build

# Ver logs
docker compose logs -f

# Probar estado de salud
curl http://localhost:3000/api/health
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo (con HMR y Vite)
npm run dev

# Compilar para producción (frontend Vite + backend server.js)
npm run build

# Iniciar servidor compilado en producción
npm start

# Ejecutar tests unitarios
npm test

# Verificar tipos TypeScript
npm run lint
```
