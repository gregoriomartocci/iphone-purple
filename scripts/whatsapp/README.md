# Lector de WhatsApp

Lee los mensajes de los proveedores desde la línea del negocio y se los deja
al panel. Es de **solo lectura**: nunca manda mensajes, nunca marca como
leído, nunca se pone en línea.

## A mano, cuando lo necesites

```
npm run whatsapp          # últimos 2 días
npm run whatsapp -- 3     # últimos 3 días
```

La primera vez pide escanear un QR. Después queda vinculado en
`.whatsapp-auth/` — no lo borres ni lo subas al repo, es la sesión.

## Siempre prendido

Es `scripts/whatsapp/servidor.mjs`: la misma lectura, pero como servicio que
queda escuchando y el panel consulta por HTTP en vez de correr un comando cada
vez.

**No va en Vercel.** Vercel apaga las funciones entre pedido y pedido; esto
necesita una conexión de WhatsApp abierta todo el tiempo, con la sesión guardada
en disco entre reinicios. Hace falta un servicio aparte con disco persistente.

### Desplegarlo en Railway (recomendado, ~5 USD/mes)

1. `railway login` y `railway init` en este repo, o desde railway.app → New
   Project → Deploy from GitHub → este repo.
2. Con el `Dockerfile.whatsapp` en la raíz, indicale a Railway que lo use como
   Dockerfile del servicio (Settings → Build → Dockerfile Path).
3. Variables de entorno del servicio:
   - `TOKEN_WHATSAPP` — inventá una clave larga. Es la que el panel manda para
     poder leer `/mensajes`; sin ella cualquiera con la URL vería las listas
     de tus proveedores.
   - `DIAS` — cuántos días de mensajes conservar (por defecto 3).
4. Agregale un **Volume** montado en `/datos`. Ahí vive la sesión vinculada;
   sin volumen, cada redeploy te pide escanear el QR de nuevo.
5. Deployá y mirá los logs: ahí aparece el QR la primera vez. Escaneálo desde
   WhatsApp de la línea del negocio → Dispositivos vinculados.
6. Guardá la URL pública que te da Railway (`https://algo.up.railway.app`) y
   la clave: van en el panel (`WHATSAPP_SERVIDOR_URL` y
   `WHATSAPP_SERVIDOR_TOKEN` en las variables de entorno de Vercel) para que
   `/admin/importar` pueda pedirle los mensajes.

### Verificar que está vivo

```
curl https://tu-servicio.up.railway.app/salud
```

Sin token: dice si está conectado y cuántos chats tiene. No expone ningún
mensaje.

### Costo real

Un servicio Node chico en Railway ronda 5 USD/mes con uso continuo. Fly.io
tiene una capa gratuita más generosa si el tráfico es bajo, con el mismo
Dockerfile.
