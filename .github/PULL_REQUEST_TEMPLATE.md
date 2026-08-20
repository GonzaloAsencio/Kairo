Closes #

## Tipo de PR

- [ ] Bug fix (`type:bug`)
- [ ] Nueva feature (`type:feature`)
- [ ] Solo documentación (`type:docs`)
- [ ] Refactor (`type:refactor`)
- [ ] Mantenimiento/tooling (`type:chore`)
- [ ] Breaking change (`type:breaking-change`)

## Módulo

<!-- match | session | review | triggers | core/infra/ui | app | tooling -->

## Resumen

-

## Cambios

| Archivo | Cambio |
|---------|--------|
|         |        |

## Alcance

- [ ] Todos los archivos tocados están dentro del **Alcance por archivo** declarado en el issue
- [ ] Diff dentro del presupuesto: **≤400 líneas, ≤10 archivos** — o tiene label `size:exception` justificado abajo
- [ ] Sin imports entre módulos (`modules/A` → `modules/B`)
- [ ] Sin imports de `modules/*` a `infra/*` (se pasa por `core/ports`)

<!-- Si toca core/, infra/ o ui/primitives: es territorio compartido y necesita revisión de los DOS. -->

## Test Plan

- [ ] Tests escritos al nivel declarado en el issue
- [ ] `npm run typecheck && npm run lint && npm run test:unit && npm run build` en verde local
- [ ] Probado manualmente el flujo afectado en el preview de Vercel
- [ ] Sin errores en consola/build

<!-- Si el cambio afecta la carga de una entrada: ¿sigue entrando en 90 segundos? -->

## Checklist

- [ ] Linkeé un issue con `status:approved`
- [ ] Agregué exactamente un label `type:*`
- [ ] Conventional commits
- [ ] Sin `Co-Authored-By` en los commits
- [ ] Actualicé docs si el comportamiento cambió
- [ ] Escribí o actualicé un ADR si cambió una decisión de arquitectura
- [ ] **No voy a mergear esto yo** — lo revisa y mergea la otra persona
