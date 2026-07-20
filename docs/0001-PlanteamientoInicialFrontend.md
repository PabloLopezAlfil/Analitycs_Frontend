# 0001 — Planteamiento inicial (Frontend)

## 1. Propósito de la aplicación

Este proyecto es el **frontend** de la aplicación de **análisis de accesibilidad
de nivel AA sobre emails HTML**, cuyo backend está documentado en
`Back Analitycs/docs` (documentos 0001 a 0005).

El frontend permitirá al usuario:

1. **Autenticarse** en la aplicación.
2. **Subir emails** (HTML individual, ZIP simple o ZIP por lotes).
3. **Lanzar análisis** de accesibilidad sobre los emails subidos.
4. **Consultar los resultados**: score, checks por categoría, findings y
   recomendaciones (incluidas las validaciones por IA).

Este documento recoge el planteamiento inicial: stack, estructura, fases del
proyecto y próximos pasos.

---

## 2. Stack tecnológico

| Área | Tecnología |
|------|------------|
| Lenguaje | **TypeScript** |
| Librería UI | **React 19** |
| Bundler / dev server | **Vite** |
| Estado global | **Redux Toolkit** + React Redux |
| Enrutado | **React Router DOM** |
| Estilos | **Tailwind CSS** |
| Iconos | react-icons |

> Las dependencias ya están instaladas (`package.json`). Queda pendiente
> consolidar la configuración de TypeScript (crear `tsconfig.json` y migrar los
> archivos de arranque `main.jsx` / `vite.config.js` a TS).

---

## 3. Estado actual del proyecto

Estructura ya creada en `src/`:

```
src/
├── main.jsx                     (punto de entrada — pendiente de migrar a .tsx)
├── index.css                    (Tailwind)
├── store/
│   └── Store.ts                 (store de Redux Toolkit)
└── modules/
    ├── Home.tsx
    ├── Login/
    │   ├── Page/Login.tsx
    │   └── Interface/LoginInterface.tsx
    ├── Anlysis/
    │   ├── Features/            (AnalysisSlice.ts, AnalysisThunk.ts)
    │   ├── Interface/
    │   └── Pages/
    └── shared/
        └── Layaout/             (Navbar.tsx, MenuSide.tsx)
```

**Convención por módulo** (feature-based):

- `Pages/` → páginas/vistas del módulo.
- `Features/` → slice de Redux Toolkit + thunks (llamadas a la API).
- `Interface/` → tipos e interfaces TypeScript del módulo.
- `shared/` → componentes comunes (layout, navbar, menú lateral).

---

## 4. Integración con la API del backend

El backend expone una API REST protegida por **JWT** (`requireAuth`). Endpoints
que consumirá el front:

| Recurso | Endpoints | Doc backend |
|---------|-----------|-------------|
| Auth | `POST /auth/login`, `POST /auth/logout` | 0001 |
| Subidas | `POST /uploads`, `GET /uploads`, `GET /uploads/:id` | 0002 |
| Documentos HTML | `GET /html`, `GET /html/:id` | 0002 |
| Imágenes | `GET /images?html_id=:id`, `GET /images/:id` | 0002 |
| Análisis | `POST /analysis`, `GET /analysis?html_id=:id`, `GET /analysis/:id` | 0004 |

Conceptos del dominio que el front debe reflejar:

- **Tipos de subida**: `HTML`, `ZIP_SINGLE`, `ZIP_MULTIPLE`.
- **Estados de check**: `OK`, `ERROR`, `AVISO`, `VALIDADO_IA`,
  `REVISION_PENDIENTE` (cada uno con su tratamiento visual propio).
- **Categorías**: `STRUCTURE`, `IMAGES`, `TYPOGRAPHY`, `COLOR_CONTRAST`,
  `LINKS_BUTTONS`, `RESPONSIVE_CSS`.
- **Score** de 0–100 (puede ser `null` si no hay reglas puntuables).
- **Histórico**: un mismo email puede tener varios análisis → comparar evolución.

---

## 5. Fases del proyecto (Frontend)

Espejo de las fases del backend, adaptadas a la interfaz:

### Fase 1 — Base y autenticación
Configuración de TypeScript, router, store y layout general (Navbar + menú
lateral). Pantalla de **login** conectada a `POST /auth/login`, gestión del JWT
(almacenamiento y envío en cabeceras) y **rutas protegidas** (redirección a
login si no hay sesión). Logout.

### Fase 2 — Subida y gestión de archivos
Pantalla de **subida** con los tres tipos (`HTML`, `ZIP_SINGLE`,
`ZIP_MULTIPLE`) mediante `multipart/form-data`. **Listado de subidas** y
**detalle** de cada una con sus documentos HTML e imágenes (marcando las no
accesibles, `is_accesible`).

### Fase 3 — Análisis y resultados
Botón de **lanzar análisis** sobre un documento (`POST /analysis`). Vista de
**resultados**: score, checks agrupados por categoría con su estado y, para
cada check no `OK`, sus findings (`location` + `evidence`). **Histórico** de
análisis por documento para ver la evolución del score.

### Fase 4 — Resultados de IA
Presentación diferenciada de los checks `VALIDADO_IA`: nivel de confianza,
problema detectado y **recomendación** accionable. Los `REVISION_PENDIENTE` se
mostrarán como casos a revisar manualmente.

---

## 6. Resumen de próximos pasos (Fase 1)

- [ ] Crear `tsconfig.json` y migrar `main.jsx` → `main.tsx` y `vite.config.js` → `vite.config.ts`.
- [ ] Configurar **React Router** con la estructura de rutas inicial (login, home, subidas, análisis).
- [ ] Configurar el **store** de Redux Toolkit (registrar los slices por módulo).
- [ ] Implementar el **login** contra `POST /auth/login` (slice + thunk + persistencia del JWT).
- [ ] Implementar **rutas protegidas** y logout.
- [ ] Montar el **layout general** (Navbar + MenuSide) para las vistas autenticadas.
- [ ] Definir un **cliente HTTP** común (base URL por variable de entorno de Vite, cabecera `Authorization`).
