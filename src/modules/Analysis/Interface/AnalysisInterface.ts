// Tipos del dominio de análisis de accesibilidad. Espejo del agregado que
// devuelve el backend (Back Analitycs/docs/0004-MotorDeAnalisis.md): un análisis
// contiene checks (una regla evaluada) y cada check sus findings (ocurrencias).

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

export interface AnalysisFinding {
  id: number;
  location: string;
  evidence: string;
  // Veredicto de la revisión por IA (docs backend 0005 §7)
  aiStatus: "VALIDADO_IA" | "INCUMPLE" | "REVISION_PENDIENTE" | null;
  aiConfidence: "alta" | "media" | "baja" | null;
  aiProblem: string | null;
  aiRecommendation: string | null;
}

export interface AnalysisCheck {
  id: number;
  rule: string; 
  category: CheckCategory;
  status: CheckStatus;
  message: string;
  findings: AnalysisFinding[];
}

export interface Analysis {
  id: number;
  htmlId: number;
  score: number | null; 
  createdAt: string;
}


export interface AnalysisDetail extends Analysis {
  checks: AnalysisCheck[];
}
