# Inglés — app personal de aprendizaje integral

Aplicación personal (un solo usuario: Sebastián) para aprender inglés de Pre-A1 a C1,
con ampliación opcional a C2. Prioriza evidencia real de comprensión, producción e
interacción por encima de puntos, rachas o porcentajes de "contenido visto".

## Estado del proyecto

- **Etapa 1** — diseño verificable: ✅ completa (ver `docs/`).
- **Etapa 2** — recorrido funcional de una unidad: 🟡 en curso. Funciona de extremo a
  extremo en local: unidad completa, diagnóstico rápido, grabación de audio,
  portafolio, exportar/eliminar datos. Pendiente: diagnóstico completo (versión
  larga), auth real, banco de evaluación de nivel — ver `docs/06-roadmap.md`.
- Ver [`docs/06-roadmap.md`](docs/06-roadmap.md) para el plan completo por etapas y
  [`docs/decisions-log.md`](docs/decisions-log.md) para supuestos tomados y decisiones
  pendientes.

## Cómo correr en local

```bash
npm install
npm run db:migrate   # crea data/local.db (SQLite) con el esquema
npm run db:seed       # siembra la unidad de ejemplo "Nice to meet you"
npm run dev           # http://localhost:3000
```

Sin ninguna clave de API configurada, el tutor de IA usa un proveedor *mock* basado
en reglas, siempre etiquetado como tal en pantalla (nunca se presenta como una
evaluación de IA real). Ver `.env.example` y `docs/01-architecture.md`.

## Mapa de la documentación de diseño

| Documento | Contenido |
|---|---|
| [`docs/00-interpretation-and-scope.md`](docs/00-interpretation-and-scope.md) | Interpretación del encargo, alcance, qué mide la app y qué NO promete |
| [`docs/01-architecture.md`](docs/01-architecture.md) | Stack técnico, integraciones de IA, privacidad, offline/sync |
| [`docs/02-curriculum-matrix.md`](docs/02-curriculum-matrix.md) | Matriz curricular Pre-A1 → C1, estructura módulo/unidad, ejemplo de unidad completa |
| [`docs/03-progress-and-evaluation-model.md`](docs/03-progress-and-evaluation-model.md) | Fórmulas de progreso, umbrales de competencia, repetición espaciada, rúbricas |
| [`docs/04-data-model.md`](docs/04-data-model.md) | Modelo de datos y esquema SQL (`db/schema.sql`) |
| [`docs/05-screens-and-ux.md`](docs/05-screens-and-ux.md) | Pantallas, navegación, accesibilidad, idioma de apoyo |
| [`docs/06-roadmap.md`](docs/06-roadmap.md) | Etapas 1–6, dependencias, criterios de aceptación |
| [`docs/decisions-log.md`](docs/decisions-log.md) | Supuestos reversibles tomados y decisiones que sí requieren tu input |

## Cómo retomar el trabajo en una sesión nueva

Todo el estado de diseño vive en archivos de este repositorio, no en la conversación.
Para continuar: lee `docs/06-roadmap.md` (qué sigue) y `docs/decisions-log.md`
(qué está pendiente de decidir), y continúa desde ahí.
