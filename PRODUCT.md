# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Undecided. Leaning React, not committed — resolve before scaffolding.

## Users

Jugador competitivo de un juego de estrategia por turnos (tipo TCG), adulto, que ya juega en torneos y practica en serio. Llegó al techo de "jugar más partidas": necesita otra palanca de mejora, no más volumen. Tiene el celular a mano apenas termina cada partida (juego físico) y también juega la versión digital en navegador de escritorio.

## Product Purpose

Kairo es un diario de decisiones post-partida. Después de cada partida, el jugador registra qué pensaba y sentía en el turno crítico — no qué jugó. La app cruza esos registros para mostrar el error que la memoria del jugador borra sola: el cerebro juzga las decisiones por el resultado, así que una decisión mala que ganó igual se archiva como decisión buena y el error se repite.

Éxito: 8 semanas de uso continuo por un usuario real, entradas cargadas el mismo día de la partida. Huecos de más de 3 días en la semana 4 son síntoma de fricción, no de falta de funciones.

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
- Datos solo locales en el dispositivo/navegador. Sin cuenta, sin sync entre dispositivos en V1.
- Sin parseo/importación de replays — el campo de replay es un link que el usuario abre externamente.

Alcance V1 (4 pantallas):
1. **Sesión** — mantra y objetivo del día; se fija una vez y se cierra.
2. **Partida** — entrada post-partida: turno crítico, replay (link), emoción, información no usada, calidad de la decisión, etiquetas; y, separados visualmente, resultado y atribución.
3. **Revisión** — la matriz decisión × resultado, frecuencia de etiquetas (patrones repetidos), emoción cruzada con calidad de decisión, y el registro completo.
4. **Gatillos** — pregunta filtro, tres gatillos editables del usuario, cuatro preguntas de análisis.

Explícitamente fuera de alcance de V1: parseo/importación de replays, gráficos de tendencia en el tiempo, cualquier función social (compartir, comparar, ranking), cuentas (salvo que sync lo exija — no lo exige en V1), recordatorios/notificaciones, registro de entrenamiento (goldfishing, VODs, sparring — candidato a V2 solo si V1 sobrevive 8 semanas de uso real).

## Brand Commitments

Nombre: Kairo.

## Evidence on Hand

Ninguna todavía — sin assets, mockups, ni identidad visual existente. Proyecto greenfield.

## Product Principles

1. Entrada rápida y fea, salida lenta y valiosa — este criterio manda sobre cualquier otra decisión de diseño.
2. La celda "punto ciego" (decisión mala, ganó igual) es el mecanismo central; nunca dejar que la matriz colapse en una vista de winrate plano.
3. Los campos son botones/tags salvo donde el texto libre es el punto (turno crítico).
4. Ninguna función se gana su lugar si agrega fricción a la carga; el valor solo se paga en la revisión.
5. Local-first, sin cuentas ni sync en V1 — coherente con el criterio de cero fricción.

## Glosario

- **Entrada** — un registro post-partida. Una entrada por partida.
- **Turno crítico** — el turno que el jugador identifica como decisivo. Uno solo por partida.
- **Punto ciego** — decisión que el jugador marcó como mala y que igual terminó en victoria.
- **Gatillo** — evento observable en la mesa que obliga al jugador a frenar y analizar.
- **Atribución** — a qué le adjudica el resultado: su plan, error del rival, o varianza.
