# The Witcher: El Viejo Mundo — Asistente de mesa

Asistente web para *The Witcher: El Viejo Mundo*: exploración, eventos y Automa (modo solitario). Automatiza lo que no puedes resolver fácilmente en la mesa; el resto de la partida se juega con las reglas físicas.

## Uso local

```powershell
# 1. Sincronizar imágenes de cartas (solo la primera vez o tras regenerar datos)
py -3 scripts/sync_images.py

# 2. Compilar Automa (si cambiaste automa/)
py -3 scripts/build_automa.py

# 3. Servidor local
py -3 app/serve.py
```

- App: http://localhost:8080/app/
- Automa: http://localhost:8080/app/automa/

## Publicar en GitHub Pages

### 1. Crear el repositorio en GitHub

Crea un repo vacío (por ejemplo `the-witcher-el-viejo-mundo`).

### 2. Subir el código

```powershell
cd "D:\Proyectos\The witcher el viejo mundo"
git init
git add .
git commit -m "Publicar asistente de mesa"
git branch -M main
git remote add origin https://github.com/elexrallen/the-witcher-el-viejo-mundo-elex.git
git push -u origin main
```

> Las imágenes pesan ~210 MB. El primer `push` puede tardar varios minutos.

### 3. Activar GitHub Pages

En GitHub: **Settings → Pages → Build and deployment**

- **Source:** GitHub Actions

Al hacer push a `main`, el workflow `.github/workflows/deploy-pages.yml` publica automáticamente.

### 4. URL de la app

Si tu repo es `the-witcher-el-viejo-mundo`:

```
https://elexrallen.github.io/the-witcher-el-viejo-mundo-elex/
```

- Inicio: `.../index.html`
- Exploración: `.../exploracion.html`
- Eventos: `.../eventos.html`
- Automa: `.../automa/`

### 5. Añadir a la pantalla de inicio (móvil)

Abre la URL en el navegador del móvil → **Añadir a pantalla de inicio**.

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `app/` | Aplicación web (HTML, JS, CSS, JSON) |
| `app/automa/` | Automa compilado (React) |
| `automa/` | Código fuente del Automa |
| `data/images/` | Imágenes de cartas (fuente) |
| `scripts/` | Pipeline de datos y despliegue |

## Scripts útiles

| Script | Descripción |
|--------|-------------|
| `scripts/sync_images.py` | Copia `data/images` → `app/data/images` |
| `scripts/build_automa.py` | Compila el Automa con Vite |
| `scripts/prepare_pages.py` | Genera `_site/` para probar el despliegue local |

Probar el sitio como en GitHub Pages:

```powershell
py -3 scripts/prepare_pages.py
py -3 -m http.server 8080 --directory _site
```

Abre http://localhost:8080/
