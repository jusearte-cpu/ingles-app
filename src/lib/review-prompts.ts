/**
 * Prompts de recuperación para la pantalla de Repaso. En Etapa 3+, esto se
 * genera desde el banco de ítems de cada objetivo en vez de vivir hardcodeado
 * aquí — para la unidad de ejemplo de Etapa 2 basta con esto.
 */
export const REVIEW_PROMPTS: Record<string, { prompt: string; expectedKeywords: string[] }> = {
  "obj-a1-1-1": {
    prompt: "Escribe en inglés cómo te presentarías a alguien nuevo (tu nombre).",
    expectedKeywords: ["i'm", "my name"],
  },
  "obj-a1-1-2": {
    prompt: "Escribe en inglés: di de dónde eres.",
    expectedKeywords: ["i'm from"],
  },
  "obj-prea1-2-3": {
    prompt: "Escribe en inglés cómo le pedirías a alguien que repita algo.",
    expectedKeywords: ["repeat", "sorry", "again", "can you say"],
  },
  "obj-a1-1-4": {
    prompt: "¿Qué dos datos de una persona entendiste en el diálogo de escucha de esta unidad?",
    expectedKeywords: ["name", "from"],
  },
  "obj-a1-1-5": {
    prompt: "Escribe 2-3 líneas presentándote por escrito.",
    expectedKeywords: ["i'm", "from"],
  },
  "obj-a1-1-6": {
    prompt: "Completa: 'She ___ from Brazil.' — ¿qué forma de to be va ahí?",
    expectedKeywords: ["is"],
  },
};
