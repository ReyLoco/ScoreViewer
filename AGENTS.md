## ScoreViewer – Notas para agentes

### 1. Características actuales del proyecto

- **Frontend React (Create React App)**  
  - Código en `src/`.  
  - Lista de canciones originalmente generada en `src/songs.generated.json` a partir de los PDFs de `public/pdfs` usando `scripts/generateSongs.js`.  
  - Ahora el listado se obtiene dinámicamente desde una **API Node** mediante `GET /api/songs`.  
  - La URL de la API se configura en `src/Constants.js`:
    - `SONGS_API_URL` (por defecto `http://localhost:4000/api/songs`)
    - `API_BASE_URL` (por defecto `http://localhost:4000`)
    - `PDF_BASE_URL` (por defecto `${API_BASE_URL}/pdfs/`)

- **Generación de canciones (lógica compartida)**  
  - El módulo `scripts/songsGenerator.js` contiene la lógica para leer PDFs y generar el array de canciones.  
  - Soporta lectura **recursiva** (subcarpetas) y devuelve rutas relativas normalizadas con `/` (útil para Linux/Windows).  
  - `scripts/generateSongs.js` sigue existiendo para generar el JSON estático en desarrollo/build, pero ahora reutiliza `songsGenerator.js`.

- **Backend API (Node/Express)**  
  - Código en `server/index.js` con `server/package.json`.  
  - Dependencias principales: `express`, `multer`, `cors`.  
  - Usa la misma lógica de `songsGenerator.js` para obtener el listado desde la carpeta de PDFs (`PDF_DIR`).  
  - Endpoints principales:
    - `GET /api/health` → Comprobación rápida de estado.
    - `GET /api/songs` → Devuelve el listado completo de canciones generado a partir de los PDFs.
    - `POST /api/upload` → Sube un PDF nuevo (`multipart/form-data`, campo `file`, opcionalmente `group`, `title`, `type`). Renombra el archivo al formato `Grupo - Título - P/L.pdf` y recalcula el listado.
    - `PUT /api/files/:fileName` → Renombra un PDF existente usando `newGroup`, `newTitle`, `newType` (en el body). Devuelve el nuevo nombre y el listado actualizado.
    - `DELETE /api/files/:fileName` → Elimina un PDF y devuelve el listado actualizado.
  - Sirve PDFs desde el propio backend en `GET /pdfs/<archivo>` (para no depender de `public/pdfs` en el build estático).
  - Carpeta de PDFs configurable con `PDF_DIR` (por defecto `public/pdfs` en el repo).

- **Despliegue previsto**  
  - Frontend desplegable mediante Netlify o un workflow de GitHub Actions que construya el `build/` y lo copie al servidor Linux.  
  - Backend a ejecutar en el servidor Linux (Clouding, sin interfaz gráfica), escuchando en el puerto 4000 o el que se configure.  
  - Se usa **rclone** en el servidor para sincronizar una carpeta de Google Drive (fuente de verdad) hacia el servidor.

- **Panel Admin en la app**  
  - Existe un panel `Admin` en el frontend para subir/renombrar/borrar PDFs usando la API.
  - La subida permite elegir carpeta lógica (`General` o `Propias`), que corresponde a subcarpetas reales dentro de `PDF_DIR`.
  - El endpoint `PUT /api/files/:fileName` ahora **mantiene la subcarpeta original** del archivo (o permite moverlo a otra carpeta si se indica), en lugar de moverlo siempre a la raíz de `PDF_DIR`.

- **Estado de datos en el repo local**
  - En `public/pdfs` se han dejado **solo 10 PDFs** para pruebas locales (se eliminaron el resto).

- **Estado del servidor (Clouding)**
  - Ubuntu 20.04 actualizado (repos estándar), disco ampliado a 20GB.
  - Node instalado (v20.x).
  - Ruta de datos en el servidor: `/srv/scoreviewer/partituras` con subcarpetas:
    - `/srv/scoreviewer/partituras/General`
    - `/srv/scoreviewer/partituras/Propias`
  - rclone configurado (remote `gdrive`) y sincronización completada.
  - Cron (root) semanal:
    - Sábado 22:00 → sync General
    - Sábado 23:00 → sync Propias
    - Log: `/var/log/rclone-scoreviewer.log`

- **Estado de despliegue / automatización**
  - Usuario de despliegue creado en el servidor: `deploy`, con permisos sobre `/var/www/scoreviewer`.
  - Clave SSH específica para GitHub Actions configurada para el usuario `deploy` (acceso solo por clave pública).
  - Subdominios creados:
    - `scoreviewer.luismasso.es` (frontend estático).
    - `api.luismasso.es` (API Node + PDFs vía Nginx reverse proxy, pendiente de configurar).
  - Workflow de GitHub Actions creado: `.github/workflows/deploy-prod.yml`.
    - Se ejecuta en cada `push` a la rama `prod`.
    - Construye el frontend (`npm ci && npm run build`) usando variables `REACT_APP_SW_*`.
    - Despliega el contenido de `build/` a `/var/www/scoreviewer` vía SSH/rsync usando los secretos `*_SW`.

### 2. Próximos pasos recomendados

1. **Dejar backend Node funcionando como servicio en el servidor Linux**
  - Copiar/actualizar `server/` y `scripts/` al servidor (p. ej. `/var/www/scoreviewer-api`).
  - Instalar dependencias en `server/` con `npm install` (o `npm ci`).
  - Crear servicio `systemd` (o configuración `pm2`) para el backend con:
    - `PDF_DIR=/srv/scoreviewer/partituras`
    - `PORT=4000` (o el que se configure)
    - `ALLOWED_ORIGIN=https://scoreviewer.luismasso.es` para CORS en producción.
  - Verificar que `http://127.0.0.1:4000/api/health` responde correctamente en el servidor.

2. **Configurar Nginx para frontend y API con HTTPS**
  - `scoreviewer.luismasso.es`:
    - Servir estáticos desde `/var/www/scoreviewer` (contenido desplegado por GitHub Actions).
    - Configurar `try_files $uri /index.html;` para soportar routing de React.
  - `api.luismasso.es`:
    - Proxy inverso de `/api/*` y `/pdfs/*` hacia `http://127.0.0.1:4000`.
    - Establecer `client_max_body_size` adecuado para subida de PDFs.
  - Solicitar y configurar certificados HTTPS con Let’s Encrypt (`certbot --nginx -d scoreviewer.luismasso.es -d api.luismasso.es`).

3. **Ajustar variables de entorno de build (ya preparadas en Secrets)**
  - Confirmar en GitHub Actions que los secretos están correctamente configurados:
    - `REACT_APP_SW_SONGS_API_URL=https://api.luismasso.es/api/songs`
    - `REACT_APP_SW_API_BASE_URL=https://api.luismasso.es`
    - `REACT_APP_SW_PDF_BASE_URL=https://api.luismasso.es/pdfs/`
  - Verificar que un `push` a `prod` ejecuta correctamente el workflow `deploy-prod.yml` y que el contenido de `build/` llega a `/var/www/scoreviewer`.

4. **Proteger endpoints de administración**
  - Añadir una capa de autenticación sencilla para `POST /api/upload`, `PUT /api/files/:fileName` y `DELETE /api/files/:fileName`:
    - Opción simple: token de cabecera (por ejemplo `X-Admin-Token`) comprobado en el backend.
    - Alternativa: HTTP Basic Auth a nivel de Nginx solo para rutas `/api/upload` y `/api/files/*`.

5. **Seguridad básica y hardening**
   - Restringir `CORS` en `server/index.js` solo a los orígenes reales de producción.  
   - Revisar que los endpoints de upload/update/delete estén protegidos (autenticación simple, token, IP allowlist, etc.) antes de exponerlos públicamente.  
   - Validar bien los nombres de archivo y parámetros para evitar problemas de path traversal o inyección.

### 3. Estado actual de la sesión (Mar 2026)

- **Backend desplegado y activo en servidor**
  - Código copiado a `/var/www/scoreviewer-api` (`server/`, `scripts/`, `deploy/`).
  - Dependencias instaladas con `npm ci` en `/var/www/scoreviewer-api/server`.
  - Servicio `systemd` creado y habilitado: `scoreviewer-api.service`.
  - API levantada en `127.0.0.1:4000` y `systemctl status` en estado `active (running)`.
  - Se configuró `ADMIN_TOKEN` en el servicio.

- **Seguridad de endpoints admin implementada en código**
  - Backend (`server/index.js`) protege `POST /api/upload`, `PUT /api/files/:fileName` y `DELETE /api/files/:fileName` con cabecera `X-Admin-Token`.
  - Frontend (`src/components/AdminPanel.js`) incluye campo "Token administración" y envía `X-Admin-Token` en operaciones admin.
  - Se prepararon plantillas en repo:
    - `server/.env.example`
    - `deploy/scoreviewer-api.service.example`
    - `deploy/nginx-scoreviewer.conf.example`
    - `deploy/PROD_SETUP_CHECKLIST.md`

- **Nginx / Certbot: punto de bloqueo actual**
  - `nginx -t` pasa correctamente.
  - Basic Auth para rutas admin está configurado (`/etc/nginx/.htpasswd-scoreviewer-admin`).
  - Fallo al emitir certificado con Let’s Encrypt:
    - `Challenge failed ... Invalid response ... 204`
    - Ocurre tanto en `api.luismasso.es` como en `scoreviewer.luismasso.es`.
  - Prueba manual confirma que:
    - `curl -i http://scoreviewer.luismasso.es/.well-known/acme-challenge/test-token` devuelve `204`.
    - `curl -i http://api.luismasso.es/.well-known/acme-challenge/test-token` devuelve `204`.
  - Esto indica que existe otra configuración activa en Nginx que intercepta estas rutas y responde 204, impidiendo ACME.

- **Próximos pasos al retomar (orden recomendado)**
  1. Localizar el bloque que responde `204`:
     - `nginx -T | grep -n "return 204"`
     - `ls -la /etc/nginx/sites-enabled`
     - Revisar también `/etc/nginx/conf.d/*.conf`.
  2. Desactivar/conflictos (por ejemplo `default` u otro vhost que capture hostnames) y dejar activo solo el vhost correcto.
  3. Asegurar en ambos `server` (`scoreviewer` y `api`) estas líneas:
     - `listen 80;`
     - `listen [::]:80;`
     - `location ^~ /.well-known/acme-challenge/ { root /var/www/letsencrypt; ... }`
  4. Verificar challenge manual con `curl -i` (debe devolver `200`, no `204`).
  5. Reintentar:
     - `certbot certonly --webroot -w /var/www/letsencrypt -d scoreviewer.luismasso.es -d api.luismasso.es`
     - después `certbot --nginx -d scoreviewer.luismasso.es -d api.luismasso.es`

### 4. Cierre de sesión (Mar 2026)

- **Producción funcionando**
  - DNS de `scoreviewer.luismasso.es` y `api.luismasso.es` corregido para apuntar al servidor de Clouding.
  - Certificado Let's Encrypt emitido correctamente para ambos subdominios.
  - Nginx configurado con HTTPS (redirección HTTP -> HTTPS).
  - API en producción operativa (`https://api.luismasso.es/api/health` responde OK).
  - Frontend desplegado en `/var/www/scoreviewer` y accesible por `https://scoreviewer.luismasso.es`.

- **Admin y seguridad**
  - Endpoints admin protegidos en backend con `X-Admin-Token` (`ADMIN_TOKEN` en `systemd`).
  - Endpoints sensibles protegidos adicionalmente con Basic Auth en Nginx.
  - Panel Admin movido a acceso por URL `/admin` (oculto del menú principal).
  - El campo "Token administración" del frontend debe usar el mismo valor que `ADMIN_TOKEN` del servicio backend.

- **Nota operativa importante**
  - Tras copiar nuevos builds por `scp`, la carpeta `/var/www/scoreviewer/static` puede quedar sin permisos de lectura para `www-data`.
  - Si reaparece error de MIME (`text/html` para `.js/.css`), aplicar:
    - `chmod -R a+rX /var/www/scoreviewer/static`
    - `chmod a+rX /var/www/scoreviewer`
    - `nginx -t && systemctl reload nginx`

### 5. Próximos pasos para siguiente sesión

1. **Git / limpieza de PDFs**
  - Dejar de versionar `public/pdfs` (untrack en Git y añadir regla adecuada en `.gitignore`).
  - Eliminar esa carpeta también del repositorio remoto (origin) una vez confirmado.

2. **CI/CD**
  - Implementar y probar el workflow de GitHub Actions para despliegue a producción (frontend y, si aplica, backend/scripts).
  - Verificar secretos y ejecución real end-to-end.

3. **Mejoras UI/UX**
  - Ajustes estéticos generales.
  - Aumentar un poco tamaño de fuente.
  - Estrechar el sidebar izquierdo del listado de canciones.
  - En móvil: al abrir partitura/letra, desplazar el viewport al documento automáticamente.
  - En móvil (y general): seleccionar por defecto la "A" en el listado.
  - Revisar y completar otras mejoras menores en próxima sesión.
