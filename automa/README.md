# Automa — Modo solitario

Compañero digital del **Automa V1.4** (modo solitario no oficial) para *The Witcher: El Viejo Mundo*.

## Desarrollo

```powershell
cd automa
npm install
npm run dev
```

Abre `http://localhost:3000` para desarrollo con recarga en caliente.

## Compilar para la app principal

Desde la raíz del proyecto:

```powershell
py -3 scripts/build_automa.py
```

La salida queda en `app/automa/` y se sirve junto al resto de la aplicación.

## Uso en partida

1. Arranca el servidor: `py -3 app/serve.py`
2. Abre `http://localhost:8080/app/`
3. En el hub, entra en **Automa** o usa el acceso directo en modo solitario.

Desde el Automa puedes volver a **Partida**, **Exploración** y **Eventos** con la barra de navegación superior o la pestaña **Tu partida**.

No requiere API de Gemini: toda la lógica corre en el navegador.
