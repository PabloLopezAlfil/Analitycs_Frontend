# 0002 — Subida y gestión de archivos (Frontend)

## 1. Propósito

Esta segunda fase del **frontend** implementa la **subida de emails** (HTML, ZIP
simple o ZIP por lotes) y la **gestión/consulta** de los archivos ya subidos,
consumiendo la API del backend documentada en
`Back Analitycs/docs/0002-SubidaDeArchivos.md`.

Siguiendo el planteamiento de [0001](0001-PlanteamientoInicialFrontend.md), esta
fase se aborda **por capas**: primero los **tipos**, luego los **thunks** (las
llamadas a la API) y después los **slices** (el estado en Redux Toolkit). Las
**páginas** que lo consumen se conectarán después, una vez el estado esté listo.

> El objetivo de este documento es dejar acordada, antes de escribir código, la
> **estructura de carpetas**, los **nombres de thunks y slices** y el **uso** de
> cada uno, para poder revisarlo.

---

## 2. Alcance de la fase

| Incluye | No incluye (fases posteriores) |
|---------|-------------------------------|
| Subir un archivo (`POST /uploads`) con `multipart/form-data`. | Ejecutar análisis (`/analysis` → fase 3). |
| Listar y ver el detalle de las subidas. | Validación por IA (fase 4). |
| Consultar los documentos HTML y sus imágenes. | Edición/borrado de archivos (el backend los trata como **inmutables**: solo lectura salvo la creación). |
| Reflejar en la UI los tipos de subida y el estado `is_accesible` de las imágenes. | |

---

## 3. API del backend que consumimos

Todas las rutas van protegidas por **JWT** (`requireAuth`); el token ya lo añade
automáticamente el cliente HTTP (`shared/api/apiClient.ts`).

| Método | Ruta | Uso |
|--------|------|-----|
| `POST` | `/uploads` | Subir un archivo (HTML o ZIP). El backend detecta el tipo, procesa y persiste. |
| `GET` | `/uploads` | Listado resumido de subidas. |
| `GET` | `/uploads/:id` | Detalle de una subida, con sus `htmlDocuments` e `images`. |
| `GET` | `/html` | Listado resumido de documentos HTML (sin `content` ni `images`). |
| `GET` | `/html/:id` | Detalle de un documento: campos + `content` + `images`. |
| `GET` | `/images?html_id=:id` | Imágenes asociadas a un documento HTML. |
| `GET` | `/images/:id` | Detalle de una imagen. |

**Tipos de subida** (campo `type`): `HTML`, `ZIP_SINGLE`, `ZIP_MULTIPLE`.

> **A confirmar contra la API real** al implementar: (a) el **nombre del campo**
> del `FormData` que espera `formidable` (previsiblemente `file`); (b) el
> **casing** exacto de los campos de respuesta (Prisma expone `originalName`,
> `relativePath`, `isAccesible` en camelCase y `created_at` en snake_case).

---

## 4. Estructura de carpetas

Nuevo módulo `Uploads`, siguiendo la convención ya usada en `Login`
(`Features` = slice + thunk, `Interface` = tipos, `Pages` = vistas):

```
src/modules/Uploads/
├── Interface/
│   └── UploadsInterface.ts      (tipos del dominio: Upload, HtmlDocument, Image…)
├── Features/
│   ├── UploadsThunk.ts          (llamadas a /uploads)
│   ├── UploadsSlice.ts          (estado de subidas)
│   ├── HtmlDocumentsThunk.ts    (llamadas a /html)
│   ├── HtmlDocumentsSlice.ts    (estado de documentos HTML)
│   ├── ImagesThunk.ts           (llamadas a /images)
│   └── ImagesSlice.ts           (estado de imágenes)
└── Pages/
    ├── UploadsListPage.tsx      (listado de subidas + acceso a subir)
    ├── UploadPage.tsx           (formulario/zona de subida → POST /uploads)
    └── UploadDetailPage.tsx     (detalle de una subida: documentos e imágenes)
```

Apoyos en `shared/` que ya existen y se reutilizan:

- `shared/api/apiClient.ts` — `apiFetch` (base URL, `Authorization`, manejo de
  errores; ya **no** fija `Content-Type` cuando el body es `FormData`).
- Se añadirá un tipo compartido `RequestStatus = "idle" | "pending" |
  "fulfilled" | "rejected"` (en `shared/types/`) reutilizable por todos los
  slices (hoy está inline en `AuthSlice`).

---

## 5. Modelo de datos (Interface/UploadsInterface.ts)

Espejo de los modelos del backend (fase 0002). Se distingue **resumen** (listados)
de **detalle** (incluye relaciones):

```ts
export type UploadType = "HTML" | "ZIP_SINGLE" | "ZIP_MULTIPLE";

export interface Upload {          // GET /uploads (resumen)
  id: number;
  type: UploadType;
  originalName: string;
  created_at: string;
}

export interface UploadDetail extends Upload {   // GET /uploads/:id
  htmlDocuments: HtmlDocument[];
}

export interface HtmlDocument {    // GET /html (resumen)
  id: number;
  uploadId: number;
  name: string;
  relativePath: string | null;
  created_at: string;
}

export interface HtmlDocumentDetail extends HtmlDocument {  // GET /html/:id
  content: string;
  images: Image[];
}

export interface Image {           // GET /images
  id: number;
  htmlId: number;
  originalName: string;
  url: string;
  relativePath: string | null;
  mimeType: string | null;
  isAccesible: boolean;
  created_at: string;
}
```

---

## 6. Thunks

Creados con `createAsyncThunk`, siguiendo el patrón de `AuthThunk`. El prefijo
de la acción identifica el recurso.

### 6.1 UploadsThunk.ts

| Thunk | Acción | Endpoint | Uso |
|-------|--------|----------|-----|
| `uploadFile` | `uploads/uploadFile` | `POST /uploads` | Sube un archivo (HTML/ZIP) enviando `FormData`. Devuelve la subida creada (con sus documentos/imágenes ya procesados). |
| `fetchUploads` | `uploads/fetchUploads` | `GET /uploads` | Recupera el **listado** resumido de subidas para la vista de lista. |
| `fetchUploadById` | `uploads/fetchUploadById` | `GET /uploads/:id` | Recupera el **detalle** de una subida (documentos + imágenes) para la vista de detalle. |

### 6.2 HtmlDocumentsThunk.ts

| Thunk | Acción | Endpoint | Uso |
|-------|--------|----------|-----|
| `fetchHtmlDocuments` | `htmlDocuments/fetchAll` | `GET /html` | Listado resumido de todos los documentos HTML (sin `content`). |
| `fetchHtmlDocumentById` | `htmlDocuments/fetchById` | `GET /html/:id` | Detalle de un documento: `content` + imágenes asociadas (base para la vista previa del email y para lanzar el análisis en la fase 3). |

### 6.3 ImagesThunk.ts

| Thunk | Acción | Endpoint | Uso |
|-------|--------|----------|-----|
| `fetchImages` | `images/fetchAll` | `GET /images?html_id=:id` | Imágenes de un documento, cuando se necesiten por separado del detalle del HTML. |
| `fetchImageById` | `images/fetchById` | `GET /images/:id` | Detalle de una imagen concreta. |

> Las imágenes de un documento llegan **también** dentro de `GET /html/:id`, por
> lo que `ImagesThunk`/`ImagesSlice` son **secundarios**: se implementan por
> completitud con la API, pero la UI habitual las consumirá vía el detalle del
> documento.

---

## 7. Slices

Un slice por recurso, cada uno registrado en el store. Todos comparten la forma
`{ …datos, status, error }` (con `RequestStatus`), separando el estado de las
operaciones de **lista**, **detalle** y **subida** donde convenga.

### 7.1 UploadsSlice.ts — `name: "uploads"`

| Campo del estado | Tipo | Uso |
|------------------|------|-----|
| `items` | `Upload[]` | Resultado de `fetchUploads` (listado). |
| `current` | `UploadDetail \| null` | Resultado de `fetchUploadById` (detalle abierto). |
| `listStatus` | `RequestStatus` | Estado de la carga del listado. |
| `detailStatus` | `RequestStatus` | Estado de la carga del detalle. |
| `uploadStatus` | `RequestStatus` | Estado de la **subida en curso** (`uploadFile`): habilita spinners, deshabilitar el botón, etc. |
| `error` | `string \| undefined` | Último error legible. |

Selectores previstos: `selectUploads`, `selectCurrentUpload`, `selectUploadStatus`.

### 7.2 HtmlDocumentsSlice.ts — `name: "htmlDocuments"`

| Campo | Tipo | Uso |
|-------|------|-----|
| `items` | `HtmlDocument[]` | Listado (`fetchHtmlDocuments`). |
| `current` | `HtmlDocumentDetail \| null` | Detalle con `content` + imágenes (`fetchHtmlDocumentById`). |
| `listStatus` / `detailStatus` | `RequestStatus` | Estados de carga. |
| `error` | `string \| undefined` | Último error. |

### 7.3 ImagesSlice.ts — `name: "images"`

| Campo | Tipo | Uso |
|-------|------|-----|
| `items` | `Image[]` | Imágenes de un documento (`fetchImages`). |
| `current` | `Image \| null` | Imagen concreta (`fetchImageById`). |
| `status` | `RequestStatus` | Estado de carga. |
| `error` | `string \| undefined` | Último error. |

**Registro en el store** (`src/store/Store.ts`):

```ts
reducer: {
  auth: authReducer,
  uploads: uploadsReducer,
  htmlDocuments: htmlDocumentsReducer,
  images: imagesReducer,
}
```

---

## 8. Subida de archivos (multipart)

`uploadFile` construye un `FormData` con el archivo y lo envía con
`apiFetch("/uploads", { method: "POST", body: formData })`. El cliente ya
detecta el `FormData` y **no** fuerza `Content-Type` (deja que el navegador ponga
el `boundary`). El **nombre del campo** debe coincidir con el que espera el
backend (a confirmar; previsiblemente `file`).

No se validará el tipo en el cliente más allá de la extensión (`.html`, `.htm`,
`.zip`): la **detección real del tipo** (`HTML` / `ZIP_SINGLE` / `ZIP_MULTIPLE`)
la hace el backend.

---

## 9. Páginas y flujo (se conectan después)

| Ruta | Página | Thunks que usa |
|------|--------|----------------|
| `/uploads` | `UploadsListPage` | `fetchUploads` |
| `/uploads/new` | `UploadPage` | `uploadFile` (al terminar, redirige al detalle) |
| `/uploads/:id` | `UploadDetailPage` | `fetchUploadById` |

La tarjeta **Quick-Upload** y el CTA **"Nuevo análisis"** del dashboard
enlazarán con el flujo de subida. Las imágenes marcadas como no accesibles
(`isAccesible === false`) se resaltarán en el detalle.

---

## 10. Resumen de próximos pasos

- [ ] Definir `RequestStatus` en `shared/types/` y los tipos del dominio en `Uploads/Interface/UploadsInterface.ts`.
- [ ] Implementar `UploadsThunk` (`uploadFile`, `fetchUploads`, `fetchUploadById`).
- [ ] Implementar `HtmlDocumentsThunk` y `ImagesThunk`.
- [ ] Implementar `UploadsSlice`, `HtmlDocumentsSlice`, `ImagesSlice` y registrarlos en el store.
- [ ] Confirmar contra la API: nombre del campo del `FormData` y casing de los campos de respuesta.
- [ ] (Después) Construir las páginas `UploadsListPage`, `UploadPage`, `UploadDetailPage` y conectarlas al estado.
