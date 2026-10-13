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
  "obj-prea1-2-1": {
    prompt: "Escribe en inglés 3 colores.",
    expectedKeywords: ["red", "blue", "green", "yellow", "black", "white"],
  },
  "obj-prea1-2-2": {
    prompt: "Escribe en inglés cómo pedirías un lápiz de forma educada.",
    expectedKeywords: ["can i have"],
  },
  "obj-prea1-2-4": {
    prompt: "Escribe en inglés el número 45.",
    expectedKeywords: ["forty-five", "forty five"],
  },
  "obj-prea1-2-5": {
    prompt: "Completa: '___ pen in my hand' (cerca) vs '___ pen over there' (lejos).",
    expectedKeywords: ["this", "that"],
  },
  "obj-a1-3-1": {
    prompt: "Escribe en inglés cómo preguntarías el precio de algo.",
    expectedKeywords: ["how much"],
  },
  "obj-a1-3-2": {
    prompt: "Completa: 'Do you have ___ bread?' (pregunta)",
    expectedKeywords: ["any"],
  },
  "obj-a1-3-3": {
    prompt: "¿Qué tipo de conversación escuchaste en esta unidad? (una palabra: store/tienda)",
    expectedKeywords: ["store", "shop"],
  },
  "obj-a1-3-4": {
    prompt: "Escribe en inglés 3 alimentos.",
    expectedKeywords: ["bread", "milk", "rice", "cheese", "eggs", "apples"],
  },
  "obj-a2-2-1": {
    prompt: "Escribe en inglés cómo pedirías comida de forma educada en un restaurante.",
    expectedKeywords: ["i'd like", "i would like"],
  },
  "obj-a2-2-2": {
    prompt: "Completa: 'This soup is ___ (spicy) than that one.'",
    expectedKeywords: ["spicier"],
  },
  "obj-a2-2-3": {
    prompt: "¿Qué pidió el cliente en el diálogo de escucha de esta unidad? (en inglés)",
    expectedKeywords: ["soup", "water"],
  },
  "obj-a2-2-4": {
    prompt: "Escribe en inglés una comida y una bebida.",
    expectedKeywords: ["water", "soup", "salad", "lemonade", "juice"],
  },
  "obj-b1-1-1": {
    prompt: "Escribe en inglés tu opinión sobre un tema, con una razón (usa 'because').",
    expectedKeywords: ["i think", "in my opinion", "because"],
  },
  "obj-b1-1-2": {
    prompt: "Completa: 'I ___ (live) here for three years.' (sigue siendo verdad)",
    expectedKeywords: ["have lived"],
  },
  "obj-b1-1-3": {
    prompt: "¿Qué distingue a una opinión de un hecho? (una palabra: reason/razón)",
    expectedKeywords: ["reason", "opinion"],
  },
  "obj-b1-1-4": {
    prompt: "Escribe una frase usando 'on the other hand'.",
    expectedKeywords: ["on the other hand"],
  },
  "obj-a2-3-1": {
    prompt: "Escribe en inglés un síntoma de salud.",
    expectedKeywords: ["headache", "fever", "sore throat", "hurts"],
  },
  "obj-a2-3-2": {
    prompt: "Escribe un consejo de salud en imperativo (afirmativo o negativo).",
    expectedKeywords: ["drink", "don't eat", "take", "rest"],
  },
  "obj-a2-3-3": {
    prompt: "¿Qué tipo de conversación escuchaste en esta unidad? (una palabra: doctor)",
    expectedKeywords: ["doctor"],
  },
  "obj-a2-3-4": {
    prompt: "Escribe en inglés 2 partes del cuerpo.",
    expectedKeywords: ["head", "throat", "stomach", "back"],
  },
  "obj-b1-2-1": {
    prompt: "Escribe en inglés una experiencia de vida usando presente perfecto (Have you ever...?).",
    expectedKeywords: ["have you ever", "i've"],
  },
  "obj-b1-2-2": {
    prompt: "Completa: '___ you ever visited another country?'",
    expectedKeywords: ["have"],
  },
  "obj-b1-2-3": {
    prompt: "¿Qué tipo de historia escuchaste en esta unidad? (una palabra: experience/experiencia)",
    expectedKeywords: ["experience"],
  },
  "obj-b1-2-4": {
    prompt: "Escribe una frase usando 'already' o 'yet'.",
    expectedKeywords: ["already", "yet", "never", "ever"],
  },
  "obj-b2-1-1": {
    prompt: "Escribe tu opinión sobre un tema matizándola con 'to some extent' o 'arguably'.",
    expectedKeywords: ["to some extent", "arguably"],
  },
  "obj-b2-1-2": {
    prompt: "Completa: 'She's not here. She ___ (must) have left already.'",
    expectedKeywords: ["must"],
  },
  "obj-b2-1-3": {
    prompt: "¿Qué modal indica una deducción más segura: 'must have' o 'might have'?",
    expectedKeywords: ["must have"],
  },
  "obj-b2-1-4": {
    prompt: "Escribe una frase usando 'on balance' o 'arguably'.",
    expectedKeywords: ["on balance", "arguably"],
  },
  "obj-c1-1-1": {
    prompt: "Reformula esta idea con una palabra más precisa: 'The meeting was bad.' (usa una palabra más exacta que 'bad')",
    expectedKeywords: ["unproductive", "pointless", "tedious", "disorganized"],
  },
  "obj-c1-1-2": {
    prompt: "Completa: 'What I need ___ a clear answer.'",
    expectedKeywords: ["is"],
  },
  "obj-c1-1-3": {
    prompt: "¿Qué palabra describe cuando alguien dice lo opuesto de lo que siente, para dar énfasis? (en inglés)",
    expectedKeywords: ["irony", "ironic", "sarcasm"],
  },
  "obj-c1-1-4": {
    prompt: "Completa: 'We were able to ___ a conclusion after reviewing the data.' (reach/arrive)",
    expectedKeywords: ["reach"],
  },
};
