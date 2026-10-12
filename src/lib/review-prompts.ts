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
  "obj-prea1-1-1": {
    prompt: "Escribe en inglés cómo se saluda y cómo se despide.",
    expectedKeywords: ["hello", "bye"],
  },
  "obj-prea1-1-2": {
    prompt: "Escribe en inglés el número 15.",
    expectedKeywords: ["fifteen"],
  },
  "obj-prea1-1-3": {
    prompt: "Deletrea la palabra DOG en inglés (con guiones).",
    expectedKeywords: ["d-o-g", "d", "o", "g"],
  },
  "obj-prea1-1-4": {
    prompt: "¿Qué se necesita entender cuando alguien deletrea su nombre? (una palabra)",
    expectedKeywords: ["letters", "name"],
  },
  "obj-a1-2-1": {
    prompt: "Escribe en inglés una frase sobre tu rutina diaria.",
    expectedKeywords: ["i"],
  },
  "obj-a1-2-2": {
    prompt: "Completa: 'He ___ (watch) TV every night.'",
    expectedKeywords: ["watches"],
  },
  "obj-a1-2-3": {
    prompt: "¿Qué tipo de información escuchaste sobre la rutina de otra persona en esta unidad?",
    expectedKeywords: ["wake up", "evening", "work"],
  },
  "obj-a1-2-4": {
    prompt: "Escribe una frase usando 'usually' o 'never'.",
    expectedKeywords: ["usually", "never", "always", "sometimes"],
  },
  "obj-a2-1-1": {
    prompt: "Escribe en inglés, en pasado, una frase sobre algo que hiciste el fin de semana pasado.",
    expectedKeywords: ["i"],
  },
  "obj-a2-1-2": {
    prompt: "Completa: 'They ___ (have) dinner together.' (pasado)",
    expectedKeywords: ["had"],
  },
  "obj-a2-1-3": {
    prompt: "¿Qué conectores se usan para narrar eventos en orden? (escribe al menos uno)",
    expectedKeywords: ["first", "then", "after that", "finally"],
  },
  "obj-a2-1-4": {
    prompt: "Escribe una frase corta usando el conector 'then'.",
    expectedKeywords: ["then"],
  },
};
