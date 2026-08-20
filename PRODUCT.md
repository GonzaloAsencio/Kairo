# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript (SPA estática, PWA instalable). Datos: IndexedDB local como fuente de verdad + Supabase como destino de sincronización. Decidido en ADR-0001 y ADR-0002.

## Users

Jugador competitivo de un juego de estrategia por turnos (tipo TCG), adulto, que ya juega en torneos y practica en serio. Llegó al techo de "jugar más partidas": necesita otra palanca de mejora, no más volumen. Tiene el celular a mano apenas termina cada partida (juego físico) y también juega la versión digital en navegador de escritorio.

## Product Purpose

Kairo es un diario de decisiones post-partida. Después de cada partida, el jugador registra qué pensaba y sentía en el turno crítico — no qué jugó. La app cruza esos registros para mostrar el error que la memoria del jugador borra sola: el cerebro juzga las decisiones por el resultado, así que una decisión mala que ganó igual se archiva como decisión buena y el error se repite.

Éxito: 8 semanas de uso continuo por un usuario real, entradas cargadas el mismo día de la partida. Huecos de más de 3 días en la semana 4 son síntoma de fricción, no de falta de funciones.

Medición concreta en semana 4 y semana 8:
- Cero huecos de más de 3 días.
- Tiempo mediano de carga de una entrada ≤90 segundos, medido con cronómetro en el celular.
- Al menos un "punto ciego" identificado y revisado por el usuario.

Abandono (escrito en frío, para leer en caliente): se corta el proyecto si hacia la semana 4 se cumple cualquiera de estas.
- Huecos de más de 3 días de forma recurrente — el usuario no volvió solo.
- Tiempo mediano de carga sostenidamente por encima de 90 segundos.
- El usuario nunca abre Revisión: el valor prometido no se está pagando.
- El usuario deja de cargar sin que se lo pidan, y no lo extraña.

Si se corta, se exporta la data y se archiva el repo con un ADR de cierre. No se "pausa" indefinidamente.

## Positioning

No es un tracker de partidas: no calcula winrate, no analiza mazos, no importa replays — eso ya existe y no es el problema que resuelve. El mecanismo diferencial es la matriz decisión × resultado:

|                  | Ganó                    | Perdió                |
|------------------|--------------------------|------------------------|
| Decisión buena   | Funcionó el proceso      | Jugó bien y perdió     |
| Decisión mala    | **Punto ciego**          | Error castigado        |

La celda "punto ciego" (decisión mala que ganó igual) es el corazón del producto: es lo único que la app hace que el jugador no puede hacer solo, porque el winrate le da exactamente la señal contraria.

## Operating Context

Carga: inmediatamente después de cada partida, con el celular en la mano (juego físico) o en el navegador (juego digital), en contexto de torneo o práctica seria. Revisión: momento separado, sin presión de tiempo, donde el valor del producto se paga.

## Capabilities and Constraints

Principio rector: **entrada rápida y fea, salida lenta y valiosa**. Todo lo que agregue fricción a la carga se corta; todo lo que agregue valor a la revisión se permite.

Consecuencias de diseño (durables, no negociables sin revisar el principio):
- Carga de una entrada debe completarse en ≤90 segundos o el usuario abandona en ~3 semanas.
- Un solo campo de texto libre obligatorio por entrada (turno crítico); el resto son botones/tags.
- Sin onboarding, sin "completá tu perfil", sin campos opcionales que parezcan obligatorios.
- Resultado y atribución se anotan pero se muestran visualmente separados del resto de la entrada, a propósito (para no contaminar el juicio de calidad de decisión con el resultado).
- Sin parseo/importación de replays — el campo de replay es un link que el usuario abre externamente.
- **Offline es requisito duro, no un extra.** La carga ocurre en torneo, con el celular en la mano y posiblemente sin señal. Guardar una entrada nunca espera la red y nunca falla por ella: se escribe local y se sincroniza después. La app es una PWA instalable — además de habilitar el uso sin conexión, la instalación es lo que evita que Safari borre el almacenamiento local a los 7 días de inactividad.
- **Dos dispositivos, un usuario.** Celular para cargar en torneo, navegador de escritorio para revisar. La sincronización resuelve el cruce; los conflictos se resuelven por última escritura según `updatedAt` (ADR-0009).
- **Cuenta mínima.** Magic link por email: una pantalla, un campo, un botón. Sin contraseña, sin perfil, sin onboarding. Es el mínimo que la sincronización exige sin violar el principio de cero fricción.
- **Los datos viejos nunca se rompen.** Cada registro lleva su propia versión de esquema y las migraciones son funciones puras versionadas. Una migración publicada no se edita ni se borra jamás. Cada versión publicada suma un fixture al test que corre la cadena completa; si ese test está en rojo, no hay deploy (ADR-0004).
- **Export/import JSON completo.** Un archivo con sesiones, entradas y gatillos, versionado y autodescriptivo. Cumple tres funciones a la vez: backup del usuario, recuperación ante pérdida del dispositivo, y salida si el proyecto se abandona o Supabase desaparece (ADR-0008). Funciona sin conexión.
- **Privacidad.** Son notas sobre el estado mental de una persona. Un usuario ve únicamente sus propios datos, garantizado por RLS en todas las tablas. Sin analytics, sin telemetría, sin scripts de terceros, y el texto de la reflexión no se loguea en ningún nivel ni en ningún lado (ADR-0005).

Alcance V1 (4 pantallas):
1. **Sesión** — mantra y objetivo del día; se fija una vez y se cierra.
2. **Partida** — entrada post-partida: turno crítico, replay (link), emoción, información no usada, calidad de la decisión, etiquetas; y, separados visualmente, resultado y atribución.
3. **Revisión** — la matriz decisión × resultado, frecuencia de etiquetas (patrones repetidos), emoción cruzada con calidad de decisión, y el registro completo.
4. **Gatillos** — pregunta filtro, tres gatillos editables del usuario, cuatro preguntas de análisis.

Explícitamente fuera de alcance de V1: parseo/importación de replays, gráficos de tendencia en el tiempo, cualquier función social (compartir, comparar, ranking), recordatorios/notificaciones, registro de entrenamiento (goldfishing, VODs, sparring — candidato a V2 solo si V1 sobrevive 8 semanas de uso real), recuperación de cuenta más allá del magic link, cualquier rol administrativo o vista de datos ajenos, y edición colaborativa o resolución de conflictos campo por campo.

Las cuentas dejaron de estar fuera de alcance: la sincronización entre celular y escritorio las exige. Ver ADR-0002, que registra esa reversión y por qué.

## Brand Commitments

Nombre: Kairo.

## Evidence on Hand

Ninguna todavía — sin assets, mockups, ni identidad visual existente. Proyecto greenfield.

## Product Principles

1. Entrada rápida y fea, salida lenta y valiosa — este criterio manda sobre cualquier otra decisión de diseño.
2. La celda "punto ciego" (decisión mala, ganó igual) es el mecanismo central; nunca dejar que la matriz colapse en una vista de winrate plano.
3. Los campos son botones/tags salvo donde el texto libre es el punto (turno crítico).
4. Ninguna función se gana su lugar si agrega fricción a la carga; el valor solo se paga en la revisión.
5. Local-first: la escritura siempre se completa en el dispositivo. Supabase es destino de sincronización, nunca fuente de verdad en el momento de guardar. Si guardar puede fallar por red, el producto falla en el único escenario para el que existe.

## Glosario

- **Entrada** — un registro post-partida. Una entrada por partida.
- **Turno crítico** — el turno que el jugador identifica como decisivo. Uno solo por partida.
- **Punto ciego** — decisión que el jugador marcó como mala y que igual terminó en victoria.
- **Gatillo** — evento observable en la mesa que obliga al jugador a frenar y analizar.
- **Atribución** — a qué le adjudica el resultado: su plan, error del rival, o varianza.
