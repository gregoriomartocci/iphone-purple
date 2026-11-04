# Cómo mantener vivo el lector de WhatsApp

Qué gasta cupo y qué no, dónde queda guardada cada cosa, y qué hacer cuando
algo se rompe.

---

## Lo primero, porque cambia todo el resto

**Estar conectado no gasta nada. Vincular sí.**

WhatsApp limita cuántos dispositivos nuevos se vinculan a una cuenta en poco
tiempo. No limita cuánto tiempo queda conectado uno ya vinculado: una sesión
abierta puede durar meses recibiendo mensajes en tiempo real.

De ahí sale la única regla que importa:

> Vincular una vez. No soltar nunca.

La intuición contraria —conectarse cada tanto para "no abusar"— es
exactamente lo que agota el cupo. Cada reconexión desde cero es un intento de
vinculación.

### Qué nos bloqueó el 31/10

Unos diez intentos de vinculación en dos horas, entre códigos que vencían,
bugs del propio lector que borraban la sesión, y un proceso que quedó
pidiendo un QR nuevo cada veinte segundos sin que nadie lo mirara. WhatsApp
respondió "no se pueden vincular nuevos dispositivos en este momento", que se
levanta solo en unas horas.

Las tres causas están arregladas. La tercera vale repetirla porque es la menos
obvia: **un lector encendido y sin vincular pide vinculaciones solo.** Si no
se va a usar, se apaga.

---

## Se vincula por QR, y solo por QR

Baileys también sabe vincular por un código de ocho caracteres que se escribe
en el teléfono. Sobre el papel es mejor: el número se declara de antemano y
WhatsApp solo acepta el código en el teléfono de esa línea, así que vincular la
cuenta equivocada no puede pasar.

En la práctica no funcionó una sola vez. El código se aceptaba —en el log
aparecía `logging in...`— y WhatsApp cortaba con un 401 inmediatamente después,
en todos los intentos, con la versión candidata de Baileys y con la estable. El
QR enganchó a la primera.

Así que está sacado. No conviene mantener un camino que no funciona al lado de
uno que sí: ofrecerlos juntos además rompía el QR, porque al pedir un código
WhatsApp deja de aceptar el escaneo.

**La verificación de la línea no dependía de eso.** `WHATSAPP_NUMERO` sigue
comparando el número vinculado contra el del negocio apenas conecta, y si no
coincide el lector se desvincula solo. Esa protección es del momento de
conectar, no de cómo se vinculó.

---

## Las cuatro memorias

Nada depende de volver a preguntarle a WhatsApp, porque WhatsApp no reenvía
nada. Lo que no se guardó cuando pasó, se perdió.

| Dónde                          | Qué guarda                             | Cuánto dura         | Para qué                                     |
| ------------------------------ | -------------------------------------- | ------------------- | -------------------------------------------- |
| Memoria del lector             | Mensajes de los últimos `DIAS`         | Hasta que se poda   | Lo que el panel muestra                      |
| `mensajes-whatsapp.json`       | Lo mismo, en disco                     | Sobrevive reinicios | Que un deploy no deje la ventana en cero     |
| `historico-whatsapp.ndjson`    | **Todos** los mensajes, siempre        | Para siempre        | Recuperar una lista vieja, auditar un precio |
| `supplier_imports` en Supabase | El texto original de lo que se publicó | Para siempre        | Saber por qué un equipo quedó a ese precio   |

La ventana de memoria es chica a propósito: el proceso corre en la máquina más
barata que alcance, y meses de conversaciones en RAM la reinician sola.

El histórico es la red debajo de la poda. Se agrega al final y nunca se
reescribe, así que un corte a mitad de una escritura pierde un renglón y no el
archivo. Se lee por `/historico?desde=2026-10-01`, de a renglones.

---

## El día a día

1. El lector está siempre prendido y recibe las listas a medida que llegan.
2. Cuando quieras publicar, entrás a `/admin/whatsapp` y apretás
   **Armar el plan**. Eso lee de la memoria del lector, no de WhatsApp.
3. Mirás el plan y publicás.

No hay nada que hacer para "traer" los mensajes. Ya están.

---

## Qué hacer cuando

**El panel dice "El lector está apagado".** Apretá el botón de prenderlo. En
producción, revisá el servicio en Railway.

**El panel dice "no se encuentra".** La URL de `WHATSAPP_SERVIDOR_URL` no
resuelve. Suele ser que el servicio cambió de nombre.

**El panel dice "no contestó".** Railway duerme los servicios sin tráfico;
recargá en un minuto.

**WhatsApp dice que no se pueden vincular dispositivos.** Esperá. Horas, no
minutos. Cada intento estira el bloqueo.

El lector ya no puede empeorarlo solo: después de seis QR sin que nadie
escanee se pone en pausa y deja de pedir. El panel muestra un botón para
reanudar, y conviene apretarlo con el teléfono ya en la mano.

Esa pausa existe por una lección cara: el 31/10 quedó encendido y sin vincular
tres días y pidió 3247 vinculaciones, una cada veinte segundos. Baileys
abandona solo después de unos pocos intentos, pero nuestra reconexión lo
volvía a levantar, para siempre.

**La sesión se rompió pero el respaldo está.** El lector copia la carpeta de
sesión cada vez que la conexión abre, que es el momento en que se sabe que
esas credenciales sirven. Se repone con `/restaurar-sesion`. Es destructivo,
así que lo dispara una persona.

**Se vinculó la línea equivocada.** El lector se desvincula solo y borra lo
que haya leído, y el panel no muestra ni un mensaje. Es el único caso en que
borrar es la reparación.

---

## Lo que todavía puede perderse

Si el lector está caído más días que la ventana y nadie importa en ese rato,
esas listas no están en memoria. **Sí están en el histórico**, pero hoy
ninguna pantalla lo lee: hay que pedirlo por `/historico` a mano.

Es el siguiente agujero a tapar, y la forma es que el panel ofrezca importar
desde el histórico cuando detecte que estuvo caído.
