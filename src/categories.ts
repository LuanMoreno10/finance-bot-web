export const CATEGORIES = [
  "alimentacao",
  "transporte",
  "casa",
  "saude",
  "lazer",
  "compras",
  "subscricoes",
  "educacao",
  "viagens",
  "outros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  casa: "Casa",
  saude: "Saúde",
  lazer: "Lazer",
  compras: "Compras",
  subscricoes: "Subscrições",
  educacao: "Educação",
  viagens: "Viagens",
  outros: "Outros",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  alimentacao: "#0f766e",
  transporte: "#2563eb",
  casa: "#7c3aed",
  saude: "#db2777",
  lazer: "#ea580c",
  compras: "#ca8a04",
  subscricoes: "#0891b2",
  educacao: "#16a34a",
  viagens: "#9333ea",
  outros: "#64748b",
};
