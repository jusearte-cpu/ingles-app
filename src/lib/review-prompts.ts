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
  "obj-a1-4-1": {
    prompt: "Escribe en inglés una frase describiendo tu casa con 'there is/are'.",
    expectedKeywords: ["there is", "there are"],
  },
  "obj-a1-4-2": {
    prompt: "Completa: 'The lamp is ___ the desk.' (sobre)",
    expectedKeywords: ["on"],
  },
  "obj-a1-4-3": {
    prompt: "¿Qué tipo de descripción escuchaste en esta unidad? (una palabra: house/casa)",
    expectedKeywords: ["house", "apartment"],
  },
  "obj-a1-4-4": {
    prompt: "Escribe en inglés 2 habitaciones de una casa.",
    expectedKeywords: ["bedroom", "bathroom", "kitchen", "living room"],
  },
  "obj-a1-5-1": {
    prompt: "Escribe en inglés cómo está el clima hoy.",
    expectedKeywords: ["sunny", "rainy", "cold", "hot", "it's"],
  },
  "obj-a1-5-2": {
    prompt: "Completa: 'I'm ___ (go) to the beach tomorrow.' (going to)",
    expectedKeywords: ["going to go"],
  },
  "obj-a1-5-3": {
    prompt: "¿De qué tipo fue el audio de esta unidad? (una palabra: weather/clima)",
    expectedKeywords: ["weather"],
  },
  "obj-a1-5-4": {
    prompt: "Escribe en inglés 2 condiciones climáticas.",
    expectedKeywords: ["sunny", "rainy", "cold", "hot", "cloudy"],
  },
  "obj-a2-4-1": {
    prompt: "Escribe en inglés un plan que tengas para la próxima semana.",
    expectedKeywords: ["going to", "next week"],
  },
  "obj-a2-4-2": {
    prompt: "¿Cuál usarías para un plan ya decidido: 'going to' o 'will'?",
    expectedKeywords: ["going to"],
  },
  "obj-a2-4-3": {
    prompt: "¿De qué trataba la conversación de esta unidad? (una palabra: plans/planes)",
    expectedKeywords: ["plans"],
  },
  "obj-a2-4-4": {
    prompt: "Escribe en inglés una expresión de tiempo futuro.",
    expectedKeywords: ["next week", "tomorrow", "in two days"],
  },
  "obj-a2-5-1": {
    prompt: "Escribe en inglés cómo pedirías ayuda con un problema técnico.",
    expectedKeywords: ["can you help", "could you help"],
  },
  "obj-a2-5-2": {
    prompt: "Completa: '___ you help me, please?' (más educado que can)",
    expectedKeywords: ["could"],
  },
  "obj-a2-5-3": {
    prompt: "¿Qué tipo de instrucciones escuchaste en esta unidad? (una palabra: technical/técnicas)",
    expectedKeywords: ["technical", "technology"],
  },
  "obj-a2-5-4": {
    prompt: "Escribe en inglés cómo dirías que algo 'no funciona'.",
    expectedKeywords: ["not working", "isn't working"],
  },
  "obj-b1-3-1": {
    prompt: "Escribe tu opinión sobre la tecnología usando un condicional tipo 1 (if + presente, will).",
    expectedKeywords: ["if", "will"],
  },
  "obj-b1-3-2": {
    prompt: "Completa: 'If you practice every day, you ___ (improve) quickly.'",
    expectedKeywords: ["will improve", "'ll improve"],
  },
  "obj-b1-3-3": {
    prompt: "¿De qué tema trataba el audio de esta unidad? (una palabra: technology/tecnología)",
    expectedKeywords: ["technology"],
  },
  "obj-b1-3-4": {
    prompt: "Escribe en inglés una palabra relacionada con el efecto de la tecnología (dependence, distraction, convenience).",
    expectedKeywords: ["dependence", "distraction", "convenience"],
  },
  "obj-b1-4-1": {
    prompt: "Describe a alguien que admiras usando una cláusula con 'who'.",
    expectedKeywords: ["who"],
  },
  "obj-b1-4-2": {
    prompt: "Completa: 'The person ___ helped me is my neighbor.' (persona)",
    expectedKeywords: ["who"],
  },
  "obj-b1-4-3": {
    prompt: "¿Qué tipo de descripción escuchaste en esta unidad? (una palabra: person/persona)",
    expectedKeywords: ["person"],
  },
  "obj-b1-4-4": {
    prompt: "Escribe en inglés un adjetivo de personalidad.",
    expectedKeywords: ["ambitious", "generous", "reliable", "honest", "hardworking"],
  },
  "obj-b1-5-1": {
    prompt: "Escribe en inglés una habilidad o experiencia tuya relevante para un trabajo.",
    expectedKeywords: ["experience", "skills", "i have"],
  },
  "obj-b1-5-2": {
    prompt: "Completa: 'You ___ practice before the interview.' (consejo)",
    expectedKeywords: ["should"],
  },
  "obj-b1-5-3": {
    prompt: "¿De qué trataba la conversación de esta unidad? (una palabra: job/trabajo)",
    expectedKeywords: ["job"],
  },
  "obj-b1-5-4": {
    prompt: "Escribe en inglés una palabra de vocabulario de trabajo (skills, experience, qualifications).",
    expectedKeywords: ["skills", "experience", "qualifications"],
  },
  "obj-b1-6-1": {
    prompt: "Resume en inglés una noticia breve con tus propias palabras.",
    expectedKeywords: ["according to", "said"],
  },
  "obj-b1-6-2": {
    prompt: "Completa (estilo indirecto): 'She said that she ___ (is) happy.' (is → )",
    expectedKeywords: ["was"],
  },
  "obj-b1-6-3": {
    prompt: "¿De qué trataba la lectura de esta unidad? (una palabra: news/noticia)",
    expectedKeywords: ["news"],
  },
  "obj-b1-6-4": {
    prompt: "Escribe en inglés una palabra de vocabulario de noticias (according to, reported, announced).",
    expectedKeywords: ["according to", "reported", "announced"],
  },
  "obj-b2-2-1": {
    prompt: "Escribe en inglés un logro tuyo con un ejemplo concreto.",
    expectedKeywords: ["i", "achievement"],
  },
  "obj-b2-2-2": {
    prompt: "Escribe una pregunta indirecta educada usando 'I was wondering if...'.",
    expectedKeywords: ["i was wondering"],
  },
  "obj-b2-2-3": {
    prompt: "¿De qué trataba el audio de esta unidad? (una palabra: interview/entrevista)",
    expectedKeywords: ["interview"],
  },
  "obj-b2-2-4": {
    prompt: "Escribe en inglés una palabra de vocabulario profesional (achievement, responsibility, teamwork).",
    expectedKeywords: ["achievement", "responsibility", "teamwork"],
  },
  "obj-b2-3-1": {
    prompt: "Escribe en inglés una frase sobre un evento usando voz pasiva.",
    expectedKeywords: ["was", "been"],
  },
  "obj-b2-3-2": {
    prompt: "Completa (voz pasiva): 'The report ___ (publish) yesterday.'",
    expectedKeywords: ["was published"],
  },
  "obj-b2-3-3": {
    prompt: "¿De qué trataba el reporte de esta unidad? (una palabra: policy/news)",
    expectedKeywords: ["policy", "news"],
  },
  "obj-b2-3-4": {
    prompt: "Escribe en inglés una palabra de vocabulario de medios (coverage, headline, source).",
    expectedKeywords: ["coverage", "headline", "source"],
  },
  "obj-b2-4-1": {
    prompt: "Presenta en inglés dos posturas sobre un tema social usando 'whereas'.",
    expectedKeywords: ["whereas"],
  },
  "obj-b2-4-2": {
    prompt: "Completa: '___ the rain, we went for a walk.' (a pesar de)",
    expectedKeywords: ["despite"],
  },
  "obj-b2-4-3": {
    prompt: "¿Cuántas posturas distintas se presentaban en la discusión de esta unidad? (un número)",
    expectedKeywords: ["two", "2"],
  },
  "obj-b2-4-4": {
    prompt: "Escribe en inglés una palabra de vocabulario de temas sociales (inequality, awareness, policy).",
    expectedKeywords: ["inequality", "awareness", "policy"],
  },
  "obj-b2-5-1": {
    prompt: "Escribe en inglés cómo presentarías una queja formal.",
    expectedKeywords: ["i'd like to make a complaint", "complaint"],
  },
  "obj-b2-5-2": {
    prompt: "Completa: 'If I ___ (know), I wouldn't have bought it.' (condicional mixto)",
    expectedKeywords: ["had known"],
  },
  "obj-b2-5-3": {
    prompt: "¿Qué solución se ofreció en el diálogo de esta unidad? (en inglés)",
    expectedKeywords: ["refund"],
  },
  "obj-b2-5-4": {
    prompt: "Escribe en inglés una palabra de vocabulario de quejas (refund, compensation, unacceptable).",
    expectedKeywords: ["refund", "compensation", "unacceptable"],
  },
  "obj-b2-6-1": {
    prompt: "Escribe un contraargumento respetuoso sobre un tema educativo.",
    expectedKeywords: ["even though", "despite", "but"],
  },
  "obj-b2-6-2": {
    prompt: "Completa: '___ the rain, we went for a walk.' (+ sustantivo)",
    expectedKeywords: ["despite"],
  },
  "obj-b2-6-3": {
    prompt: "¿Qué concedió un hablante en el debate de esta unidad? (en inglés)",
    expectedKeywords: ["save time", "saves time"],
  },
  "obj-b2-6-4": {
    prompt: "Escribe en inglés una palabra de vocabulario de debate (counterargument, rebuttal, concede).",
    expectedKeywords: ["counterargument", "rebuttal", "concede"],
  },
  "obj-b2-7-1": {
    prompt: "Reporta en estilo indirecto una pregunta que te hicieron (she asked if/what...).",
    expectedKeywords: ["asked if", "asked what", "wondered"],
  },
  "obj-b2-7-2": {
    prompt: "Completa: '\"Where do you live?\" → He asked where I ___ (live).'",
    expectedKeywords: ["lived"],
  },
  "obj-b2-7-3": {
    prompt: "¿Qué preguntó la persona en el audio de esta unidad? (en inglés)",
    expectedKeywords: ["finished the report", "deadline"],
  },
  "obj-b2-7-4": {
    prompt: "Escribe en inglés un verbo de reporte (asked, wondered, inquired).",
    expectedKeywords: ["asked", "wondered", "inquired"],
  },
  "obj-c1-2-1": {
    prompt: "Construye un argumento académico breve usando subordinación compleja.",
    expectedKeywords: ["although", "given that", "provided that"],
  },
  "obj-c1-2-2": {
    prompt: "Completa: '___ the data is verified, we'll publish the study.' (siempre que)",
    expectedKeywords: ["provided that"],
  },
  "obj-c1-2-3": {
    prompt: "¿Qué limitación se mencionaba en el texto académico de esta unidad? (en inglés)",
    expectedKeywords: ["variables", "not controlled"],
  },
  "obj-c1-2-4": {
    prompt: "Escribe en inglés una palabra de vocabulario académico (methodology, evidence, implication).",
    expectedKeywords: ["methodology", "evidence", "implication"],
  },
  "obj-c1-3-1": {
    prompt: "Resume de forma neutral dos posturas opuestas sobre un tema.",
    expectedKeywords: ["to put it another way", "one side", "the other"],
  },
  "obj-c1-3-2": {
    prompt: "Completa (inversión): 'Never ___ I seen such a clear example.'",
    expectedKeywords: ["have"],
  },
  "obj-c1-3-3": {
    prompt: "¿Qué palabra revelaba el sesgo del hablante en el audio de esta unidad? (en inglés)",
    expectedKeywords: ["obviously", "disaster"],
  },
  "obj-c1-3-4": {
    prompt: "Escribe en inglés una frase de mediación neutral (to put it another way, impartial).",
    expectedKeywords: ["to put it another way", "impartial"],
  },
};
