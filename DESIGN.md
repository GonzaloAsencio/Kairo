---
name: Kairo
description: Diario de decisiones para jugadores de estrategia por turnos — proceso ≠ resultado.
colors:
  bg: "#0a0a09"
  bg-raised: "#121210"
  ink: "#f2f0ea"
  ink-dim: "#9a978d"
  ink-faint: "#57554d"
  accent: "#f4a623"
  accent-ink: "#1a1206"
  line: "#2a2926"
  line-strong: "#43413a"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.6rem, 11vw, 3.6rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.12em"
rounded:
  base: "3px"
spacing:
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "15px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "8px 13px"
  chip-selected:
    backgroundColor: "rgba(244,166,35,0.08)"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "8px 13px"
  input-field:
    backgroundColor: "{colors.bg-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "11px 12px"
---

# Design System: Kairo

## Overview

**Creative North Star: "El Sello de Catálogo"**

Kairo se lee como una ficha de catálogo industrial (mundo Factory Records / Saville), no como una tarjeta de hábito ni una planilla. Cada partida es un número de entrada sobre negro mate absorbente, con un único acento ámbar reservado para el momento que el producto existe para señalar: el punto ciego. El resultado y la atribución entran "codificados" — una tira sin decodificar — y solo se destapan después de que el proceso ya fue juzgado, traduciendo el principio "proceso ≠ resultado" al comportamiento de la interfaz, no solo al layout.

El sistema rechaza dos categorías a propósito: la app de hábitos gamificada (streaks, chips de colores alegres, tarjetas redondeadas con sombra) y la planilla burocrática genérica. En su lugar: reglas finas en vez de cajas, un grotesk a escala de póster para el único número que importa por pantalla, y monoespaciado de sistema para todo lo demás — controles, etiquetas, datos.

**Key Characteristics:**
- Negro mate absorbente como terreno; nunca blanco puro ni gris neutro plano.
- Un acento ámbar, usado con extrema disciplina — nunca un segundo color de estado.
- Sin tarjetas, sin sombras: la separación es siempre una regla de 1px.
- El resultado de la partida se revela, no se muestra de entrada.

## Colors

Paleta restringida: negro mate, tinta hueso, un ámbar de señal. Ningún color de estado adicional (nada de rojo/verde tipo semáforo).

### Primary
- **Ámbar de Señal** (`#f4a623`): el único acento del sistema. Reservado para: la celda de "punto ciego" en la matriz de Revisión, el CTA principal (Guardar Partida), el estado activo de navegación, el foco de teclado, y el momento de "destapar" resultado+atribución. Si aparece en más de un lugar a la vez en una misma pantalla sin relación entre sí, algo se rompió.

### Neutral
- **Negro Mate** (`#0a0a09`): fondo base de toda la app.
- **Negro Elevado** (`#121210`): fondo de inputs y superficies ligeramente levantadas — la única forma de "elevación" que existe.
- **Hueso** (`#f2f0ea`): texto principal, títulos, número de entrada.
- **Gris Cálido** (`#9a978d`): texto secundario, meta-información (fecha, hora), etiquetas de campo.
- **Gris Apagado** (`#57554d`): placeholders, texto terciario, elementos casi-invisibles.
- **Línea** (`#2a2926`): divisores estructurales entre campos.
- **Línea Fuerte** (`#43413a`): bordes de inputs, chips y controles sin foco.

### Named Rules
**The One Amber Rule.** El acento ámbar aparece en como máximo una función a la vez por pantalla. Nunca se usa como segundo o tercer color decorativo, y nunca se combina con rojo o verde para crear un sistema semafórico — eso es gamificación, y el producto existe para rechazarla.

## Typography

**Display Font:** Archivo (900), con system-ui como fallback
**Body Font:** system-ui / -apple-system / Segoe UI / Roboto (pila de sistema, sin webfont dedicada)
**Label/Mono Font:** JetBrains Mono, con ui-monospace/SFMono-Regular/Menlo/Consolas como fallback

**Character:** Un grotesk geométrico de peso extremo (900) solo para el número de entrada — el único momento "de titular" en toda la app — contra una pila de sistema discreta para el cuerpo y un monoespaciado técnico para todo lo que es dato, control o etiqueta. La jerarquía es de peso y registro, no de tamaño acumulado.

### Hierarchy
- **Display** (900, `clamp(2.6rem, 11vw, 3.6rem)`, line-height 0.92): el número de entrada (`Nº047`). Aparece una sola vez por pantalla.
- **Label** (500, 11px, letter-spacing 0.12em, mayúsculas): etiquetas de campo, meta de entrada, nav, chips, botones. Es la voz dominante de la interfaz.
- **Body** (400, 15px, line-height 1.5): el único campo de texto libre (reflexión post-partida) y los hints de ayuda.
- **Data** (JetBrains Mono, tabular-nums): turno crítico, fechas, números de catálogo.

### Named Rules
**The Mono-for-Measurement Rule.** El monoespaciado se usa solo para lo que es dato, control o medición (números, etiquetas, botones) — nunca como disfraz decorativo de "tecnológico" sobre prosa.

## Layout

Columna única mobile-first, ancho máximo de contenido 460px, centrada. Cada campo es una sección de ancho completo separada por una regla de 1px (`--line`), nunca por una tarjeta. Densidad generosa: 20px de padding vertical por campo, más espacio arriba de cada etiqueta que abajo.

En escritorio (≥920px) se agrega un riel de catálogo a la izquierda (navegación por código de una letra: S/P/R/G) y una columna de "registro reciente" a la derecha; el contenido central mantiene su ancho de columna móvil sin estirarse.

## Elevation & Depth

Sistema plano por completo. No hay sombras en ningún componente. La profundidad se comunica solo con el salto de valor entre `--bg` (fondo) y `--bg-raised` (inputs) más el peso del borde (`--line` vs `--line-strong`).

### Named Rules
**The No-Shadow Rule.** Ningún componente usa `box-shadow`. Si algo necesita separarse del fondo, sube un paso de valor tonal o gana un borde de 1px — nunca una sombra.

## Shapes

Radio único de 3px en toda la interfaz — deliberadamente casi recto, nunca "amigable" ni tipo pill. Bordes de 1px como el lenguaje de separación primario. Sin recortes ni máscaras geométricas.

## Components

### Buttons
- **Shape:** radio 3px.
- **Primary (Guardar Partida):** fondo `#f4a623`, texto `#1a1206`, mono 600 13px, letter-spacing 0.14em, padding 15px, ancho completo, fijo al pie de pantalla.
- **Hover/Focus:** `filter: brightness(1.08)` en hover; anillo de foco `2px solid var(--accent)` con `outline-offset: 2px`.
- **Ghost (chips no seleccionados):** transparente, borde 1px `--line-strong`, texto `--ink-dim`.

### Chips
- **Style:** transparente, borde 1px `--line-strong`, texto `--ink-dim`, mono 12.5px, radio 3px.
- **State (selected):** borde y texto `--accent`, fondo `rgba(244,166,35,0.08)`.
- **State (add):** borde punteado, texto `--ink-faint` — usado solo para "agregar etiqueta".

### Inputs / Fields
- **Style:** fondo `--bg-raised`, borde 1px `--line-strong`, radio 3px, padding 11px 12px.
- **Focus:** el borde pasa a `--accent`, sin glow ni sombra.
- **Números:** siempre en JetBrains Mono con `font-variant-numeric: tabular-nums`.

### Navigation
- **Mobile:** pestañas fijas arriba, mono 11px, código de una letra sobre el nombre, activa marcada con `--accent` y borde inferior 2px.
- **Desktop:** riel vertical a la izquierda con los mismos códigos de una letra, sin iconos.

### Sello Codificado (componente de firma)
El resultado y la atribución de la partida no se muestran de entrada: aparecen como una tira de bloques sin decodificar (`--line-strong`) detrás de un botón "DESTAPAR". Al abrir (`<details>` nativo), el primer bloque de la tira pasa a `--accent` y el contenido real (Ganó/Perdió, Atribución) se revela debajo. Es la única animación con intención de todo el sistema — el resto de la interfaz no se mueve.

## Do's and Don'ts

### Do:
- **Do** reservar el ámbar (`#f4a623`) para una sola función a la vez por pantalla — la Regla del Ámbar Único.
- **Do** separar contenido con reglas de 1px (`--line` / `--line-strong`), nunca con tarjetas ni sombras.
- **Do** usar JetBrains Mono para todo lo que sea dato, control o etiqueta; Archivo 900 solo para el número de entrada.
- **Do** mantener el radio en 3px en todos los componentes, sin excepción.
- **Do** ocultar resultado y atribución detrás de una revelación explícita, nunca mostrarlos junto al resto de la entrada.

### Don't:
- **Don't** agregar un segundo color de acento ni un sistema semafórico rojo/verde — es gamificación, y el producto existe para rechazarla.
- **Don't** usar tarjetas redondeadas, sombras suaves ni glass/blur decorativo.
- **Don't** usar emoji o glifos Unicode como iconos; si hace falta un ícono, se dibuja en SVG con el mismo trazo fino del sistema.
- **Don't** usar una tipografía de display distinta a Archivo 900 para títulos — no mezclar voces de titular.
- **Don't** mostrar el resultado de la partida en el mismo golpe de vista que el proceso; siempre detrás de la regla dura y la revelación.
