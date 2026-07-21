# 0003 — Motor de análisis y resultados (Frontend)

## 1. Propósito

Esta tercera fase del **frontend** implementa el disparo del **análisis de
accesibilidad** de un email y la **consulta de sus resultados**, consumiendo la
API del backend documentada en `Back Analitycs/docs/0004-MotorDeAnalisis.md`.

Siguiendo el planteamiento de [0001](0001-PlanteamientoInicialFrontend.md) y el
mismo enfoque **por capas** del [0002](0002-SubidaYGestionDeArchivos.md):
primero los **tipos**, luego los **thunks** (llamadas a la API) y después los
**slices** (estado en Redux Toolkit). Las páginas/componentes que lo consumen se
conectan después, una vez el estado esté listo.

> El objetivo de este documento es dejar acordada, antes de escribir código, la
> **estructura de carpetas**, los **nombres de thunks y slices** y el **uso** de
> cada uno, para poder revisarlo.

---

## 2. Alcance de la fase

| Incluye | No incluye (fases posteriores) |
|---------|-------------------------------|
| Lanzar un análisis sobre un documento HTML (`POST /analysis`). | Ejecutar/gestionar la validación por IA desde el front (el backend la resuelve; el front solo muestra el estado `VALIDADO_IA` / `REVISION_PENDIENTE`). |
| Listar los análisis y ver el detalle (checks + findings). | Edición/borrado de análisis (el backend guarda **histórico**; no hay update). |
| Reflejar en la UI el **score** (0–100) y el estado de cada criterio. | |
| Alimentar los componentes de resultados ya existentes (tabla de análisis, cola de revisión, errores frecuentes). | |

---

## 3. API del backend que consumimos

Todas las rutas van protegidas por **JWT** (`requireAuth`); el token lo añade
automáticamente `shared/api/apiClient.ts`.

| Método | Ruta | Uso |
|--------|------|-----|
| `POST` | `/analysis` | Body `{ htmlId }`. Lanza el análisis del documento y devuelve el resultado completo (score + checks + findings). |
| `GET` | `/analysis?html_id=:id` | Listado resumido de análisis (histórico). Filtrable por documento. |
| `GET` | `/analysis/:id` | Detalle de un análisis: score + todos los checks con sus findings. |

**Estados de un check** (`status`): `OK`, `ERROR`, `AVISO`, `VALIDADO_IA`,
`REVISION_PENDIENTE`.

**Categorías** (`category`): `STRUCTURE`, `IMAGES`, `TYPOGRAPHY`,
`COLOR_CONTRAST`, `LINKS_BUTTONS`, `RESPONSIVE_CSS`.

> **A confirmar contra la API real** al implementar:
> - **Disponibilidad de los `GET`**: en el backend, `POST /analysis` ya está
>   operativo; los `GET /analysis` y `GET /analysis/:id` corresponden a un
>   incremento posterior (0004 §11, incremento 6). Los thunks se dejan escritos,
>   pero la lista/detalle solo funcionarán cuando esos endpoints estén live.
> - **Casing** de los campos de respuesta: el backend expone `htmlId`, `score`,
>   `createdAt` en camelCase (`created_at` se serializa a `createdAt`). Mantener
>   la interfaz alineada con lo que devuelve realmente la API.

---

## 4. Estructura de carpetas

Módulo `Analysis`, con la misma convención que `Uploads`/`Login` (`Features` =
slice + thunk, `Interface` = tipos, `Pages` = vistas):

```
src/modules/Analysis/
├── Interface/
│   └── AnalysisInterface.ts     (tipos: Analysis, AnalysisDetail, AnalysisCheck, AnalysisFinding, estados…)
├── Features/
│   ├── AnalysisThunk.ts         (llamadas a /analysis)
│   └── AnalysisSlice.ts         (estado de análisis)
└── Pages/
    └── AnalysisDetailPage.tsx   (resultado de un análisis; se conecta después)
```

> **Nota / decisión**: la carpeta actual está como `src/modules/Anlysis/`
> (errata) y contiene `AnalysisThunk.ts` y `AnalysisSlice.ts` **vacíos**.
> Propongo **renombrarla a `Analysis`** para mantener la coherencia con el resto
> de módulos antes de empezar. El resto del documento asume `Analysis`.

Apoyos en `shared/` que ya existen y se reutilizan:

- `shared/api/apiClient.ts` — `apiFetch` (base URL, `Authorization`, errores).
- `shared/types/request.ts` — `RequestStatus` (`idle | pending | fulfilled | rejected`).
- `shared/componets/` — componentes de resultados ya presentes que consumirán
  este estado: `TableAnalysis.tsx`, `ReviewQueue.tsx`, `FrequentErrors.tsx`.

---

## 5. Modelo de datos (Interface/AnalysisInterface.ts)

Espejo del agregado del backend (fase 0004). Se distingue **resumen** (listado)
de **detalle** (incluye `checks` con sus `findings`):

```ts
export type CheckStatus =
  | "OK"
  | "ERROR"
  | "AVISO"
  | "VALIDADO_IA"
  | "REVISION_PENDIENTE";

export type CheckCategory =
  | "STRUCTURE"
  | "IMAGES"
  | "TYPOGRAPHY"
  | "COLOR_CONTRAST"
  | "LINKS_BUTTONS"
  | "RESPONSIVE_CSS";

export interface AnalysisFinding {   // ocurrencia concreta de un problema
  id: number;
  location: string;
  evidence: string;
}

export interface AnalysisCheck {     // resultado de una regla evaluada
  id: number;
  rule: string;                      // p. ej. "IMG_NO_ALT"
  category: CheckCategory;
  status: CheckStatus;
  message: string;
  findings: AnalysisFinding[];
}

export interface Analysis {          // GET /analysis (resumen)
  id: number;
  htmlId: number;
  score: number | null;              // 0–100; null si nada fue puntuable
  createdAt: string;
}

export interface AnalysisDetail extends Analysis {   // POST /analysis · GET /analysis/:id
  checks: AnalysisCheck[];
}
```

---

## 6. Thunks (AnalysisThunk.ts)

Creados con `createAsyncThunk`, siguiendo el patrón de `UploadsThunk` (helper
`toMessage`, `{ rejectValue: string }`).

| Thunk | Acción | Endpoint | Uso |
|-------|--------|----------|-----|
| `runAnalysis` | `analysis/run` | `POST /analysis` | Lanza el análisis de un documento (`{ htmlId }`) y devuelve el resultado completo. Es la acción principal de la fase. |
| `fetchAnalyses` | `analysis/fetchAll` | `GET /analysis?html_id=:id` | Listado (histórico) de análisis. Acepta un `htmlId` opcional para filtrar por documento. |
| `fetchAnalysisById` | `analysis/fetchById` | `GET /analysis/:id` | Detalle de un análisis concreto (para reabrir un resultado del histórico). |

> `runAnalysis` recibe `htmlId` (el documento a analizar, obtenido del detalle
> del upload/HTML de la fase 0002). `fetchAnalyses` recibe un `htmlId?`
> opcional.

---

## 7. Slice (AnalysisSlice.ts) — `name: "analysis"`

Un único slice para el recurso, con la forma `{ …datos, status, error }` común,
separando los estados de **lanzar**, **listar** y **detalle**:

| Campo del estado | Tipo | Uso |
|------------------|------|-----|
| `items` | `Analysis[]` | Resultado de `fetchAnalyses` (histórico/listado). |
| `current` | `AnalysisDetail \| null` | Análisis abierto: lo dejan `runAnalysis` (recién lanzado) y `fetchAnalysisById`. |
| `runStatus` | `RequestStatus` | Estado del análisis en curso (`runAnalysis`): habilita spinner, deshabilita el botón "Analizar". |
| `listStatus` | `RequestStatus` | Estado de la carga del listado. |
| `detailStatus` | `RequestStatus` | Estado de la carga del detalle. |
| `error` | `string \| undefined` | Último error legible. |

Al completar `runAnalysis`, el resultado se coloca en `current` y se inserta al
principio de `items` (aparece en el histórico sin recargar), igual que hace
`uploadFile` en `UploadsSlice`.

Selectores previstos: `selectAnalyses`, `selectCurrentAnalysis`,
`selectAnalysisRunStatus`, `selectAnalysisError`. Además, **selectores
derivados** para alimentar los componentes de resultados sin recalcular en cada
render:

- `selectChecksByCategory` — agrupa los checks de `current` por `category`.
- `selectReviewQueue` — checks con `status === "REVISION_PENDIENTE"`.
- `selectErrors` — checks con `status === "ERROR"`.

**Registro en el store** (`src/store/Store.ts`):

```ts
reducer: {
  auth: authReducer,
  uploads: uploadsReducer,
  htmlDocuments: htmlDocumentsReducer,
  images: imagesReducer,
  analysis: analysisReducer,   // nuevo
}
```

---

## 8. Relación con los componentes de resultados

Los componentes de `shared/componets/` ya presentes se conectarán a este estado
(después de tener slice/thunks):

| Componente | Consume | De |
|------------|---------|-----|
| Score/gauge | `current.score` | `selectCurrentAnalysis` |
| `TableAnalysis` | `current.checks` agrupados por categoría/estado | `selectChecksByCategory` |
| `ReviewQueue` | checks `REVISION_PENDIENTE` (lo que la IA o las reglas no pudieron confirmar) | `selectReviewQueue` |
| `FrequentErrors` | checks `ERROR` (incumplimientos claros) | `selectErrors` |

El `evidence`/`location` de cada `finding` permite señalar en la UI **dónde**
está cada problema dentro del email.

---

## 9. Resumen de próximos pasos

- [ ] Renombrar `src/modules/Anlysis/` → `src/modules/Analysis/` y mover los stubs.
- [ ] Definir los tipos del dominio en `Analysis/Interface/AnalysisInterface.ts`.
- [ ] Implementar `AnalysisThunk` (`runAnalysis`, `fetchAnalyses`, `fetchAnalysisById`).
- [ ] Implementar `AnalysisSlice` (estado + selectores derivados) y registrarlo en el store.
- [ ] Confirmar contra la API: disponibilidad de los `GET /analysis` y casing de los campos.
- [ ] (Después) Construir `AnalysisDetailPage` y conectar `TableAnalysis` / `ReviewQueue` / `FrequentErrors` al estado.
