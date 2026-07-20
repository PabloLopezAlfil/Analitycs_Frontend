// Tipos del dominio de subida y gestión de archivos (fase 0002). Son espejo de
// los modelos del backend (Back Analitycs/docs/0002-SubidaDeArchivos.md).
//
// OJO: la forma difiere según el endpoint:
//  - AGREGADO (/uploads, /uploads/:id): documentos e imágenes ANIDADOS y
//    "slim" (sin las FK ni createdAt), y el documento incluye `content`.
//  - SUELTOS (/html, /images): cada recurso trae su FK y su createdAt.

export type UploadType = "HTML" | "ZIP_SINGLE" | "ZIP_MULTIPLE";

// ---------------------------------------------------------------------------
// Agregado de subida (/uploads y /uploads/:id)
// ---------------------------------------------------------------------------

export interface Upload {
  // GET /uploads (resumen)
  id: number;
  type: UploadType;
  originalName: string;
  createdAt: string;
}

// Imagen anidada en el agregado (sin htmlId ni createdAt).
export interface UploadImage {
  id: number;
  originalName: string;
  url: string;
  relativePath: string | null;
  mimeType: string | null;
  isAccesible: boolean;
}

// Documento HTML anidado en el agregado (con content + imágenes, sin uploadId
// ni createdAt).
export interface UploadHtmlDocument {
  id: number;
  name: string;
  content: string;
  relativePath: string | null;
  images: UploadImage[];
}

export interface UploadDetail extends Upload {
  // GET /uploads/:id
  htmlDocuments: UploadHtmlDocument[];
}

// ---------------------------------------------------------------------------
// Recursos sueltos (/html y /images)
// ---------------------------------------------------------------------------

export interface HtmlDocument {
  // GET /html (resumen)
  id: number;
  uploadId: number;
  name: string;
  relativePath: string | null;
  createdAt: string;
}

export interface HtmlDocumentDetail extends HtmlDocument {
  // GET /html/:id
  content: string;
  images: Image[];
}

export interface Image {
  // GET /images
  id: number;
  htmlId: number;
  originalName: string;
  url: string;
  relativePath: string | null;
  mimeType: string | null;
  isAccesible: boolean;
  createdAt: string;
}
