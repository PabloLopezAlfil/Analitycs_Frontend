/**
 * Design tokens (paleta de color + tipografía).
 *
 * Fuente única de verdad del sistema visual, extraído del diseño de Figma
 * (A11y-Mail-Dashboard). Se consumen desde `tailwind.config.js`
 * (theme.extend), de modo que se usan como utilidades normales de Tailwind:
 *
 *   bg-brand-500   text-brand-700   bg-brand-soft   text-ink
 *   text-muted     border-line      bg-canvas       shadow-card
 *   bg-success-soft text-success    text-display    rounded-card
 *
 * Al ser configuración (lo carga Tailwind vía PostCSS) es CommonJS (.cjs),
 * igual que tailwind.config.js / postcss.config.js.
 */

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------
const colors = {
  // Marca (teal/cian): acciones primarias, acentos y estados activos.
  brand: {
    soft: "#E8F9FC", // fondos suaves y chips de icono
    100: "#DDF6FA", // fondo del item de navegación activo
    500: "#00A9CC", // primario (botones, acentos, superficies de marca)
    700: "#006D84", // teal oscuro: texto/iconos sobre fondo claro (contraste)
    900: "#06343D", // texto/iconos sobre botones brand-500
  },

  // Texto (de más a menos énfasis).
  ink: "#172126", // titulares y texto principal
  muted: "#66767D", // cuerpo y texto secundario
  subtle: "#8A989E", // texto terciario / metadatos

  // Superficies y bordes.
  canvas: "#F4F7F8", // fondo de página / contenido
  surface: "#FFFFFF", // tarjetas y paneles
  "surface-soft": "#FAFCFC", // barra lateral
  "surface-alt": "#F8FAFB", // barra superior
  line: "#DFE7E9", // bordes de tarjeta
  "line-soft": "#EAF0F2", // divisores sutiles
  "line-strong": "#D6E0E3", // bordes marcados

  // Estados (cada uno con su fondo suave para badges; nunca solo color).
  success: { DEFAULT: "#198754", soft: "#EAF8F1" },
  warning: { DEFAULT: "#8A5900", soft: "#FFF5DF" },
  danger: { DEFAULT: "#D04444", soft: "#FFF0F0" },
  ai: { DEFAULT: "#6D5BD0", soft: "#F0EDFF" },
};

// ---------------------------------------------------------------------------
// Tipografía
// ---------------------------------------------------------------------------
const fontFamily = {
  // "Inter Variable" es la familia que registra @fontsource-variable/inter
  // (self-hosted, importada en main.tsx). En Apple gana SF Pro; en el resto
  // de sistemas cae a Inter en vez de a Arial.
  sans: [
    '"SF Pro Display"',
    '"SF Pro Text"',
    '"Inter Variable"',
    "Inter",
    "Arial",
    "sans-serif",
  ],
};

// Escala semántica del diseño: [font-size, { line-height, letter-spacing,
// font-weight }]. Se añade a la escala por defecto (text-xs, text-sm, ...).
const fontSize = {
  display: ["30px", { lineHeight: "36px", letterSpacing: "-1.1px", fontWeight: "650" }],
  h1: ["22px", { lineHeight: "28px", letterSpacing: "-0.5px", fontWeight: "650" }],
  h2: ["15px", { lineHeight: "20px", letterSpacing: "-0.2px", fontWeight: "650" }],
  metric: ["25px", { lineHeight: "30px", letterSpacing: "-0.8px", fontWeight: "680" }],
  body: ["12px", { lineHeight: "18px", fontWeight: "400" }],
  nav: ["12px", { lineHeight: "16px", fontWeight: "580" }],
  caption: ["10px", { lineHeight: "14px", fontWeight: "500" }],
  label: ["10px", { lineHeight: "14px", letterSpacing: "0.5px", fontWeight: "650" }],
  micro: ["9px", { lineHeight: "12px", fontWeight: "550" }],
};

// ---------------------------------------------------------------------------
// Radios, sombras y gradiente (se añaden a los valores por defecto)
// ---------------------------------------------------------------------------
const borderRadius = {
  badge: "9px",
  button: "11px",
  field: "12px",
  card: "18px",
  screen: "24px",
};

const boxShadow = {
  card: "0 5px 10px rgba(18, 39, 46, 0.07)", // sombra ligera de tarjeta
  strong: "0 10px 18px rgba(18, 39, 46, 0.13)", // sombra elevada
};

const backgroundImage = {
  // Gradiente "softBlue" usado en la tarjeta de subida.
  "brand-gradient": "linear-gradient(135deg, #FFFFFF 0%, #E8F9FC 100%)",
};

module.exports = {
  colors,
  fontFamily,
  fontSize,
  borderRadius,
  boxShadow,
  backgroundImage,
};
