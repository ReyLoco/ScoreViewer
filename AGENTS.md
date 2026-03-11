## ScoreViewer – Notas para agentes

### 1. Características actuales del proyecto

- **Frontend React (Create React App)**  
  - Código en `src/`.  
  - Lista de canciones originalmente generada en `src/songs.generated.json` a partir de los PDFs de `public/pdfs` usando `scripts/generateSongs.js`.  
  - Ahora el listado se obtiene dinámicamente desde una **API Node** mediante `GET /api/songs`.  
  - La URL de la API se configura en `src/Constants.js` (`SONGS_API_URL`), con valor por defecto `http://localhost:4000/api/songs`.

- **Generación de canciones (lógica compartida)**  
  - El módulo `scripts/songsGenerator.js` contiene la lógica para leer la carpeta de PDFs y generar el array de canciones (mismo formato que antes).  
  - `scripts/generateSongs.js` sigue existiendo para generar el JSON estático en desarrollo/build, pero ahora reutiliza `songsGenerator.js`.

- **Backend API (Node/Express)**  
  - Código en `server/index.js` con `server/package.json`.  
  - Dependencias principales: `express`, `multer`, `cors`.  
  - Usa la misma lógica de `songsGenerator.js` para obtener el listado desde la carpeta de PDFs (`public/pdfs`).  
  - Endpoints principales:
    - `GET /api/health` → Comprobación rápida de estado.
    - `GET /api/songs` → Devuelve el listado completo de canciones generado a partir de los PDFs.
    - `POST /api/upload` → Sube un PDF nuevo (`multipart/form-data`, campo `file`, opcionalmente `group`, `title`, `type`). Renombra el archivo al formato `Grupo - Título - P/L.pdf` y recalcula el listado.
    - `PUT /api/files/:fileName` → Renombra un PDF existente usando `newGroup`, `newTitle`, `newType` (en el body). Devuelve el nuevo nombre y el listado actualizado.
    - `DELETE /api/files/:fileName` → Elimina un PDF y devuelve el listado actualizado.
  - Los PDF se guardan en la carpeta `public/pdfs` del proyecto.

- **Despliegue previsto**  
  - Frontend desplegable mediante Netlify o un workflow de GitHub Actions que construya el `build/` y lo copie al servidor Linux.  
  - Backend a ejecutar en el servidor Linux (Clouding, sin interfaz gráfica), escuchando en el puerto 4000 o el que se configure.  
  - Se contempla usar **rclone** en el servidor para sincronizar la carpeta local `public/pdfs` con una carpeta de Google Drive que el usuario ya utiliza como repositorio de PDFs.

### 2. Próximos pasos recomendados

1. **Completar interfaz de administración en el frontend**
   - Crear un componente (por ejemplo `AdminPanel`) que permita:
     - Subir nuevos PDFs vía `POST /api/upload` (formulario con `file`, `group`, `title`, `type`).
     - Listar las canciones y mostrar para cada entrada las acciones de:
       - Renombrar (llamar a `PUT /api/files/:fileName`).
       - Eliminar (llamar a `DELETE /api/files/:fileName`).
   - Integrar este panel en la UI (p.ej. opción de menú oculta o protegida).

2. **Configurar despliegue del backend en el servidor Linux**
   - Copiar la carpeta `server/` al servidor (p. ej. `/var/www/scoreviewer/server`).  
   - Instalar dependencias con `npm install`.  
   - Ejecutar el backend como servicio (`pm2` o `systemd`) asegurando:
     - Variable de entorno `PORT` si no se usa 4000.
     - Permisos de lectura/escritura sobre la carpeta `public/pdfs`.

3. **Configurar sincronización con Google Drive (opcional pero recomendado)**
   - Instalar `rclone` en el servidor.  
   - Configurar un remoto `gdrive` con la cuenta de Google del usuario.  
   - Definir una carpeta de Drive (ej. `ScoreViewerPDFs`) como origen.  
   - Crear `crontab` o un servicio que sincronice periódicamente:
     - `gdrive:ScoreViewerPDFs` → `public/pdfs` (bajada).  
     - Opcionalmente `public/pdfs` → `gdrive:ScoreViewerPDFs` (subida).

4. **Ajustar el frontend para entornos de producción**
   - En desarrollo: usar `SONGS_API_URL` por defecto (`http://localhost:4000/api/songs`).  
   - En producción: definir `REACT_APP_SONGS_API_URL` en el entorno de build (Netlify o GitHub Actions) apuntando al dominio público de la API (HTTPS).

5. **Configurar un workflow de despliegue desde GitHub (si se desea sustituir Netlify)**
   - Crear `.github/workflows/deploy.yml` que:
     - Haga `npm install` y `npm run build` del frontend.  
     - Copie el contenido de `build/` al directorio público del servidor mediante `rsync` o `scp`.  
     - Opcionalmente sincronice/actualice `server/` y reinicie el servicio del backend.

6. **Seguridad básica y hardening**
   - Restringir `CORS` en `server/index.js` solo a los orígenes reales de producción.  
   - Revisar que los endpoints de upload/update/delete estén protegidos (autenticación simple, token, IP allowlist, etc.) antes de exponerlos públicamente.  
   - Validar bien los nombres de archivo y parámetros para evitar problemas de path traversal o inyección.

