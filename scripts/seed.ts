/**
 * Siembra el currículo implementado hasta ahora (Etapa 2/3 parcial): 3 niveles
 * con una unidad de ejemplo cada uno, más una segunda unidad de A1 — ver
 * docs/02-curriculum-matrix.md para el diseño completo (de donde sale esto) y
 * docs/06-roadmap.md para qué falta. Es idempotente (upsert).
 *
 * Las unidades reciclan deliberadamente el objetivo "pedir que me repitan"
 * (obj-prea1-2-3): se introduce en Pre-A1, se recicla como transferencia en
 * A1.1, de nuevo en A1.2, y de nuevo en A2.1 — así se prueba el requisito de
 * reciclaje y complejidad creciente (encargo, sección 4).
 */
import { db } from "../src/db/client";
import { objectives, units, activities } from "../src/db/schema";

type Objective = {
  id: string;
  stableCode: string;
  skill: string;
  canDoStatement: string;
  levelCode: string;
};
type Unit = {
  id: string;
  title: string;
  moduleTitle: string;
  levelCode: string;
  sortOrder: number;
};
type Activity = {
  id: string;
  unitId: string;
  stepNumber: number;
  stepName: string;
  type: string;
  skill: string;
  pool: string;
  baseItemId: string;
  content: unknown;
  objectiveIds: string[];
};
type UnitDefinition = { objectives: Objective[]; unit: Unit; activities: Activity[] };

const REPETITION_OBJECTIVE: Objective = {
  id: "obj-prea1-2-3",
  stableCode: "PreA1.2.3",
  skill: "speaking",
  canDoStatement: "Puedo pedir que me repitan algo que no entendí.",
  levelCode: "A1",
};

function reviewStep(unitId: string, baseId: string, objectiveIds: string[]): Activity {
  return {
    id: `act-${baseId}-review`,
    unitId,
    stepNumber: 99,
    stepName: "Repaso (no aparece en el stepper)",
    type: "spaced_review",
    skill: "mixed",
    pool: "practice",
    baseItemId: `${baseId}-review`,
    content: {},
    objectiveIds,
  };
}

function scheduleStep(unitId: string, baseId: string, objectiveIds: string[]): Activity {
  return {
    id: `act-${baseId}-10`,
    unitId,
    stepNumber: 10,
    stepName: "Repaso posterior",
    type: "review_scheduling",
    skill: "speaking",
    pool: "practice",
    baseItemId: `${baseId}-step10`,
    content: { intervalDays: 3 },
    objectiveIds,
  };
}

// ======================= Pre-A1 · Módulo 1 · Unidad 1 =======================
// "Hello! Spelling and numbers" — introduce saludos, alfabeto/deletreo,
// números 0-20, y PRIMERA introducción de "pedir que me repitan".
const PREA1_1_1 = (() => {
  const unitId = "unit-prea1-1-1";
  const base = "prea1-1-1";
  const objs: Objective[] = [
    {
      id: "obj-prea1-1-1",
      stableCode: "PreA1.1.1",
      skill: "speaking",
      canDoStatement: "Puedo saludar y despedirme usando expresiones básicas.",
      levelCode: "Pre-A1",
    },
    {
      id: "obj-prea1-1-2",
      stableCode: "PreA1.1.2",
      skill: "vocabulary",
      canDoStatement: "Puedo reconocer y decir los números del 0 al 20.",
      levelCode: "Pre-A1",
    },
    {
      id: "obj-prea1-1-3",
      stableCode: "PreA1.1.3",
      skill: "speaking",
      canDoStatement: "Puedo deletrear una palabra corta usando el alfabeto en inglés.",
      levelCode: "Pre-A1",
    },
    {
      id: "obj-prea1-1-4",
      stableCode: "PreA1.1.4",
      skill: "listening",
      canDoStatement:
        "Puedo entender cuando alguien deletrea un nombre o dice un número simple.",
      levelCode: "Pre-A1",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "Hello! Spelling and numbers",
    moduleTitle: "Módulo 1 — Primer contacto",
    levelCode: "Pre-A1",
    sortOrder: 1,
  };
  const acts: Activity[] = [
    {
      id: `act-${base}-1`,
      unitId,
      stepNumber: 1,
      stepName: "Qué aprenderás",
      type: "info",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step1`,
      content: {
        body:
          "Vas a poder saludar y despedirte, deletrear una palabra con el abecedario en inglés, decir números del 0 al 20, y pedir que te repitan algo que no entiendas.",
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-2`,
      unitId,
      stepNumber: 2,
      stepName: "Ejemplo resuelto",
      type: "worked_example",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step2`,
      content: {
        dialogue: [
          { speaker: "A", text: "Hello!" },
          { speaker: "B", text: "Hi! How are you?" },
          { speaker: "A", text: "Fine, thanks. What's your name?" },
          { speaker: "B", text: "It's Kim. K-I-M." },
          { speaker: "A", text: "Nice. Goodbye!" },
          { speaker: "B", text: "Bye! See you!" },
        ],
        notes: [
          "Para deletrear se dice cada letra: K-I-M se dice 'kay, eye, em'.",
          "Goodbye / Bye / See you = formas de despedirse, de más a menos formal.",
          "How are you? se responde con Fine, thanks / Good, thanks, no solo 'yes'.",
        ],
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-3`,
      unitId,
      stepNumber: 3,
      stepName: "Escucha en contexto",
      type: "contextualized_input",
      skill: "listening",
      pool: "practice",
      baseItemId: `${base}-step3`,
      content: {
        dialogue: [
          { speaker: "A", text: "Hi, what's your name?" },
          { speaker: "B", text: "It's Dan. D-A-N." },
          { speaker: "A", text: "And what's your phone number?" },
          { speaker: "B", text: "It's one five three." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "Deletrea el nombre que escuchaste.",
            objectiveId: "obj-prea1-1-4",
            expectedKeywords: ["d", "a", "n"],
          },
          {
            id: "q2",
            prompt: "¿Qué número escuchaste? (en inglés)",
            objectiveId: "obj-prea1-1-4",
            expectedKeywords: ["one five three", "153"],
          },
        ],
      },
      objectiveIds: ["obj-prea1-1-4"],
    },
    {
      id: `act-${base}-4`,
      unitId,
      stepNumber: 4,
      stepName: "Observa el lenguaje",
      type: "language_observation",
      skill: "vocabulary",
      pool: "practice",
      baseItemId: `${base}-step4`,
      content: {
        highlights: [
          { phrase: "H is 'aitch', not 'hache'.", note: "Varias letras suenan muy distinto al español: H, J, G, W." },
          { phrase: "0 1 2 3 4 5 6 7 8 9 10", note: "zero, one, two, three, four, five, six, seven, eight, nine, ten" },
          { phrase: "Sorry, can you repeat that?", note: "Frase clave para pedir repetición — la vas a usar en el paso 8." },
        ],
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-5`,
      unitId,
      stepNumber: 5,
      stepName: "Práctica guiada",
      type: "guided_practice",
      skill: "vocabulary",
      pool: "practice",
      baseItemId: `${base}-step5`,
      content: {
        sentences: [
          { id: "s1", template: "Spell CAT: C-A-___", answer: "T", hint: "la última letra de 'cat'" },
          { id: "s2", template: "Write the number as a word: 7 = ___", answer: "seven", hint: "después de six" },
          { id: "s3", template: "Write the number as a word: 12 = ___", answer: "twelve", hint: "después de eleven" },
        ],
      },
      objectiveIds: ["obj-prea1-1-2"],
    },
    {
      id: `act-${base}-6`,
      unitId,
      stepNumber: 6,
      stepName: "Recuperación sin apoyo",
      type: "unaided_retrieval",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step6`,
      content: {
        prompt: "Sin mirar el paso 2, escribe cómo se saluda y cómo se despide en inglés.",
        expectedKeywords: ["hello", "bye"],
      },
      objectiveIds: ["obj-prea1-1-1"],
    },
    {
      id: `act-${base}-7`,
      unitId,
      stepNumber: 7,
      stepName: "Producción",
      type: "production",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step7`,
      content: {
        prompt:
          "Saluda, deletrea tu nombre letra por letra en inglés, y despídete. Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-prea1-1-1", "obj-prea1-1-3"],
    },
    {
      id: `act-${base}-8`,
      unitId,
      stepNumber: 8,
      stepName: "Tarea comunicativa",
      type: "communicative_task",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step8`,
      content: {
        tutorLine: "Hello! Nice to meet you. Can you spell your name for me, please? (e.g. J-A-N-E)",
        instructions:
          "Deletrea tu nombre separando las letras con guiones (como J-A-N-E). Luego el sistema te va a decir algo difícil de entender — tu tarea es pedir que te lo repita, en inglés.",
        secondTutorLine: "Ok cool. Wht's yr fav color btw?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["-"],
        firstTaskLabel: "Deletrear tu nombre",
      },
      objectiveIds: ["obj-prea1-1-3", "obj-prea1-2-3"],
    },
    {
      id: `act-${base}-9`,
      unitId,
      stepNumber: 9,
      stepName: "Retroalimentación",
      type: "feedback",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step9`,
      content: {},
      objectiveIds: [],
    },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    reviewStep(unitId, base, objs.map((o) => o.id)),
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= A1 · Módulo 1 · Unidad 1 (existente) =======================
const A1_1_1 = (() => {
  const unitId = "unit-a1-1-1";
  const base = "a1-1-1";
  const objs: Objective[] = [
    {
      id: "obj-a1-1-1",
      stableCode: "A1.1.1",
      skill: "speaking",
      canDoStatement: "Puedo presentarme diciendo mi nombre y saludar adecuadamente.",
      levelCode: "A1",
    },
    {
      id: "obj-a1-1-2",
      stableCode: "A1.1.2",
      skill: "speaking",
      canDoStatement: "Puedo decir de dónde soy y preguntar de dónde es otra persona.",
      levelCode: "A1",
    },
    REPETITION_OBJECTIVE,
    {
      id: "obj-a1-1-4",
      stableCode: "A1.1.4",
      skill: "listening",
      canDoStatement:
        "Puedo entender los datos clave (nombre, origen) de un diálogo breve de presentación.",
      levelCode: "A1",
    },
    {
      id: "obj-a1-1-5",
      stableCode: "A1.1.5",
      skill: "writing",
      canDoStatement: "Puedo escribir una presentación breve de mí mismo (3-4 líneas).",
      levelCode: "A1",
    },
    {
      id: "obj-a1-1-6",
      stableCode: "A1.1.6",
      skill: "grammar",
      canDoStatement: "Puedo usar el verbo to be (am/is/are) correctamente para presentarme.",
      levelCode: "A1",
    },
  ];
  const unit: Unit = {
    id: unitId,
    title: "Nice to meet you",
    moduleTitle: "Módulo 1 — Vida diaria mínima",
    levelCode: "A1",
    sortOrder: 1,
  };
  const acts: Activity[] = [
    {
      id: "act-1",
      unitId,
      stepNumber: 1,
      stepName: "Qué aprenderás",
      type: "info",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step1`,
      content: {
        body:
          "Vas a poder presentarte, decir de dónde eres y preguntarle lo mismo a otra persona — y pedir que te repitan algo si no entiendes.",
      },
      objectiveIds: [],
    },
    {
      id: "act-2",
      unitId,
      stepNumber: 2,
      stepName: "Ejemplo resuelto",
      type: "worked_example",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step2`,
      content: {
        dialogue: [
          { speaker: "A", text: "Hi! I'm Laura." },
          { speaker: "B", text: "Hi Laura, I'm Marco. Nice to meet you." },
          { speaker: "A", text: "Nice to meet you too. Where are you from?" },
          { speaker: "B", text: "I'm from Italy. And you?" },
          { speaker: "A", text: "I'm from Chile." },
        ],
        notes: [
          "I'm from... = Soy de...",
          "Nice to meet you = Mucho gusto",
          "El orden es sujeto + verbo to be: I'm, you're, he's...",
        ],
      },
      objectiveIds: [],
    },
    {
      id: "act-3",
      unitId,
      stepNumber: 3,
      stepName: "Escucha en contexto",
      type: "contextualized_input",
      skill: "listening",
      pool: "practice",
      baseItemId: `${base}-step3`,
      content: {
        dialogue: [
          { speaker: "A", text: "Hello, I'm Anna." },
          { speaker: "B", text: "Hi Anna, I'm Tom. Nice to meet you." },
          { speaker: "A", text: "Nice to meet you too. Where are you from, Tom?" },
          { speaker: "B", text: "I'm from Canada. What about you?" },
          { speaker: "A", text: "I'm from Mexico." },
        ],
        questions: [
          { id: "q1", prompt: "¿De dónde es Tom?", objectiveId: "obj-a1-1-4", expectedKeywords: ["canada"] },
          { id: "q2", prompt: "¿De dónde es Anna?", objectiveId: "obj-a1-1-4", expectedKeywords: ["mexico"] },
        ],
      },
      objectiveIds: ["obj-a1-1-4"],
    },
    {
      id: "act-4",
      unitId,
      stepNumber: 4,
      stepName: "Observa el lenguaje",
      type: "language_observation",
      skill: "grammar",
      pool: "practice",
      baseItemId: `${base}-step4`,
      content: {
        highlights: [
          { phrase: "I'm from Chile.", note: "to be + from + lugar, para decir origen." },
          { phrase: "Nice to meet you.", note: "Expresión fija al conocer a alguien." },
          { phrase: "And you?", note: "Forma corta de devolver la pregunta." },
        ],
      },
      objectiveIds: [],
    },
    {
      id: "act-5",
      unitId,
      stepNumber: 5,
      stepName: "Práctica guiada",
      type: "guided_practice",
      skill: "grammar",
      pool: "practice",
      baseItemId: `${base}-step5`,
      content: {
        sentences: [
          { id: "s1", template: "Hi, ___ Sofia.", answer: "I'm", hint: "yo + to be, forma corta" },
          { id: "s2", template: "Where ___ you from?", answer: "are", hint: "tú + to be" },
          { id: "s3", template: "She ___ from Brazil.", answer: "is", hint: "ella + to be" },
        ],
      },
      objectiveIds: ["obj-a1-1-6"],
    },
    {
      id: "act-6",
      unitId,
      stepNumber: 6,
      stepName: "Recuperación sin apoyo",
      type: "unaided_retrieval",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step6`,
      content: {
        prompt:
          "Sin mirar el diálogo del paso 2, escribe de memoria cómo Laura y Marco se presentan y dicen de dónde son.",
        expectedKeywords: ["i'm", "from", "nice to meet you"],
      },
      objectiveIds: ["obj-a1-1-1", "obj-a1-1-2"],
    },
    {
      id: "act-7",
      unitId,
      stepNumber: 7,
      stepName: "Producción",
      type: "production",
      skill: "writing",
      pool: "practice",
      baseItemId: `${base}-step7`,
      content: {
        prompt:
          "Preséntate: di tu nombre y de dónde eres, en 2-3 frases en inglés. Puedes grabarte en voz alta con el micrófono, o escribir tu respuesta.",
      },
      objectiveIds: ["obj-a1-1-1", "obj-a1-1-5"],
    },
    {
      id: "act-8",
      unitId,
      stepNumber: 8,
      stepName: "Tarea comunicativa",
      type: "communicative_task",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step8`,
      content: {
        tutorLine: "Hi! I'm Priya. I'm from India. Where are you from?",
        instructions:
          "Responde a Priya diciendo de dónde eres. Luego, el sistema te hará una pregunta rápida que probablemente no vas a entender del todo — tu tarea es pedir que te la repita, en inglés.",
        secondTutorLine: "Cool! So, what do you do for a living these days?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["i'm from"],
        firstTaskLabel: "Decir tu origen",
      },
      objectiveIds: ["obj-a1-1-2", "obj-prea1-2-3"],
    },
    {
      id: "act-9",
      unitId,
      stepNumber: 9,
      stepName: "Retroalimentación",
      type: "feedback",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step9`,
      content: {},
      objectiveIds: [],
    },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    { ...reviewStep(unitId, base, objs.map((o) => o.id)), id: "act-review" },
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= A1 · Módulo 1 · Unidad 2 =======================
// "My daily routine" — recicla "pedir repetición" por segunda vez.
const A1_1_2 = (() => {
  const unitId = "unit-a1-1-2";
  const base = "a1-1-2";
  const objs: Objective[] = [
    {
      id: "obj-a1-2-1",
      stableCode: "A1.2.1",
      skill: "speaking",
      canDoStatement: "Puedo describir mi rutina diaria usando el presente simple.",
      levelCode: "A1",
    },
    {
      id: "obj-a1-2-2",
      stableCode: "A1.2.2",
      skill: "grammar",
      canDoStatement: "Puedo usar la tercera persona del presente simple (he/she + verbo-s).",
      levelCode: "A1",
    },
    {
      id: "obj-a1-2-3",
      stableCode: "A1.2.3",
      skill: "listening",
      canDoStatement: "Puedo entender la rutina diaria de otra persona en un audio breve.",
      levelCode: "A1",
    },
    {
      id: "obj-a1-2-4",
      stableCode: "A1.2.4",
      skill: "vocabulary",
      canDoStatement: "Puedo usar expresiones de frecuencia (always, usually, sometimes, never).",
      levelCode: "A1",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "My daily routine",
    moduleTitle: "Módulo 1 — Vida diaria mínima",
    levelCode: "A1",
    sortOrder: 2,
  };
  const acts: Activity[] = [
    {
      id: `act-${base}-1`,
      unitId,
      stepNumber: 1,
      stepName: "Qué aprenderás",
      type: "info",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step1`,
      content: {
        body:
          "Vas a poder describir tu rutina diaria y la de otra persona, usando el presente simple y palabras como 'usually' o 'never'.",
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-2`,
      unitId,
      stepNumber: 2,
      stepName: "Ejemplo resuelto",
      type: "worked_example",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step2`,
      content: {
        dialogue: [
          { speaker: "Marco", text: "I usually wake up at 7 o'clock." },
          { speaker: "Marco", text: "I have breakfast and go to work." },
          { speaker: "Marco", text: "I usually work until 5 pm." },
          { speaker: "Marco", text: "In the evening, I watch TV and I go to bed at 11 pm." },
        ],
        notes: [
          "Presente simple para rutinas: I wake up, I have, I go, I watch.",
          "usually = usualmente, va antes del verbo principal.",
          "at 7 o'clock / at 11 pm = a las 7 / a las 11 de la noche.",
        ],
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-3`,
      unitId,
      stepNumber: 3,
      stepName: "Escucha en contexto",
      type: "contextualized_input",
      skill: "listening",
      pool: "practice",
      baseItemId: `${base}-step3`,
      content: {
        dialogue: [
          { speaker: "Elena", text: "I always wake up early, at 6 am." },
          { speaker: "Elena", text: "I never eat breakfast at home, I eat at the office." },
          { speaker: "Elena", text: "In the evening, I usually read a book before bed." },
        ],
        questions: [
          { id: "q1", prompt: "¿A qué hora se despierta Elena? (en inglés)", objectiveId: "obj-a1-2-3", expectedKeywords: ["6", "six"] },
          { id: "q2", prompt: "¿Qué hace en la noche antes de dormir? (en inglés)", objectiveId: "obj-a1-2-3", expectedKeywords: ["read", "book"] },
        ],
      },
      objectiveIds: ["obj-a1-2-3"],
    },
    {
      id: `act-${base}-4`,
      unitId,
      stepNumber: 4,
      stepName: "Observa el lenguaje",
      type: "language_observation",
      skill: "grammar",
      pool: "practice",
      baseItemId: `${base}-step4`,
      content: {
        highlights: [
          { phrase: "He works / She watches", note: "En tercera persona (he/she/it), el verbo lleva -s o -es." },
          { phrase: "always, usually, sometimes, never", note: "Van ANTES del verbo principal: I usually work, not I work usually." },
        ],
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-5`,
      unitId,
      stepNumber: 5,
      stepName: "Práctica guiada",
      type: "guided_practice",
      skill: "grammar",
      pool: "practice",
      baseItemId: `${base}-step5`,
      content: {
        sentences: [
          { id: "s1", template: "She ___ (work) every day.", answer: "works", hint: "tercera persona: +s" },
          { id: "s2", template: "He ___ (watch) TV at night.", answer: "watches", hint: "termina en -ch, +es" },
          { id: "s3", template: "They ___ (not/work) on Sunday.", answer: "don't work", hint: "negativo con don't" },
        ],
      },
      objectiveIds: ["obj-a1-2-2"],
    },
    {
      id: `act-${base}-6`,
      unitId,
      stepNumber: 6,
      stepName: "Recuperación sin apoyo",
      type: "unaided_retrieval",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step6`,
      content: {
        prompt: "Sin mirar el paso 2, escribe de memoria la rutina diaria de Marco.",
        expectedKeywords: ["wake up", "work", "evening"],
      },
      objectiveIds: ["obj-a1-2-1"],
    },
    {
      id: `act-${base}-7`,
      unitId,
      stepNumber: 7,
      stepName: "Producción",
      type: "production",
      skill: "writing",
      pool: "practice",
      baseItemId: `${base}-step7`,
      content: {
        prompt:
          "Describe tu propia rutina diaria en 3-4 frases, usando al menos una palabra de frecuencia (always/usually/sometimes/never). Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-a1-2-1", "obj-a1-2-4"],
    },
    {
      id: `act-${base}-8`,
      unitId,
      stepNumber: 8,
      stepName: "Tarea comunicativa",
      type: "communicative_task",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step8`,
      content: {
        tutorLine: "Hey, nice to meet you again! Tell me about your daily routine.",
        instructions:
          "Cuenta tu rutina. Luego el sistema va a decir algo difícil de entender otra vez — pide que te lo repita, en inglés (ya van dos veces que practicas esto, ¡cada vez en un contexto distinto!).",
        secondTutorLine: "Mm k, n whn d'you usually g t bed?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["i"],
        firstTaskLabel: "Contar tu rutina",
      },
      objectiveIds: ["obj-a1-2-1", "obj-prea1-2-3"],
    },
    {
      id: `act-${base}-9`,
      unitId,
      stepNumber: 9,
      stepName: "Retroalimentación",
      type: "feedback",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step9`,
      content: {},
      objectiveIds: [],
    },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    reviewStep(unitId, base, objs.map((o) => o.id)),
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= A2 · Módulo 1 · Unidad 1 =======================
// "Last weekend" — pasado simple y narración. Recicla "pedir repetición" por
// tercera vez, probando la progresión de nivel (Pre-A1 → A1 → A1 → A2).
const A2_1_1 = (() => {
  const unitId = "unit-a2-1-1";
  const base = "a2-1-1";
  const objs: Objective[] = [
    {
      id: "obj-a2-1-1",
      stableCode: "A2.1.1",
      skill: "speaking",
      canDoStatement: "Puedo narrar en pasado simple qué hice el fin de semana.",
      levelCode: "A2",
    },
    {
      id: "obj-a2-1-2",
      stableCode: "A2.1.2",
      skill: "grammar",
      canDoStatement: "Puedo formar el pasado simple de verbos regulares e irregulares frecuentes.",
      levelCode: "A2",
    },
    {
      id: "obj-a2-1-3",
      stableCode: "A2.1.3",
      skill: "listening",
      canDoStatement:
        "Puedo entender una narración breve de eventos pasados con conectores (first, then, after that).",
      levelCode: "A2",
    },
    {
      id: "obj-a2-1-4",
      stableCode: "A2.1.4",
      skill: "vocabulary",
      canDoStatement: "Puedo usar conectores temporales (first, then, after that, finally) para narrar.",
      levelCode: "A2",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "Last weekend",
    moduleTitle: "Módulo 1 — Narrar el pasado",
    levelCode: "A2",
    sortOrder: 1,
  };
  const acts: Activity[] = [
    {
      id: `act-${base}-1`,
      unitId,
      stepNumber: 1,
      stepName: "Qué aprenderás",
      type: "info",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step1`,
      content: {
        body:
          "Vas a poder narrar qué hiciste el fin de semana pasado, usando el pasado simple y conectores como 'first', 'then', 'after that' y 'finally'.",
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-2`,
      unitId,
      stepNumber: 2,
      stepName: "Ejemplo resuelto",
      type: "worked_example",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step2`,
      content: {
        dialogue: [
          { speaker: "Ana", text: "Last Saturday, I woke up late." },
          { speaker: "Ana", text: "First, I had breakfast." },
          { speaker: "Ana", text: "Then, I went to the park with my friends." },
          { speaker: "Ana", text: "After that, we watched a movie." },
          { speaker: "Ana", text: "Finally, I went home and slept early." },
        ],
        notes: [
          "woke up, had, went = pasados irregulares frecuentes (wake up, have, go).",
          "watched = pasado regular (+ed).",
          "first / then / after that / finally = para ordenar una narración.",
        ],
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-3`,
      unitId,
      stepNumber: 3,
      stepName: "Escucha en contexto",
      type: "contextualized_input",
      skill: "listening",
      pool: "practice",
      baseItemId: `${base}-step3`,
      content: {
        dialogue: [
          { speaker: "Luis", text: "Last Sunday, I visited my grandmother." },
          { speaker: "Luis", text: "First, we had lunch together." },
          { speaker: "Luis", text: "Then, we talked for hours." },
          { speaker: "Luis", text: "After that, I helped her in the garden." },
        ],
        questions: [
          { id: "q1", prompt: "¿Qué hizo Luis primero? (en inglés)", objectiveId: "obj-a2-1-3", expectedKeywords: ["lunch"] },
          { id: "q2", prompt: "¿Qué hizo después de hablar? (en inglés)", objectiveId: "obj-a2-1-3", expectedKeywords: ["garden", "help"] },
        ],
      },
      objectiveIds: ["obj-a2-1-3"],
    },
    {
      id: `act-${base}-4`,
      unitId,
      stepNumber: 4,
      stepName: "Observa el lenguaje",
      type: "language_observation",
      skill: "grammar",
      pool: "practice",
      baseItemId: `${base}-step4`,
      content: {
        highlights: [
          { phrase: "go → went, have → had, wake up → woke up", note: "Verbos irregulares: hay que memorizarlos, no siguen un patrón." },
          { phrase: "watch → watched, visit → visited, help → helped", note: "Verbos regulares: se les agrega -ed." },
        ],
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-5`,
      unitId,
      stepNumber: 5,
      stepName: "Práctica guiada",
      type: "guided_practice",
      skill: "grammar",
      pool: "practice",
      baseItemId: `${base}-step5`,
      content: {
        sentences: [
          { id: "s1", template: "I ___ (go) to the store.", answer: "went", hint: "irregular: go" },
          { id: "s2", template: "She ___ (watch) a movie.", answer: "watched", hint: "regular: +ed" },
          { id: "s3", template: "They ___ (have) dinner together.", answer: "had", hint: "irregular: have" },
        ],
      },
      objectiveIds: ["obj-a2-1-2"],
    },
    {
      id: `act-${base}-6`,
      unitId,
      stepNumber: 6,
      stepName: "Recuperación sin apoyo",
      type: "unaided_retrieval",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step6`,
      content: {
        prompt: "Sin mirar el paso 2, reconstruye la narración de Ana usando los 4 conectores.",
        expectedKeywords: ["first", "then", "after that", "finally"],
      },
      objectiveIds: ["obj-a2-1-4"],
    },
    {
      id: `act-${base}-7`,
      unitId,
      stepNumber: 7,
      stepName: "Producción",
      type: "production",
      skill: "writing",
      pool: "practice",
      baseItemId: `${base}-step7`,
      content: {
        prompt:
          "Narra qué hiciste el fin de semana pasado, en pasado simple, usando al menos 2 conectores (first, then, after that, finally). Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-a2-1-1", "obj-a2-1-4"],
    },
    {
      id: `act-${base}-8`,
      unitId,
      stepNumber: 8,
      stepName: "Tarea comunicativa",
      type: "communicative_task",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step8`,
      content: {
        tutorLine: "Hey! What did you do last weekend?",
        instructions:
          "Cuenta qué hiciste el fin de semana. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (tercera vez que practicas esto, en un nivel más alto).",
        secondTutorLine: "Oh nice, n wht did y du aftr tht?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["i"],
        firstTaskLabel: "Narrar tu fin de semana",
      },
      objectiveIds: ["obj-a2-1-1", "obj-prea1-2-3"],
    },
    {
      id: `act-${base}-9`,
      unitId,
      stepNumber: 9,
      stepName: "Retroalimentación",
      type: "feedback",
      skill: "speaking",
      pool: "practice",
      baseItemId: `${base}-step9`,
      content: {},
      objectiveIds: [],
    },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    reviewStep(unitId, base, objs.map((o) => o.id)),
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= Banco de evaluación (separado de práctica) =======================
// "Comprobación de nivel A1.1" — mismos objetivos que unit-a1-1-1, pero ítems
// NUEVOS (no los mismos con nombres cambiados) y pool='assessment', así que
// nunca aparecen en modo práctica ni en el stepper de la lección (ver
// docs/03-progress-and-evaluation-model.md, sección 3).
const ASSESSMENT_ACTIVITIES: Activity[] = (() => {
  const unitId = "unit-a1-1-1"; // vive en la misma unidad, pero fuera del stepper (pool=assessment)
  const base = "assess-a1-1";
  return [
    {
      id: `act-${base}-1`,
      unitId,
      stepNumber: 201,
      stepName: "Comprobación: presentarte",
      type: "assessment_question",
      skill: "speaking",
      pool: "assessment",
      baseItemId: `${base}-item1`,
      content: {
        prompt:
          "Imagina que conoces a alguien en una fiesta. Escribe cómo te presentarías (nombre y saludo), en inglés.",
        expectedKeywords: ["hi", "hello", "i'm", "my name"],
        conditions: "Una sola oportunidad, sin pistas, sin límite de tiempo.",
      },
      objectiveIds: ["obj-a1-1-1"],
    },
    {
      id: `act-${base}-2`,
      unitId,
      stepNumber: 202,
      stepName: "Comprobación: origen",
      type: "assessment_question",
      skill: "speaking",
      pool: "assessment",
      baseItemId: `${base}-item2`,
      content: {
        prompt: "Alguien te pregunta 'Where are you from?'. Escribe tu respuesta completa en inglés.",
        expectedKeywords: ["i'm from", "i am from"],
        conditions: "Una sola oportunidad, sin pistas, sin límite de tiempo.",
      },
      objectiveIds: ["obj-a1-1-2"],
    },
    {
      id: `act-${base}-3`,
      unitId,
      stepNumber: 203,
      stepName: "Comprobación: to be",
      type: "assessment_question",
      skill: "grammar",
      pool: "assessment",
      baseItemId: `${base}-item3`,
      content: {
        prompt: "Completa la frase: 'My friends ___ from Spain.' (to be)",
        expectedKeywords: ["are"],
        conditions: "Una sola oportunidad, sin pistas.",
      },
      objectiveIds: ["obj-a1-1-6"],
    },
  ];
})();

const ALL_UNITS: UnitDefinition[] = [PREA1_1_1, A1_1_1, A1_1_2, A2_1_1];

async function seed() {
  let objCount = 0;
  let actCount = 0;
  const seenObjectives = new Set<string>();

  for (const def of ALL_UNITS) {
    for (const o of def.objectives) {
      await db.insert(objectives).values(o).onConflictDoUpdate({ target: objectives.id, set: o });
      if (!seenObjectives.has(o.id)) {
        seenObjectives.add(o.id);
        objCount += 1;
      }
    }
    await db.insert(units).values(def.unit).onConflictDoUpdate({ target: units.id, set: def.unit });
    for (const a of def.activities) {
      await db.insert(activities).values(a).onConflictDoUpdate({ target: activities.id, set: a });
      actCount += 1;
    }
  }

  for (const a of ASSESSMENT_ACTIVITIES) {
    await db.insert(activities).values(a).onConflictDoUpdate({ target: activities.id, set: a });
    actCount += 1;
  }

  console.log(
    `Sembrado: ${objCount} objetivos únicos, ${ALL_UNITS.length} unidades, ${actCount} actividades (incl. ${ASSESSMENT_ACTIVITIES.length} de evaluación).`,
  );
}

seed().then(() => process.exit(0));
