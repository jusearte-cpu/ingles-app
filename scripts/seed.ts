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

// ======================= Pre-A1 · Módulo 2 · Unidad 1 =======================
// "Colors, numbers, and basic requests" — recicla "pedir repetición" por
// quinta vez.
const PREA1_2_1 = (() => {
  const unitId = "unit-prea1-2-1";
  const base = "prea1-2-1";
  const objs: Objective[] = [
    {
      id: "obj-prea1-2-1",
      stableCode: "PreA1.2.1",
      skill: "vocabulary",
      canDoStatement: "Puedo nombrar colores básicos en inglés.",
      levelCode: "Pre-A1",
    },
    {
      id: "obj-prea1-2-2",
      stableCode: "PreA1.2.2",
      skill: "speaking",
      canDoStatement: "Puedo pedir algo de forma básica usando 'Can I have...?'.",
      levelCode: "Pre-A1",
    },
    {
      id: "obj-prea1-2-4",
      stableCode: "PreA1.2.4",
      skill: "listening",
      canDoStatement: "Puedo entender números del 20 al 100 dichos en voz alta.",
      levelCode: "Pre-A1",
    },
    {
      id: "obj-prea1-2-5",
      stableCode: "PreA1.2.5",
      skill: "grammar",
      canDoStatement: "Puedo usar 'this/that' para señalar objetos cercanos y lejanos.",
      levelCode: "Pre-A1",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "Colors, numbers, and basic requests",
    moduleTitle: "Módulo 2 — Necesidades básicas",
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
          "Vas a poder nombrar colores, pedir cosas con 'Can I have...?', entender números más grandes, y usar 'this/that' para señalar objetos.",
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
          { speaker: "A", text: "Can I have a red pen, please?" },
          { speaker: "B", text: "This one or that one?" },
          { speaker: "A", text: "That one, please. How much is it?" },
          { speaker: "B", text: "It's two dollars." },
          { speaker: "A", text: "Here you are. Thank you!" },
        ],
        notes: [
          "Can I have...? = ¿Me da...? (pedir algo de forma educada)",
          "this (cerca) / that (lejos)",
          "How much is it? = ¿Cuánto cuesta?",
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
          { speaker: "A", text: "How much is the blue notebook?" },
          { speaker: "B", text: "That's thirty-five dollars." },
          { speaker: "A", text: "And the green one?" },
          { speaker: "B", text: "That one is twenty dollars." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿Cuánto cuesta el cuaderno azul? (en inglés)",
            objectiveId: "obj-prea1-2-4",
            expectedKeywords: ["thirty-five", "35"],
          },
          {
            id: "q2",
            prompt: "¿Cuánto cuesta el cuaderno verde? (en inglés)",
            objectiveId: "obj-prea1-2-4",
            expectedKeywords: ["twenty", "20"],
          },
        ],
      },
      objectiveIds: ["obj-prea1-2-4"],
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
          { phrase: "red, blue, green, yellow, black, white", note: "Colores básicos." },
          { phrase: "this pen / that notebook", note: "this + singular cercano, that + singular lejano." },
          { phrase: "Can I have...?", note: "Pedido educado — no es lo mismo que 'Give me...' (descortés)." },
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
          { id: "s1", template: "Can I have ___ red pen, please? (this/that, cerca de ti)", answer: "this", hint: "está cerca" },
          { id: "s2", template: "How much is ___ notebook over there? (lejos)", answer: "that", hint: "está lejos" },
          { id: "s3", template: "It's ___ dollars. (50)", answer: "fifty", hint: "cincuenta" },
        ],
      },
      objectiveIds: ["obj-prea1-2-5"],
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
        prompt: "Sin mirar el paso 2, escribe de memoria cómo se pide un objeto y se pregunta el precio.",
        expectedKeywords: ["can i have", "how much"],
      },
      objectiveIds: ["obj-prea1-2-2"],
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
          "Pide dos objetos de colores distintos usando 'Can I have...?' y di si están cerca (this) o lejos (that). Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-prea1-2-1", "obj-prea1-2-2"],
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
        tutorLine: "Hi! Welcome to the shop. Can I help you?",
        instructions:
          "Pide un objeto de un color (por ejemplo, 'Can I have a blue notebook, please?'). Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (quinta vez que practicas esto).",
        secondTutorLine: "Sure, tht'll be fftn dllrs, cash or crd?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["can i have"],
        firstTaskLabel: "Pedir el objeto",
      },
      objectiveIds: ["obj-prea1-2-2", "obj-prea1-2-3"],
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

// ======================= A1 · Módulo 2 · Unidad 1 =======================
// "At the store" — recicla "pedir repetición" por sexta vez.
const A1_3_1 = (() => {
  const unitId = "unit-a1-3-1";
  const base = "a1-3-1";
  const objs: Objective[] = [
    {
      id: "obj-a1-3-1",
      stableCode: "A1.3.1",
      skill: "speaking",
      canDoStatement: "Puedo preguntar el precio de algo y pedirlo en una tienda.",
      levelCode: "A1",
    },
    {
      id: "obj-a1-3-2",
      stableCode: "A1.3.2",
      skill: "grammar",
      canDoStatement: "Puedo usar 'some/any' con sustantivos contables e incontables.",
      levelCode: "A1",
    },
    {
      id: "obj-a1-3-3",
      stableCode: "A1.3.3",
      skill: "listening",
      canDoStatement: "Puedo entender una conversación corta en una tienda.",
      levelCode: "A1",
    },
    {
      id: "obj-a1-3-4",
      stableCode: "A1.3.4",
      skill: "vocabulary",
      canDoStatement: "Puedo nombrar alimentos y artículos básicos de una tienda.",
      levelCode: "A1",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "At the store",
    moduleTitle: "Módulo 2 — La tienda y la comida",
    levelCode: "A1",
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
          "Vas a poder comprar en una tienda: preguntar precios, pedir alimentos usando 'some/any', y entender una conversación típica de tienda.",
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
          { speaker: "A", text: "Hi, do you have any apples?" },
          { speaker: "B", text: "Yes, we have some apples. Do you need anything else?" },
          { speaker: "A", text: "Yes, some bread and some milk, please." },
          { speaker: "B", text: "Sure. That's eight dollars." },
        ],
        notes: [
          "some = afirmativo/peticiones (we have some apples)",
          "any = negativo/preguntas (do you have any apples?)",
          "bread y milk son incontables: no se dice 'a bread', se dice 'some bread'.",
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
          { speaker: "A", text: "Do you have any eggs?" },
          { speaker: "B", text: "Sorry, we don't have any eggs today." },
          { speaker: "A", text: "That's okay. Some rice and some cheese, please." },
          { speaker: "B", text: "Here you are. That's twelve dollars." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿Tenían huevos? (responde en inglés: yes/no)",
            objectiveId: "obj-a1-3-3",
            expectedKeywords: ["no"],
          },
          {
            id: "q2",
            prompt: "¿Cuánto pagó en total? (en inglés)",
            objectiveId: "obj-a1-3-3",
            expectedKeywords: ["twelve", "12"],
          },
        ],
      },
      objectiveIds: ["obj-a1-3-3"],
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
          { phrase: "Do you have any apples?", note: "any en preguntas." },
          { phrase: "We have some apples.", note: "some en afirmaciones y ofertas/peticiones." },
          { phrase: "bread, milk, rice, cheese", note: "sustantivos incontables frecuentes de comida." },
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
          { id: "s1", template: "Do you have ___ bananas?", answer: "any", hint: "pregunta" },
          { id: "s2", template: "We have ___ milk.", answer: "some", hint: "afirmación" },
          { id: "s3", template: "Can I have ___ rice, please?", answer: "some", hint: "petición" },
        ],
      },
      objectiveIds: ["obj-a1-3-2"],
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
        prompt: "Sin mirar el paso 2, escribe de memoria cómo se pregunta por un alimento y cómo se pide.",
        expectedKeywords: ["do you have any", "some"],
      },
      objectiveIds: ["obj-a1-3-1"],
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
          "Escribe un diálogo corto comprando 3 alimentos en una tienda, usando 'some' y 'any'. Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-a1-3-1", "obj-a1-3-4"],
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
        tutorLine: "Hello! What can I get for you today?",
        instructions:
          "Pide algo de comer usando 'some'. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (sexta vez que practicas esto, ya en una tienda distinta).",
        secondTutorLine: "Ok, tht's gnna be fftn bcks, is tht alrght?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["some"],
        firstTaskLabel: "Pedir el alimento",
      },
      objectiveIds: ["obj-a1-3-1", "obj-prea1-2-3"],
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

// ======================= A2 · Módulo 2 · Unidad 1 =======================
// "At the restaurant" — recicla "pedir repetición" por séptima vez.
const A2_2_1 = (() => {
  const unitId = "unit-a2-2-1";
  const base = "a2-2-1";
  const objs: Objective[] = [
    {
      id: "obj-a2-2-1",
      stableCode: "A2.2.1",
      skill: "speaking",
      canDoStatement: "Puedo pedir comida en un restaurante haciendo peticiones corteses.",
      levelCode: "A2",
    },
    {
      id: "obj-a2-2-2",
      stableCode: "A2.2.2",
      skill: "grammar",
      canDoStatement: "Puedo usar 'would like' y comparativos para expresar preferencias.",
      levelCode: "A2",
    },
    {
      id: "obj-a2-2-3",
      stableCode: "A2.2.3",
      skill: "listening",
      canDoStatement: "Puedo entender a un mesero tomando una orden.",
      levelCode: "A2",
    },
    {
      id: "obj-a2-2-4",
      stableCode: "A2.2.4",
      skill: "vocabulary",
      canDoStatement: "Puedo nombrar comidas y bebidas comunes y describir sabores.",
      levelCode: "A2",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "At the restaurant",
    moduleTitle: "Módulo 2 — Viajes y servicios",
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
          "Vas a poder pedir comida en un restaurante de forma educada, usando 'would like' y comparando opciones ('this is sweeter than that').",
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
          { speaker: "Waiter", text: "Good evening! What would you like to drink?" },
          { speaker: "Customer", text: "I'd like a lemonade, please. Is it sweeter than the orange juice?" },
          { speaker: "Waiter", text: "Yes, a little sweeter." },
          { speaker: "Customer", text: "Great, I'll have that, then." },
        ],
        notes: [
          "I'd like... = quisiera... (más educado que 'I want')",
          "sweeter than = comparativo de 'sweet'",
          "I'll have that = pedido final, decisión tomada",
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
          { speaker: "Waiter", text: "Are you ready to order?" },
          { speaker: "Customer", text: "Yes, I'd like the chicken soup, please." },
          { speaker: "Waiter", text: "Would you like anything to drink?" },
          { speaker: "Customer", text: "Just water, thanks. Is the soup spicier than the salad?" },
          { speaker: "Waiter", text: "A little, yes." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿Qué pidió de comer? (en inglés)",
            objectiveId: "obj-a2-2-3",
            expectedKeywords: ["chicken soup", "soup"],
          },
          {
            id: "q2",
            prompt: "¿Qué pidió de tomar? (en inglés)",
            objectiveId: "obj-a2-2-3",
            expectedKeywords: ["water"],
          },
        ],
      },
      objectiveIds: ["obj-a2-2-3"],
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
          { phrase: "I'd like... / Would you like...?", note: "Forma educada de pedir y ofrecer." },
          { phrase: "sweeter than, spicier than", note: "Comparativo: adjetivo corto + -er + than." },
          { phrase: "I'll have that, then.", note: "Frase fija para cerrar un pedido." },
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
          { id: "s1", template: "I ___ like the fish, please. (would)", answer: "'d", hint: "contracción de would" },
          { id: "s2", template: "This soup is ___ (spicy) than that one.", answer: "spicier", hint: "comparativo de spicy" },
          { id: "s3", template: "___ you like anything to drink?", answer: "Would", hint: "oferta educada" },
        ],
      },
      objectiveIds: ["obj-a2-2-2"],
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
        prompt: "Sin mirar el paso 2, reconstruye cómo el cliente pide su bebida y la compara con otra opción.",
        expectedKeywords: ["i'd like", "than"],
      },
      objectiveIds: ["obj-a2-2-1", "obj-a2-2-2"],
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
          "Escribe cómo pedirías una comida y una bebida en un restaurante, comparando dos opciones con un comparativo. Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-a2-2-1", "obj-a2-2-4"],
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
        tutorLine: "Good evening! Are you ready to order?",
        instructions:
          "Pide algo de comer usando 'I'd like...'. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (séptima vez que practicas esto).",
        secondTutorLine: "Sure, nd wld y lke smthng t drnk wth tht?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["i'd like", "i would like"],
        firstTaskLabel: "Pedir la comida",
      },
      objectiveIds: ["obj-a2-2-1", "obj-prea1-2-3"],
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

// ======================= B1 · Módulo 1 · Unidad 1 =======================
// "What's your opinion?" — primer contenido de B1, el siguiente nivel más
// allá de lo construido hasta ahora. Recicla "pedir repetición" por octava
// vez, probando que el patrón escala incluso a un nivel nuevo.
const B1_1_1 = (() => {
  const unitId = "unit-b1-1-1";
  const base = "b1-1-1";
  const objs: Objective[] = [
    {
      id: "obj-b1-1-1",
      stableCode: "B1.1.1",
      skill: "speaking",
      canDoStatement: "Puedo dar mi opinión sobre un tema y justificarla con una razón.",
      levelCode: "B1",
    },
    {
      id: "obj-b1-1-2",
      stableCode: "B1.1.2",
      skill: "grammar",
      canDoStatement: "Puedo distinguir cuándo usar presente perfecto vs. pasado simple.",
      levelCode: "B1",
    },
    {
      id: "obj-b1-1-3",
      stableCode: "B1.1.3",
      skill: "listening",
      canDoStatement: "Puedo identificar la opinión principal y un argumento en un audio breve.",
      levelCode: "B1",
    },
    {
      id: "obj-b1-1-4",
      stableCode: "B1.1.4",
      skill: "vocabulary",
      canDoStatement: "Puedo usar conectores de opinión (I think, in my opinion, on the other hand).",
      levelCode: "B1",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "What's your opinion?",
    moduleTitle: "Módulo 1 — Opinar y resolver",
    levelCode: "B1",
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
          "Vas a poder dar tu opinión sobre un tema y justificarla, distinguiendo cuándo usar presente perfecto ('I have never tried it') vs. pasado simple ('I tried it last year').",
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
          { speaker: "A", text: "In my opinion, working from home is better for most people." },
          { speaker: "B", text: "Why do you think that?" },
          { speaker: "A", text: "Because I've worked from home for two years, and I'm more productive." },
          { speaker: "B", text: "That's interesting. I worked from home last year, but I didn't like it." },
          { speaker: "A", text: "On the other hand, it depends on the job." },
        ],
        notes: [
          "In my opinion... / I think... = para introducir una opinión.",
          "I've worked from home for two years = presente perfecto (sigue siendo verdad, duración hasta ahora).",
          "I worked from home last year = pasado simple (terminado, momento específico).",
          "On the other hand = por otro lado (para matizar).",
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
          { speaker: "A", text: "I think social media has more negative effects than positive ones." },
          { speaker: "B", text: "Why?" },
          { speaker: "A", text: "Because I've seen a lot of people feel more anxious because of it." },
          { speaker: "B", text: "On the other hand, I made great friends online last year." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿Cuál es la opinión principal de A sobre las redes sociales? (en inglés, una palabra basta: positive/negative)",
            objectiveId: "obj-b1-1-3",
            expectedKeywords: ["negative"],
          },
          {
            id: "q2",
            prompt: "¿Qué razón da A para esa opinión? (en inglés)",
            objectiveId: "obj-b1-1-3",
            expectedKeywords: ["anxious"],
          },
        ],
      },
      objectiveIds: ["obj-b1-1-3"],
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
          { phrase: "I've worked from home for two years.", note: "Presente perfecto: empezó en el pasado y sigue siendo cierto." },
          { phrase: "I worked from home last year.", note: "Pasado simple: terminado, momento específico (last year)." },
          { phrase: "I think / In my opinion / On the other hand", note: "Conectores de opinión." },
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
          {
            id: "s1",
            template: "I ___ (live) in this city for five years. (sigue viviendo ahí)",
            answer: "have lived",
            hint: "presente perfecto: continúa siendo verdad",
          },
          {
            id: "s2",
            template: "I ___ (visit) Mexico in 2022. (terminado, momento específico)",
            answer: "visited",
            hint: "pasado simple",
          },
          {
            id: "s3",
            template: "___ my opinion, this is the best option.",
            answer: "In",
            hint: "In my opinion",
          },
        ],
      },
      objectiveIds: ["obj-b1-1-2"],
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
        prompt:
          "Sin mirar el paso 2, escribe de memoria cómo A da su opinión y la justifica, y cómo B la matiza con 'on the other hand'.",
        expectedKeywords: ["in my opinion", "because", "on the other hand"],
      },
      objectiveIds: ["obj-b1-1-1", "obj-b1-1-4"],
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
          "Da tu opinión sobre un tema (por ejemplo: el teletrabajo, las redes sociales, o algo que elijas) y justifícala con una razón, usando al menos un conector de opinión. Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-b1-1-1", "obj-b1-1-4"],
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
        tutorLine: "What's your opinion on learning a new language as an adult — is it harder than as a child?",
        instructions:
          "Da tu opinión y justifícala. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (octava vez que practicas esto, ahora en una conversación de opinión en B1).",
        secondTutorLine: "Intrstng point. Nd hw lng hv y ben studyng Englsh yrself?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["i think", "in my opinion", "because"],
        firstTaskLabel: "Dar tu opinión",
      },
      objectiveIds: ["obj-b1-1-1", "obj-prea1-2-3"],
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

// ======================= A2 · Módulo 3 · Unidad 1 =======================
// "At the doctor's" — recicla "pedir repetición" por novena vez.
const A2_3_1 = (() => {
  const unitId = "unit-a2-3-1";
  const base = "a2-3-1";
  const objs: Objective[] = [
    {
      id: "obj-a2-3-1",
      stableCode: "A2.3.1",
      skill: "speaking",
      canDoStatement: "Puedo describir síntomas básicos de salud.",
      levelCode: "A2",
    },
    {
      id: "obj-a2-3-2",
      stableCode: "A2.3.2",
      skill: "grammar",
      canDoStatement: "Puedo usar imperativos para dar y entender consejos (Drink water, Take this medicine).",
      levelCode: "A2",
    },
    {
      id: "obj-a2-3-3",
      stableCode: "A2.3.3",
      skill: "listening",
      canDoStatement: "Puedo entender instrucciones básicas de un doctor.",
      levelCode: "A2",
    },
    {
      id: "obj-a2-3-4",
      stableCode: "A2.3.4",
      skill: "vocabulary",
      canDoStatement: "Puedo nombrar partes del cuerpo y síntomas comunes.",
      levelCode: "A2",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "At the doctor's",
    moduleTitle: "Módulo 3 — Salud",
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
          "Vas a poder describir cómo te sientes cuando estás enfermo, entender el consejo de un doctor, y nombrar partes del cuerpo.",
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
          { speaker: "Doctor", text: "What's the problem?" },
          { speaker: "Patient", text: "I have a headache and a sore throat." },
          { speaker: "Doctor", text: "Do you have a fever?" },
          { speaker: "Patient", text: "Yes, a little." },
          { speaker: "Doctor", text: "Drink a lot of water and rest. Take this medicine twice a day." },
        ],
        notes: [
          "I have a headache / a sore throat / a fever = tengo dolor de cabeza / de garganta / fiebre.",
          "Drink... / Take... / Rest = imperativos para dar consejos (sin sujeto).",
          "twice a day = dos veces al día.",
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
          { speaker: "Doctor", text: "What's wrong?" },
          { speaker: "Patient", text: "My stomach hurts, and I feel dizzy." },
          { speaker: "Doctor", text: "Don't eat heavy food today. Drink tea, and come back tomorrow if it doesn't improve." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿Qué le duele al paciente? (en inglés)",
            objectiveId: "obj-a2-3-3",
            expectedKeywords: ["stomach"],
          },
          {
            id: "q2",
            prompt: "¿Qué consejo le da el doctor sobre la comida? (en inglés)",
            objectiveId: "obj-a2-3-3",
            expectedKeywords: ["don't eat", "heavy food"],
          },
        ],
      },
      objectiveIds: ["obj-a2-3-3"],
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
          { phrase: "Drink water. / Don't eat heavy food.", note: "Imperativo afirmativo y negativo — sin sujeto." },
          { phrase: "head, throat, stomach, back", note: "Partes del cuerpo frecuentes." },
          { phrase: "I feel dizzy / sick / tired", note: "feel + adjetivo, para describir cómo te sientes." },
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
          { id: "s1", template: "___ (drink) a lot of water. (consejo afirmativo)", answer: "Drink", hint: "imperativo" },
          { id: "s2", template: "___ (not/eat) heavy food. (consejo negativo)", answer: "Don't eat", hint: "imperativo negativo" },
          { id: "s3", template: "I have a sore ___ (garganta).", answer: "throat", hint: "parte del cuerpo" },
        ],
      },
      objectiveIds: ["obj-a2-3-2"],
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
        prompt: "Sin mirar el paso 2, escribe de memoria los síntomas del paciente y el consejo del doctor.",
        expectedKeywords: ["headache", "drink", "rest"],
      },
      objectiveIds: ["obj-a2-3-1"],
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
          "Describe cómo te sientes cuando estás resfriado (2-3 síntomas) y escribe un consejo usando el imperativo. Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-a2-3-1", "obj-a2-3-4"],
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
        tutorLine: "Hi, what's the problem today?",
        instructions:
          "Describe un síntoma (por ejemplo, 'I have a headache'). Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (novena vez que practicas esto).",
        secondTutorLine: "Ok, tke ths twce a dy nd cme bck n a wek if it dsn't mprve.",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["i have", "i feel"],
        firstTaskLabel: "Describir el síntoma",
      },
      objectiveIds: ["obj-a2-3-1", "obj-prea1-2-3"],
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

// ======================= B1 · Módulo 2 · Unidad 1 =======================
// "Have you ever...?" — recicla "pedir repetición" por décima vez.
const B1_2_1 = (() => {
  const unitId = "unit-b1-2-1";
  const base = "b1-2-1";
  const objs: Objective[] = [
    {
      id: "obj-b1-2-1",
      stableCode: "B1.2.1",
      skill: "speaking",
      canDoStatement: "Puedo contar experiencias de vida usando presente perfecto con ever/never.",
      levelCode: "B1",
    },
    {
      id: "obj-b1-2-2",
      stableCode: "B1.2.2",
      skill: "grammar",
      canDoStatement: "Puedo formar preguntas y respuestas con 'Have you ever...?'.",
      levelCode: "B1",
    },
    {
      id: "obj-b1-2-3",
      stableCode: "B1.2.3",
      skill: "listening",
      canDoStatement: "Puedo entender a alguien contando una experiencia de vida.",
      levelCode: "B1",
    },
    {
      id: "obj-b1-2-4",
      stableCode: "B1.2.4",
      skill: "vocabulary",
      canDoStatement: "Puedo usar adverbios de experiencia (ever, never, already, yet).",
      levelCode: "B1",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "Have you ever...?",
    moduleTitle: "Módulo 2 — Experiencias de vida",
    levelCode: "B1",
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
          "Vas a poder preguntar y contar experiencias de vida con 'Have you ever...?', y usar 'ever/never/already/yet' con precisión.",
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
          { speaker: "A", text: "Have you ever traveled alone?" },
          { speaker: "B", text: "Yes, I have. I've already traveled alone twice." },
          { speaker: "A", text: "Have you ever lived in another country?" },
          { speaker: "B", text: "No, I haven't. Not yet, but I'd like to." },
        ],
        notes: [
          "Have you ever...? = ¿Alguna vez has...? (experiencia en algún momento de la vida)",
          "I've already... = Ya he... (se completó antes de lo esperado)",
          "Not yet = Todavía no (se esperaba, no ha pasado)",
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
          { speaker: "A", text: "Have you ever tried sushi?" },
          { speaker: "B", text: "Yes, I have. I've already tried it three times, actually." },
          { speaker: "A", text: "Have you ever been to Japan?" },
          { speaker: "B", text: "No, I haven't. Never. But I really want to go." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿Cuántas veces ha probado sushi B? (en inglés)",
            objectiveId: "obj-b1-2-3",
            expectedKeywords: ["three", "3"],
          },
          {
            id: "q2",
            prompt: "¿Ha estado B en Japón? (responde yes/no en inglés)",
            objectiveId: "obj-b1-2-3",
            expectedKeywords: ["no"],
          },
        ],
      },
      objectiveIds: ["obj-b1-2-3"],
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
          { phrase: "Have you ever...?", note: "Pregunta sobre experiencia alguna vez en la vida, sin momento específico." },
          { phrase: "I've already... / Not yet.", note: "already = ya (afirmativo); yet = todavía (negativo/preguntas)." },
          { phrase: "No, I haven't. Never.", note: "never refuerza la negación — nunca." },
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
          { id: "s1", template: "___ you ever visited Europe?", answer: "Have", hint: "pregunta de experiencia" },
          { id: "s2", template: "I've ___ finished my homework. (ya)", answer: "already", hint: "completado antes de lo esperado" },
          { id: "s3", template: "I haven't done it ___. (todavía)", answer: "yet", hint: "negativo" },
        ],
      },
      objectiveIds: ["obj-b1-2-2"],
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
        prompt: "Sin mirar el paso 2, reconstruye las dos preguntas con 'Have you ever...?' y sus respuestas.",
        expectedKeywords: ["have you ever", "already", "not yet"],
      },
      objectiveIds: ["obj-b1-2-1", "obj-b1-2-4"],
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
          "Escribe 2-3 preguntas con 'Have you ever...?' sobre experiencias de vida, y responde una de ellas sobre ti mismo. Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-b1-2-1", "obj-b1-2-2"],
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
        tutorLine: "Have you ever done something really adventurous?",
        instructions:
          "Responde contando una experiencia (real o inventada). Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (décima vez que practicas esto).",
        secondTutorLine: "Wow, nd hw dd y fl aftrwrds?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["i have", "i've", "yes", "no"],
        firstTaskLabel: "Contar la experiencia",
      },
      objectiveIds: ["obj-b1-2-1", "obj-prea1-2-3"],
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

// ======================= B2 · Módulo 1 · Unidad 1 =======================
// "I might be wrong, but..." — primer contenido de B2, el hito de autonomía
// comunicativa del programa. Recicla "pedir repetición" por undécima vez,
// realizado de forma más sofisticada (pedir que se aclare, no solo repetir).
const B2_1_1 = (() => {
  const unitId = "unit-b2-1-1";
  const base = "b2-1-1";
  const objs: Objective[] = [
    {
      id: "obj-b2-1-1",
      stableCode: "B2.1.1",
      skill: "speaking",
      canDoStatement: "Puedo argumentar una postura matizándola (to some extent, arguably).",
      levelCode: "B2",
    },
    {
      id: "obj-b2-1-2",
      stableCode: "B2.1.2",
      skill: "grammar",
      canDoStatement: "Puedo usar modales de deducción en pasado (must have, might have, can't have).",
      levelCode: "B2",
    },
    {
      id: "obj-b2-1-3",
      stableCode: "B2.1.3",
      skill: "listening",
      canDoStatement: "Puedo inferir qué tan seguro está un hablante a partir de los modales que usa.",
      levelCode: "B2",
    },
    {
      id: "obj-b2-1-4",
      stableCode: "B2.1.4",
      skill: "vocabulary",
      canDoStatement: "Puedo usar lenguaje de matización (to some extent, arguably, on balance).",
      levelCode: "B2",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "I might be wrong, but...",
    moduleTitle: "Módulo 1 — Argumentar con matices",
    levelCode: "B2",
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
          "Vas a poder argumentar con matices (no todo es blanco o negro), y usar modales de deducción en pasado para especular sobre lo que probablemente pasó.",
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
          { speaker: "A", text: "To some extent, I agree that remote work is more productive." },
          { speaker: "B", text: "Why do you say 'to some extent'?" },
          { speaker: "A", text: "Well, it arguably depends on the job. She must have worked remotely before — she's really good at it." },
          { speaker: "B", text: "True, she can't have learned that overnight." },
        ],
        notes: [
          "To some extent = hasta cierto punto (matiza sin negar del todo).",
          "arguably = podría decirse que (opinión defendible, no un hecho).",
          "must have worked = seguramente trabajó (deducción fuerte sobre el pasado).",
          "can't have learned = no puede ser que haya aprendido (deducción negativa fuerte).",
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
          { speaker: "A", text: "The lights are off and the car is gone. They must have left already." },
          { speaker: "B", text: "They might have left, or they could just be out for a walk." },
          { speaker: "A", text: "No, they can't have gone for a walk — they took the car." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿Qué tan seguro está A de que se fueron? (en inglés: seguro/posible — certain/possible)",
            objectiveId: "obj-b2-1-3",
            expectedKeywords: ["certain", "sure"],
          },
          {
            id: "q2",
            prompt: "¿Por qué A descarta que salieron a caminar? (en inglés)",
            objectiveId: "obj-b2-1-3",
            expectedKeywords: ["car", "took the car"],
          },
        ],
      },
      objectiveIds: ["obj-b2-1-3"],
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
          { phrase: "must have + participio", note: "Deducción fuerte afirmativa: seguramente pasó." },
          { phrase: "might/could have + participio", note: "Deducción posible, no segura." },
          { phrase: "can't have + participio", note: "Deducción negativa fuerte: es imposible que haya pasado." },
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
          { id: "s1", template: "She's not answering. She ___ (must/be) busy.", answer: "must be", hint: "deducción presente" },
          { id: "s2", template: "He ___ (must/leave) early — his car isn't here. (pasado)", answer: "must have left", hint: "deducción fuerte pasado" },
          { id: "s3", template: "That ___ (can't/be) true — I just saw her yesterday. (pasado)", answer: "can't have been", hint: "deducción negativa pasado" },
        ],
      },
      objectiveIds: ["obj-b2-1-2"],
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
        prompt: "Sin mirar el paso 2, reconstruye cómo A matiza su opinión y cómo usa un modal de deducción sobre el pasado.",
        expectedKeywords: ["to some extent", "must have"],
      },
      objectiveIds: ["obj-b2-1-1", "obj-b2-1-4"],
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
          "Da tu opinión sobre un tema matizándola con 'to some extent' o 'arguably', y especula sobre algo del pasado usando 'must have' o 'might have'. Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-b2-1-1", "obj-b2-1-2"],
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
        tutorLine: "Do you think technology has made people more isolated?",
        instructions:
          "Da tu opinión matizándola (por ejemplo, 'to some extent...'). Luego el sistema va a decir algo difícil de entender — en este nivel, en vez de solo pedir que repitan, pide que te lo aclaren o reformulen ('Could you clarify what you mean by that?').",
        secondTutorLine: "Rght, bt dsn't tht dpnd on hw ppl use it?",
        expectedRepetitionKeywords: ["clarify", "elaborate", "mean by that", "could you explain"],
        expectedOriginKeywords: ["to some extent", "arguably", "i think"],
        firstTaskLabel: "Dar tu opinión matizada",
      },
      objectiveIds: ["obj-b2-1-1", "obj-prea1-2-3"],
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

// ======================= C1 · Módulo 1 · Unidad 1 =======================
// "Precision and nuance" — primer contenido de C1, el objetivo principal del
// programa. Recicla "pedir repetición" por duodécima vez, ya como una
// habilidad de mediación más sofisticada (reformular con precisión).
const C1_1_1 = (() => {
  const unitId = "unit-c1-1-1";
  const base = "c1-1-1";
  const objs: Objective[] = [
    {
      id: "obj-c1-1-1",
      stableCode: "C1.1.1",
      skill: "speaking",
      canDoStatement: "Puedo reformular una idea eligiendo la palabra exacta en vez de una aproximada.",
      levelCode: "C1",
    },
    {
      id: "obj-c1-1-2",
      stableCode: "C1.1.2",
      skill: "grammar",
      canDoStatement: "Puedo usar estructuras de énfasis (It's... that..., What I need is...) con precisión.",
      levelCode: "C1",
    },
    {
      id: "obj-c1-1-3",
      stableCode: "C1.1.3",
      skill: "reading",
      canDoStatement: "Puedo identificar connotación o ironía en un texto breve, sin apoyos.",
      levelCode: "C1",
    },
    {
      id: "obj-c1-1-4",
      stableCode: "C1.1.4",
      skill: "vocabulary",
      canDoStatement: "Puedo usar colocaciones avanzadas de uso frecuente con precisión (reach a conclusion, draw a parallel).",
      levelCode: "C1",
    },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = {
    id: unitId,
    title: "Precision and nuance",
    moduleTitle: "Módulo 1 — Precisión y fluidez",
    levelCode: "C1",
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
          "Vas a poder elegir la palabra exacta en vez de la aproximada, usar estructuras de énfasis para dar precisión a una idea, y detectar connotación o ironía en un texto.",
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-2`,
      unitId,
      stepNumber: 2,
      stepName: "Ejemplo resuelto",
      type: "worked_example",
      skill: "reading",
      pool: "practice",
      baseItemId: `${base}-step2`,
      content: {
        dialogue: [
          { speaker: "Texto", text: "\"Oh, great, another meeting that could have been an email,\" she said, checking her watch for the third time." },
        ],
        notes: [
          "'Oh, great' aquí es irónico — el contexto (revisar el reloj, 'podría haber sido un correo') indica frustración, no entusiasmo real.",
          "It's precision, not fluency, that separates a good writer from a great one. = estructura de énfasis con 'It's... that...' para resaltar 'precision'.",
          "What I need is a clear answer, not more questions. = 'What I need is...' enfatiza la necesidad específica.",
        ],
      },
      objectiveIds: [],
    },
    {
      id: `act-${base}-3`,
      unitId,
      stepNumber: 3,
      stepName: "Lectura en contexto",
      type: "contextualized_input",
      skill: "reading",
      pool: "practice",
      baseItemId: `${base}-step3`,
      content: {
        dialogue: [
          {
            speaker: "Texto",
            text: "\"Wonderful,\" he muttered, staring at the fourth error message of the morning. \"Exactly what I needed today.\"",
          },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿La palabra 'Wonderful' se usa de forma literal o irónica aquí? (en inglés: literal/ironic)",
            objectiveId: "obj-c1-1-3",
            expectedKeywords: ["ironic"],
          },
          {
            id: "q2",
            prompt: "¿Qué palabra del texto da la pista de que no está contento? (en inglés)",
            objectiveId: "obj-c1-1-3",
            expectedKeywords: ["muttered", "error"],
          },
        ],
      },
      objectiveIds: ["obj-c1-1-3"],
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
          { phrase: "It's precision that matters most.", note: "Estructura de énfasis: 'It's + [foco] + that...' resalta un elemento." },
          { phrase: "What I need is clarity.", note: "'What I need is...' enfatiza una necesidad específica." },
          { phrase: "reach a conclusion, draw a parallel", note: "Colocaciones avanzadas — no se dicen 'arrive a conclusion' ni 'make a parallel'." },
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
          { id: "s1", template: "It's honesty ___ I value most in a friend.", answer: "that", hint: "estructura de énfasis" },
          { id: "s2", template: "What I need ___ more time, not more resources.", answer: "is", hint: "What I need is..." },
          { id: "s3", template: "After reviewing the data, we were able to ___ a conclusion. (reach/arrive)", answer: "reach", hint: "colocación correcta" },
        ],
      },
      objectiveIds: ["obj-c1-1-2", "obj-c1-1-4"],
    },
    {
      id: `act-${base}-6`,
      unitId,
      stepNumber: 6,
      stepName: "Recuperación sin apoyo",
      type: "unaided_retrieval",
      skill: "reading",
      pool: "practice",
      baseItemId: `${base}-step6`,
      content: {
        prompt: "Sin mirar el paso 3, explica en inglés por qué 'Wonderful' era irónico en ese texto.",
        expectedKeywords: ["ironic", "not happy", "frustrat"],
      },
      objectiveIds: ["obj-c1-1-3"],
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
          "Escribe 2-3 frases sobre algo que te importa, usando una estructura de énfasis ('It's... that...' o 'What I need is...') y al menos una colocación precisa (reach a conclusion, draw a parallel, etc.). Puedes grabarte o escribirlo.",
      },
      objectiveIds: ["obj-c1-1-1", "obj-c1-1-2"],
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
        tutorLine: "What's one thing you'd change about how people learn languages today?",
        instructions:
          "Responde usando una estructura de énfasis para dar precisión a tu idea (por ejemplo, 'What I'd change is...'). Luego el sistema va a decir algo difícil de entender — pide que te lo reformulen o aclaren, con precisión (duodécima vez que practicas esta función, ya como mediación).",
        secondTutorLine: "Fr, bt hw wld y mplmnt tht n prctice, exctly?",
        expectedRepetitionKeywords: ["clarify", "elaborate", "rephrase", "could you explain", "what do you mean"],
        expectedOriginKeywords: ["what i'd change", "what i would change", "it's"],
        firstTaskLabel: "Dar tu idea con precisión",
      },
      objectiveIds: ["obj-c1-1-1", "obj-prea1-2-3"],
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

// ======================= A1 · Módulo 3 · Unidad 1 =======================
// "My apartment" — recicla "pedir repetición" por decimotercera vez.
const A1_4_1 = (() => {
  const unitId = "unit-a1-4-1";
  const base = "a1-4-1";
  const objs: Objective[] = [
    { id: "obj-a1-4-1", stableCode: "A1.4.1", skill: "speaking", canDoStatement: "Puedo describir mi casa o apartamento usando 'there is/are'.", levelCode: "A1" },
    { id: "obj-a1-4-2", stableCode: "A1.4.2", skill: "grammar", canDoStatement: "Puedo usar preposiciones de lugar (in, on, under, next to).", levelCode: "A1" },
    { id: "obj-a1-4-3", stableCode: "A1.4.3", skill: "listening", canDoStatement: "Puedo entender la descripción de una vivienda.", levelCode: "A1" },
    { id: "obj-a1-4-4", stableCode: "A1.4.4", skill: "vocabulary", canDoStatement: "Puedo nombrar habitaciones y muebles básicos.", levelCode: "A1" },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = { id: unitId, title: "My apartment", moduleTitle: "Módulo 3 — Vivienda", levelCode: "A1", sortOrder: 1 };
  const acts: Activity[] = [
    { id: `act-${base}-1`, unitId, stepNumber: 1, stepName: "Qué aprenderás", type: "info", skill: "speaking", pool: "practice", baseItemId: `${base}-step1`, content: { body: "Vas a poder describir tu casa: qué habitaciones tiene y dónde están los muebles, usando 'there is/are' y preposiciones de lugar." }, objectiveIds: [] },
    { id: `act-${base}-2`, unitId, stepNumber: 2, stepName: "Ejemplo resuelto", type: "worked_example", skill: "speaking", pool: "practice", baseItemId: `${base}-step2`, content: {
      dialogue: [
        { speaker: "A", text: "What's your apartment like?" },
        { speaker: "B", text: "There are two bedrooms and one bathroom. The sofa is next to the window." },
        { speaker: "A", text: "Is there a kitchen?" },
        { speaker: "B", text: "Yes, there is. It's small, but there's a table in it." },
      ],
      notes: ["There is + singular, There are + plural.", "next to, in, on, under = preposiciones de lugar.", "bedroom, bathroom, kitchen, living room = habitaciones."],
    }, objectiveIds: [] },
    { id: `act-${base}-3`, unitId, stepNumber: 3, stepName: "Escucha en contexto", type: "contextualized_input", skill: "listening", pool: "practice", baseItemId: `${base}-step3`, content: {
      dialogue: [
        { speaker: "A", text: "There's a cat under the table and a lamp on the desk." },
        { speaker: "B", text: "Is there a TV in the living room?" },
        { speaker: "A", text: "Yes, there is. It's next to the window." },
      ],
      questions: [
        { id: "q1", prompt: "¿Dónde está el gato? (en inglés)", objectiveId: "obj-a1-4-3", expectedKeywords: ["under the table"] },
        { id: "q2", prompt: "¿Dónde está la TV? (en inglés)", objectiveId: "obj-a1-4-3", expectedKeywords: ["next to the window"] },
      ],
    }, objectiveIds: ["obj-a1-4-3"] },
    { id: `act-${base}-4`, unitId, stepNumber: 4, stepName: "Observa el lenguaje", type: "language_observation", skill: "grammar", pool: "practice", baseItemId: `${base}-step4`, content: {
      highlights: [
        { phrase: "There is a lamp on the desk.", note: "on = sobre una superficie." },
        { phrase: "There's a cat under the table.", note: "under = debajo de." },
        { phrase: "The sofa is next to the window.", note: "next to = al lado de." },
      ],
    }, objectiveIds: [] },
    { id: `act-${base}-5`, unitId, stepNumber: 5, stepName: "Práctica guiada", type: "guided_practice", skill: "grammar", pool: "practice", baseItemId: `${base}-step5`, content: {
      sentences: [
        { id: "s1", template: "There ___ a bed in my room. (is/are)", answer: "is", hint: "singular" },
        { id: "s2", template: "There ___ two chairs in the kitchen.", answer: "are", hint: "plural" },
        { id: "s3", template: "The book is ___ the table. (sobre)", answer: "on", hint: "superficie" },
      ],
    }, objectiveIds: ["obj-a1-4-2"] },
    { id: `act-${base}-6`, unitId, stepNumber: 6, stepName: "Recuperación sin apoyo", type: "unaided_retrieval", skill: "speaking", pool: "practice", baseItemId: `${base}-step6`, content: {
      prompt: "Sin mirar el paso 2, escribe de memoria cómo describe B su apartamento.",
      expectedKeywords: ["there are", "there's"],
    }, objectiveIds: ["obj-a1-4-1"] },
    { id: `act-${base}-7`, unitId, stepNumber: 7, stepName: "Producción", type: "production", skill: "writing", pool: "practice", baseItemId: `${base}-step7`, content: {
      prompt: "Describe tu casa o apartamento: cuántas habitaciones tiene y dónde está un mueble. Puedes grabarte o escribirlo.",
    }, objectiveIds: ["obj-a1-4-1", "obj-a1-4-4"] },
    { id: `act-${base}-8`, unitId, stepNumber: 8, stepName: "Tarea comunicativa", type: "communicative_task", skill: "speaking", pool: "practice", baseItemId: `${base}-step8`, content: {
      tutorLine: "Tell me about your home — how many rooms does it have?",
      instructions: "Describe tu casa. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (decimotercera vez que practicas esto).",
      secondTutorLine: "Cool, nd whch rm d y lke th mst?",
      expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
      expectedOriginKeywords: ["there is", "there are"],
      firstTaskLabel: "Describir tu casa",
    }, objectiveIds: ["obj-a1-4-1", "obj-prea1-2-3"] },
    { id: `act-${base}-9`, unitId, stepNumber: 9, stepName: "Retroalimentación", type: "feedback", skill: "speaking", pool: "practice", baseItemId: `${base}-step9`, content: {}, objectiveIds: [] },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    reviewStep(unitId, base, objs.map((o) => o.id)),
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= A1 · Módulo 4 · Unidad 1 =======================
// "What's the weather like?" — recicla "pedir repetición" por decimocuarta vez.
const A1_5_1 = (() => {
  const unitId = "unit-a1-5-1";
  const base = "a1-5-1";
  const objs: Objective[] = [
    { id: "obj-a1-5-1", stableCode: "A1.5.1", skill: "speaking", canDoStatement: "Puedo describir el clima y hacer planes según el clima.", levelCode: "A1" },
    { id: "obj-a1-5-2", stableCode: "A1.5.2", skill: "grammar", canDoStatement: "Puedo usar 'going to' para planes basados en el clima.", levelCode: "A1" },
    { id: "obj-a1-5-3", stableCode: "A1.5.3", skill: "listening", canDoStatement: "Puedo entender un pronóstico del clima simple.", levelCode: "A1" },
    { id: "obj-a1-5-4", stableCode: "A1.5.4", skill: "vocabulary", canDoStatement: "Puedo nombrar condiciones climáticas (sunny, rainy, cold, hot).", levelCode: "A1" },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = { id: unitId, title: "What's the weather like?", moduleTitle: "Módulo 4 — Clima y planes", levelCode: "A1", sortOrder: 1 };
  const acts: Activity[] = [
    { id: `act-${base}-1`, unitId, stepNumber: 1, stepName: "Qué aprenderás", type: "info", skill: "speaking", pool: "practice", baseItemId: `${base}-step1`, content: { body: "Vas a poder describir el clima y decir qué vas a hacer según el clima, usando 'going to'." }, objectiveIds: [] },
    { id: `act-${base}-2`, unitId, stepNumber: 2, stepName: "Ejemplo resuelto", type: "worked_example", skill: "speaking", pool: "practice", baseItemId: `${base}-step2`, content: {
      dialogue: [
        { speaker: "A", text: "What's the weather like today?" },
        { speaker: "B", text: "It's sunny and hot. I'm going to go to the beach." },
        { speaker: "A", text: "Sounds great. I'm going to stay home — it's going to rain later." },
      ],
      notes: ["What's the weather like? = ¿Cómo está el clima?", "I'm going to + verbo = plan basado en lo que sabes ahora.", "sunny, hot, rainy, cold, cloudy = condiciones climáticas."],
    }, objectiveIds: [] },
    { id: `act-${base}-3`, unitId, stepNumber: 3, stepName: "Escucha en contexto", type: "contextualized_input", skill: "listening", pool: "practice", baseItemId: `${base}-step3`, content: {
      dialogue: [
        { speaker: "Forecast", text: "Tomorrow will be cold and cloudy, with rain in the afternoon." },
        { speaker: "Forecast", text: "The weekend is going to be sunny and warm." },
      ],
      questions: [
        { id: "q1", prompt: "¿Cómo va a estar el clima mañana? (en inglés)", objectiveId: "obj-a1-5-3", expectedKeywords: ["cold", "cloudy"] },
        { id: "q2", prompt: "¿Cómo va a estar el fin de semana? (en inglés)", objectiveId: "obj-a1-5-3", expectedKeywords: ["sunny", "warm"] },
      ],
    }, objectiveIds: ["obj-a1-5-3"] },
    { id: `act-${base}-4`, unitId, stepNumber: 4, stepName: "Observa el lenguaje", type: "language_observation", skill: "grammar", pool: "practice", baseItemId: `${base}-step4`, content: {
      highlights: [
        { phrase: "I'm going to go to the beach.", note: "going to + verbo: plan ya decidido." },
        { phrase: "It's going to rain.", note: "going to también para predicciones con evidencia (nubes, etc.)." },
      ],
    }, objectiveIds: [] },
    { id: `act-${base}-5`, unitId, stepNumber: 5, stepName: "Práctica guiada", type: "guided_practice", skill: "grammar", pool: "practice", baseItemId: `${base}-step5`, content: {
      sentences: [
        { id: "s1", template: "It's ___ (sunny). I'm going to wear sunglasses.", answer: "sunny", hint: "clima" },
        { id: "s2", template: "I'm ___ (go) to the park tomorrow. (going to)", answer: "going to go", hint: "plan" },
        { id: "s3", template: "Look at those clouds! It's ___ (rain) soon.", answer: "going to rain", hint: "predicción con evidencia" },
      ],
    }, objectiveIds: ["obj-a1-5-2"] },
    { id: `act-${base}-6`, unitId, stepNumber: 6, stepName: "Recuperación sin apoyo", type: "unaided_retrieval", skill: "speaking", pool: "practice", baseItemId: `${base}-step6`, content: {
      prompt: "Sin mirar el paso 2, escribe de memoria el plan de A y B según el clima.",
      expectedKeywords: ["going to", "beach"],
    }, objectiveIds: ["obj-a1-5-1"] },
    { id: `act-${base}-7`, unitId, stepNumber: 7, stepName: "Producción", type: "production", skill: "writing", pool: "practice", baseItemId: `${base}-step7`, content: {
      prompt: "Describe el clima de hoy y di qué vas a hacer usando 'going to'. Puedes grabarte o escribirlo.",
    }, objectiveIds: ["obj-a1-5-1", "obj-a1-5-4"] },
    { id: `act-${base}-8`, unitId, stepNumber: 8, stepName: "Tarea comunicativa", type: "communicative_task", skill: "speaking", pool: "practice", baseItemId: `${base}-step8`, content: {
      tutorLine: "What's the weather like where you are, and what are you going to do today?",
      instructions: "Describe el clima y tu plan. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (decimocuarta vez que practicas esto).",
      secondTutorLine: "Nce! Nd d y nd n mbrlla fr tht?",
      expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
      expectedOriginKeywords: ["going to", "it's"],
      firstTaskLabel: "Describir el clima y tu plan",
    }, objectiveIds: ["obj-a1-5-1", "obj-prea1-2-3"] },
    { id: `act-${base}-9`, unitId, stepNumber: 9, stepName: "Retroalimentación", type: "feedback", skill: "speaking", pool: "practice", baseItemId: `${base}-step9`, content: {}, objectiveIds: [] },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    reviewStep(unitId, base, objs.map((o) => o.id)),
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= A2 · Módulo 4 · Unidad 1 =======================
// "What are you going to do?" — recicla "pedir repetición" por decimoquinta vez.
const A2_4_1 = (() => {
  const unitId = "unit-a2-4-1";
  const base = "a2-4-1";
  const objs: Objective[] = [
    { id: "obj-a2-4-1", stableCode: "A2.4.1", skill: "speaking", canDoStatement: "Puedo hablar de mis planes futuros y preguntar por los de otros.", levelCode: "A2" },
    { id: "obj-a2-4-2", stableCode: "A2.4.2", skill: "grammar", canDoStatement: "Puedo distinguir 'going to' (planes) de 'will' (decisiones espontáneas/predicciones).", levelCode: "A2" },
    { id: "obj-a2-4-3", stableCode: "A2.4.3", skill: "listening", canDoStatement: "Puedo entender planes futuros en una conversación.", levelCode: "A2" },
    { id: "obj-a2-4-4", stableCode: "A2.4.4", skill: "vocabulary", canDoStatement: "Puedo usar expresiones de tiempo futuro (next week, tomorrow, in two days).", levelCode: "A2" },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = { id: unitId, title: "What are you going to do?", moduleTitle: "Módulo 4 — Planes", levelCode: "A2", sortOrder: 1 };
  const acts: Activity[] = [
    { id: `act-${base}-1`, unitId, stepNumber: 1, stepName: "Qué aprenderás", type: "info", skill: "speaking", pool: "practice", baseItemId: `${base}-step1`, content: { body: "Vas a poder hablar de planes futuros y distinguir cuándo usar 'going to' (planeado) vs. 'will' (decidido en el momento)." }, objectiveIds: [] },
    { id: `act-${base}-2`, unitId, stepNumber: 2, stepName: "Ejemplo resuelto", type: "worked_example", skill: "speaking", pool: "practice", baseItemId: `${base}-step2`, content: {
      dialogue: [
        { speaker: "A", text: "What are you going to do next week?" },
        { speaker: "B", text: "I'm going to visit my parents. I planned it last month." },
        { speaker: "A", text: "Nice! I don't have plans yet... I think I'll just relax at home." },
      ],
      notes: ["going to = plan ya decidido antes.", "will (decisión en el momento, mientras hablas) = 'I think I'll...'", "next week, tomorrow, in two days = expresiones de futuro."],
    }, objectiveIds: [] },
    { id: `act-${base}-3`, unitId, stepNumber: 3, stepName: "Escucha en contexto", type: "contextualized_input", skill: "listening", pool: "practice", baseItemId: `${base}-step3`, content: {
      dialogue: [
        { speaker: "A", text: "I'm going to start a new course next month. I signed up yesterday." },
        { speaker: "B", text: "That's great. I haven't decided yet, but I think I'll join too." },
      ],
      questions: [
        { id: "q1", prompt: "¿Cuándo empieza el curso de A? (en inglés)", objectiveId: "obj-a2-4-3", expectedKeywords: ["next month"] },
        { id: "q2", prompt: "¿B ya decidió unirse? (responde yes/no en inglés)", objectiveId: "obj-a2-4-3", expectedKeywords: ["no"] },
      ],
    }, objectiveIds: ["obj-a2-4-3"] },
    { id: `act-${base}-4`, unitId, stepNumber: 4, stepName: "Observa el lenguaje", type: "language_observation", skill: "grammar", pool: "practice", baseItemId: `${base}-step4`, content: {
      highlights: [
        { phrase: "I'm going to visit my parents. I planned it.", note: "going to: ya había un plan." },
        { phrase: "I think I'll just relax.", note: "will: decisión tomada en el momento de hablar." },
      ],
    }, objectiveIds: [] },
    { id: `act-${base}-5`, unitId, stepNumber: 5, stepName: "Práctica guiada", type: "guided_practice", skill: "grammar", pool: "practice", baseItemId: `${base}-step5`, content: {
      sentences: [
        { id: "s1", template: "I already bought the tickets. I ___ (go) to the concert. (planeado)", answer: "'m going to go", hint: "going to" },
        { id: "s2", template: "The phone is ringing. I ___ (answer) it. (decisión espontánea)", answer: "'ll answer", hint: "will" },
        { id: "s3", template: "See you ___ week! (próxima)", answer: "next", hint: "next week" },
      ],
    }, objectiveIds: ["obj-a2-4-2"] },
    { id: `act-${base}-6`, unitId, stepNumber: 6, stepName: "Recuperación sin apoyo", type: "unaided_retrieval", skill: "speaking", pool: "practice", baseItemId: `${base}-step6`, content: {
      prompt: "Sin mirar el paso 2, reconstruye el plan de A y la decisión espontánea de B.",
      expectedKeywords: ["going to", "i'll"],
    }, objectiveIds: ["obj-a2-4-1", "obj-a2-4-2"] },
    { id: `act-${base}-7`, unitId, stepNumber: 7, stepName: "Producción", type: "production", skill: "writing", pool: "practice", baseItemId: `${base}-step7`, content: {
      prompt: "Escribe un plan ya decidido (con 'going to') y una decisión espontánea (con 'will'). Puedes grabarte o escribirlo.",
    }, objectiveIds: ["obj-a2-4-1", "obj-a2-4-4"] },
    { id: `act-${base}-8`, unitId, stepNumber: 8, stepName: "Tarea comunicativa", type: "communicative_task", skill: "speaking", pool: "practice", baseItemId: `${base}-step8`, content: {
      tutorLine: "What are you going to do next weekend?",
      instructions: "Cuenta tu plan. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (decimoquinta vez que practicas esto).",
      secondTutorLine: "Awsm, nd whos gna cme wth y?",
      expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
      expectedOriginKeywords: ["going to", "i'm"],
      firstTaskLabel: "Contar tu plan",
    }, objectiveIds: ["obj-a2-4-1", "obj-prea1-2-3"] },
    { id: `act-${base}-9`, unitId, stepNumber: 9, stepName: "Retroalimentación", type: "feedback", skill: "speaking", pool: "practice", baseItemId: `${base}-step9`, content: {}, objectiveIds: [] },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    reviewStep(unitId, base, objs.map((o) => o.id)),
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= A2 · Módulo 5 · Unidad 1 =======================
// "Can you help me?" — recicla "pedir repetición" por decimosexta vez.
const A2_5_1 = (() => {
  const unitId = "unit-a2-5-1";
  const base = "a2-5-1";
  const objs: Objective[] = [
    { id: "obj-a2-5-1", stableCode: "A2.5.1", skill: "speaking", canDoStatement: "Puedo pedir ayuda con un problema de tecnología.", levelCode: "A2" },
    { id: "obj-a2-5-2", stableCode: "A2.5.2", skill: "grammar", canDoStatement: "Puedo usar 'can/could' para pedir y ofrecer ayuda educadamente.", levelCode: "A2" },
    { id: "obj-a2-5-3", stableCode: "A2.5.3", skill: "listening", canDoStatement: "Puedo entender instrucciones técnicas simples paso a paso.", levelCode: "A2" },
    { id: "obj-a2-5-4", stableCode: "A2.5.4", skill: "vocabulary", canDoStatement: "Puedo nombrar problemas técnicos comunes (it's not working, it's frozen).", levelCode: "A2" },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = { id: unitId, title: "Can you help me?", moduleTitle: "Módulo 5 — Tecnología cotidiana", levelCode: "A2", sortOrder: 1 };
  const acts: Activity[] = [
    { id: `act-${base}-1`, unitId, stepNumber: 1, stepName: "Qué aprenderás", type: "info", skill: "speaking", pool: "practice", baseItemId: `${base}-step1`, content: { body: "Vas a poder pedir ayuda con un problema de tecnología y entender instrucciones paso a paso." }, objectiveIds: [] },
    { id: `act-${base}-2`, unitId, stepNumber: 2, stepName: "Ejemplo resuelto", type: "worked_example", skill: "speaking", pool: "practice", baseItemId: `${base}-step2`, content: {
      dialogue: [
        { speaker: "A", text: "Can you help me? My phone isn't working." },
        { speaker: "B", text: "Sure. Could you turn it off and on again?" },
        { speaker: "A", text: "Okay... it's working now! Thank you." },
      ],
      notes: ["Can you help me? = ¿Me puedes ayudar?", "Could you + verbo? = forma educada de pedir algo.", "It's not working / It's frozen = no funciona / se congeló."],
    }, objectiveIds: [] },
    { id: `act-${base}-3`, unitId, stepNumber: 3, stepName: "Escucha en contexto", type: "contextualized_input", skill: "listening", pool: "practice", baseItemId: `${base}-step3`, content: {
      dialogue: [
        { speaker: "A", text: "My computer is frozen. Can you help?" },
        { speaker: "B", text: "First, wait 10 seconds. Then, press this button for 5 seconds." },
        { speaker: "A", text: "Okay, I did that. It's restarting now." },
      ],
      questions: [
        { id: "q1", prompt: "¿Qué hay que hacer primero? (en inglés)", objectiveId: "obj-a2-5-3", expectedKeywords: ["wait", "10 seconds"] },
        { id: "q2", prompt: "¿Qué hay que hacer después? (en inglés)", objectiveId: "obj-a2-5-3", expectedKeywords: ["press", "button"] },
      ],
    }, objectiveIds: ["obj-a2-5-3"] },
    { id: `act-${base}-4`, unitId, stepNumber: 4, stepName: "Observa el lenguaje", type: "language_observation", skill: "grammar", pool: "practice", baseItemId: `${base}-step4`, content: {
      highlights: [
        { phrase: "Can you help me? / Could you help me?", note: "Could es más formal/educado que Can." },
        { phrase: "First, ... Then, ...", note: "Conectores para dar instrucciones en orden." },
      ],
    }, objectiveIds: [] },
    { id: `act-${base}-5`, unitId, stepNumber: 5, stepName: "Práctica guiada", type: "guided_practice", skill: "grammar", pool: "practice", baseItemId: `${base}-step5`, content: {
      sentences: [
        { id: "s1", template: "___ you help me, please? (educado)", answer: "Could", hint: "más formal que can" },
        { id: "s2", template: "My laptop ___ (not/work).", answer: "isn't working", hint: "no funciona" },
        { id: "s3", template: "It's ___. (congelado)", answer: "frozen", hint: "frozen" },
      ],
    }, objectiveIds: ["obj-a2-5-2"] },
    { id: `act-${base}-6`, unitId, stepNumber: 6, stepName: "Recuperación sin apoyo", type: "unaided_retrieval", skill: "speaking", pool: "practice", baseItemId: `${base}-step6`, content: {
      prompt: "Sin mirar el paso 2, escribe de memoria cómo A pide ayuda y qué le responde B.",
      expectedKeywords: ["can you help", "could you"],
    }, objectiveIds: ["obj-a2-5-1"] },
    { id: `act-${base}-7`, unitId, stepNumber: 7, stepName: "Producción", type: "production", skill: "writing", pool: "practice", baseItemId: `${base}-step7`, content: {
      prompt: "Describe un problema técnico y pide ayuda educadamente con 'Could you...?'. Puedes grabarte o escribirlo.",
    }, objectiveIds: ["obj-a2-5-1", "obj-a2-5-4"] },
    { id: `act-${base}-8`, unitId, stepNumber: 8, stepName: "Tarea comunicativa", type: "communicative_task", skill: "speaking", pool: "practice", baseItemId: `${base}-step8`, content: {
      tutorLine: "What seems to be the problem with your device?",
      instructions: "Describe un problema técnico y pide ayuda. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (decimosexta vez que practicas esto).",
      secondTutorLine: "Ok, trn it ff nd wait tn secnds, thn trn it bck on.",
      expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
      expectedOriginKeywords: ["can you help", "could you help"],
      firstTaskLabel: "Pedir ayuda",
    }, objectiveIds: ["obj-a2-5-1", "obj-prea1-2-3"] },
    { id: `act-${base}-9`, unitId, stepNumber: 9, stepName: "Retroalimentación", type: "feedback", skill: "speaking", pool: "practice", baseItemId: `${base}-step9`, content: {}, objectiveIds: [] },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    reviewStep(unitId, base, objs.map((o) => o.id)),
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= B1 · Módulo 3 · Unidad 1 =======================
// "Is technology making us smarter or lazier?" — recicla "pedir repetición"
// por decimoséptima vez.
const B1_3_1 = (() => {
  const unitId = "unit-b1-3-1";
  const base = "b1-3-1";
  const objs: Objective[] = [
    { id: "obj-b1-3-1", stableCode: "B1.3.1", skill: "speaking", canDoStatement: "Puedo debatir sobre un tema usando condicionales de primer tipo.", levelCode: "B1" },
    { id: "obj-b1-3-2", stableCode: "B1.3.2", skill: "grammar", canDoStatement: "Puedo formar condicionales tipo 1 (if + presente, will + infinitivo).", levelCode: "B1" },
    { id: "obj-b1-3-3", stableCode: "B1.3.3", skill: "listening", canDoStatement: "Puedo entender un argumento con condición-consecuencia.", levelCode: "B1" },
    { id: "obj-b1-3-4", stableCode: "B1.3.4", skill: "vocabulary", canDoStatement: "Puedo usar vocabulario sobre tecnología y sus efectos (dependence, distraction, convenience).", levelCode: "B1" },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = { id: unitId, title: "Is technology making us smarter or lazier?", moduleTitle: "Módulo 3 — Tecnología y medio ambiente", levelCode: "B1", sortOrder: 1 };
  const acts: Activity[] = [
    { id: `act-${base}-1`, unitId, stepNumber: 1, stepName: "Qué aprenderás", type: "info", skill: "speaking", pool: "practice", baseItemId: `${base}-step1`, content: { body: "Vas a poder debatir sobre el efecto de la tecnología usando condicionales tipo 1 (if + presente, will + infinitivo) para hablar de consecuencias reales." }, objectiveIds: [] },
    { id: `act-${base}-2`, unitId, stepNumber: 2, stepName: "Ejemplo resuelto", type: "worked_example", skill: "speaking", pool: "practice", baseItemId: `${base}-step2`, content: {
      dialogue: [
        { speaker: "A", text: "If we keep relying on technology this much, we'll lose basic skills." },
        { speaker: "B", text: "Maybe, but if we use it wisely, it'll make our lives easier." },
        { speaker: "A", text: "That's true, but there's a real risk of dependence." },
      ],
      notes: ["If + presente simple, will + infinitivo = condición real/probable con consecuencia futura.", "dependence, distraction, convenience = vocabulario del tema."],
    }, objectiveIds: [] },
    { id: `act-${base}-3`, unitId, stepNumber: 3, stepName: "Escucha en contexto", type: "contextualized_input", skill: "listening", pool: "practice", baseItemId: `${base}-step3`, content: {
      dialogue: [
        { speaker: "A", text: "If people spend less time outside, they'll feel more isolated." },
        { speaker: "B", text: "But if they use apps to connect with friends, it won't be a problem." },
      ],
      questions: [
        { id: "q1", prompt: "¿Qué consecuencia menciona A? (en inglés)", objectiveId: "obj-b1-3-3", expectedKeywords: ["isolated"] },
        { id: "q2", prompt: "¿Qué condición da B para que no sea un problema? (en inglés)", objectiveId: "obj-b1-3-3", expectedKeywords: ["apps", "connect"] },
      ],
    }, objectiveIds: ["obj-b1-3-3"] },
    { id: `act-${base}-4`, unitId, stepNumber: 4, stepName: "Observa el lenguaje", type: "language_observation", skill: "grammar", pool: "practice", baseItemId: `${base}-step4`, content: {
      highlights: [
        { phrase: "If we keep relying on technology, we'll lose basic skills.", note: "If + presente, will + infinitivo: condicional tipo 1." },
        { phrase: "If they use apps, it won't be a problem.", note: "Forma negativa: won't en la consecuencia." },
      ],
    }, objectiveIds: [] },
    { id: `act-${base}-5`, unitId, stepNumber: 5, stepName: "Práctica guiada", type: "guided_practice", skill: "grammar", pool: "practice", baseItemId: `${base}-step5`, content: {
      sentences: [
        { id: "s1", template: "If I ___ (have) time, I'll learn a new skill.", answer: "have", hint: "if + presente" },
        { id: "s2", template: "If you don't practice, you ___ (not/improve).", answer: "won't improve", hint: "consecuencia negativa" },
        { id: "s3", template: "We'll reduce stress if we ___ (use) technology wisely.", answer: "use", hint: "if + presente" },
      ],
    }, objectiveIds: ["obj-b1-3-2"] },
    { id: `act-${base}-6`, unitId, stepNumber: 6, stepName: "Recuperación sin apoyo", type: "unaided_retrieval", skill: "speaking", pool: "practice", baseItemId: `${base}-step6`, content: {
      prompt: "Sin mirar el paso 2, reconstruye el argumento de A y la respuesta de B usando condicionales.",
      expectedKeywords: ["if", "will"],
    }, objectiveIds: ["obj-b1-3-1", "obj-b1-3-4"] },
    { id: `act-${base}-7`, unitId, stepNumber: 7, stepName: "Producción", type: "production", skill: "writing", pool: "practice", baseItemId: `${base}-step7`, content: {
      prompt: "Da tu opinión sobre el efecto de la tecnología usando al menos un condicional tipo 1 (if + presente, will + infinitivo). Puedes grabarte o escribirlo.",
    }, objectiveIds: ["obj-b1-3-1", "obj-b1-3-2"] },
    { id: `act-${base}-8`, unitId, stepNumber: 8, stepName: "Tarea comunicativa", type: "communicative_task", skill: "speaking", pool: "practice", baseItemId: `${base}-step8`, content: {
      tutorLine: "Do you think technology does more good than harm?",
      instructions: "Argumenta tu postura usando un condicional tipo 1. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (decimoséptima vez que practicas esto).",
      secondTutorLine: "Fr pnt. Bt wht if ppl dn't hve accss t it t ll?",
      expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
      expectedOriginKeywords: ["if", "will"],
      firstTaskLabel: "Argumentar tu postura",
    }, objectiveIds: ["obj-b1-3-1", "obj-prea1-2-3"] },
    { id: `act-${base}-9`, unitId, stepNumber: 9, stepName: "Retroalimentación", type: "feedback", skill: "speaking", pool: "practice", baseItemId: `${base}-step9`, content: {}, objectiveIds: [] },
    scheduleStep(unitId, base, objs.map((o) => o.id)),
    reviewStep(unitId, base, objs.map((o) => o.id)),
  ];
  return { objectives: objs, unit, activities: acts } satisfies UnitDefinition;
})();

// ======================= B1 · Módulo 4 · Unidad 1 =======================
// "People I admire" — recicla "pedir repetición" por decimoctava vez.
const B1_4_1 = (() => {
  const unitId = "unit-b1-4-1";
  const base = "b1-4-1";
  const objs: Objective[] = [
    { id: "obj-b1-4-1", stableCode: "B1.4.1", skill: "speaking", canDoStatement: "Puedo describir a una persona usando cláusulas de relativo (who, that, which).", levelCode: "B1" },
    { id: "obj-b1-4-2", stableCode: "B1.4.2", skill: "grammar", canDoStatement: "Puedo formar oraciones de relativo para dar información adicional.", levelCode: "B1" },
    { id: "obj-b1-4-3", stableCode: "B1.4.3", skill: "listening", canDoStatement: "Puedo entender una descripción detallada de una persona.", levelCode: "B1" },
    { id: "obj-b1-4-4", stableCode: "B1.4.4", skill: "vocabulary", canDoStatement: "Puedo usar adjetivos de personalidad (ambitious, generous, reliable).", levelCode: "B1" },
    REPETITION_OBJECTIVE,
  ];
  const unit: Unit = { id: unitId, title: "People I admire", moduleTitle: "Módulo 4 — Relaciones y noticias", levelCode: "B1", sortOrder: 1 };
  const acts: Activity[] = [
    { id: `act-${base}-1`, unitId, stepNumber: 1, stepName: "Qué aprenderás", type: "info", skill: "speaking", pool: "practice", baseItemId: `${base}-step1`, content: { body: "Vas a poder describir a alguien que admiras usando cláusulas de relativo (who, that, which) y adjetivos de personalidad." }, objectiveIds: [] },
    { id: `act-${base}-2`, unitId, stepNumber: 2, stepName: "Ejemplo resuelto", type: "worked_example", skill: "speaking", pool: "practice", baseItemId: `${base}-step2`, content: {
      dialogue: [
        { speaker: "A", text: "My aunt, who taught me how to cook, is the most generous person I know." },
        { speaker: "B", text: "That's nice. I admire my mentor, who is really reliable and ambitious." },
      ],
      notes: ["who = para personas (sujeto de la cláusula).", "that/which = para cosas.", "generous, reliable, ambitious = adjetivos de personalidad."],
    }, objectiveIds: [] },
    { id: `act-${base}-3`, unitId, stepNumber: 3, stepName: "Escucha en contexto", type: "contextualized_input", skill: "listening", pool: "practice", baseItemId: `${base}-step3`, content: {
      dialogue: [
        { speaker: "A", text: "I admire my grandfather, who worked two jobs to support his family." },
        { speaker: "A", text: "He's the most hardworking and honest person I've ever met." },
      ],
      questions: [
        { id: "q1", prompt: "¿Qué hizo el abuelo? (en inglés)", objectiveId: "obj-b1-4-3", expectedKeywords: ["two jobs", "worked"] },
        { id: "q2", prompt: "¿Qué dos adjetivos usa para describirlo? (en inglés)", objectiveId: "obj-b1-4-3", expectedKeywords: ["hardworking", "honest"] },
      ],
    }, objectiveIds: ["obj-b1-4-3"] },
    { id: `act-${base}-4`, unitId, stepNumber: 4, stepName: "Observa el lenguaje", type: "language_observation", skill: "grammar", pool: "practice", baseItemId: `${base}-step4`, content: {
      highlights: [
        { phrase: "My aunt, who taught me how to cook, is generous.", note: "who introduce información adicional sobre una persona." },
        { phrase: "ambitious, generous, reliable, hardworking, honest", note: "Adjetivos de personalidad frecuentes." },
      ],
    }, objectiveIds: [] },
    { id: `act-${base}-5`, unitId, stepNumber: 5, stepName: "Práctica guiada", type: "guided_practice", skill: "grammar", pool: "practice", baseItemId: `${base}-step5`, content: {
      sentences: [
        { id: "s1", template: "My friend, ___ lives in Canada, called me yesterday. (persona)", answer: "who", hint: "para personas" },
        { id: "s2", template: "The book ___ I read last month was great. (cosa)", answer: "that", hint: "para cosas" },
        { id: "s3", template: "She's very ___ — she always helps others. (generosa)", answer: "generous", hint: "adjetivo" },
      ],
    }, objectiveIds: ["obj-b1-4-2"] },
    { id: `act-${base}-6`, unitId, stepNumber: 6, stepName: "Recuperación sin apoyo", type: "unaided_retrieval", skill: "speaking", pool: "practice", baseItemId: `${base}-step6`, content: {
      prompt: "Sin mirar el paso 2, escribe de memoria cómo A describe a su tía usando una cláusula de relativo.",
      expectedKeywords: ["who", "generous"],
    }, objectiveIds: ["obj-b1-4-1"] },
    { id: `act-${base}-7`, unitId, stepNumber: 7, stepName: "Producción", type: "production", skill: "writing", pool: "practice", baseItemId: `${base}-step7`, content: {
      prompt: "Describe a alguien que admiras usando una cláusula de relativo con 'who' y al menos un adjetivo de personalidad. Puedes grabarte o escribirlo.",
    }, objectiveIds: ["obj-b1-4-1", "obj-b1-4-4"] },
    { id: `act-${base}-8`, unitId, stepNumber: 8, stepName: "Tarea comunicativa", type: "communicative_task", skill: "speaking", pool: "practice", baseItemId: `${base}-step8`, content: {
      tutorLine: "Tell me about someone you really admire.",
      instructions: "Describe a esa persona usando una cláusula de relativo. Luego el sistema va a decir algo difícil de entender — pide que te lo repita, en inglés (decimoctava vez que practicas esto).",
      secondTutorLine: "Tht's rlly nce. Hw dd y mt thm?",
      expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
      expectedOriginKeywords: ["who", "that"],
      firstTaskLabel: "Describir a esa persona",
    }, objectiveIds: ["obj-b1-4-1", "obj-prea1-2-3"] },
    { id: `act-${base}-9`, unitId, stepNumber: 9, stepName: "Retroalimentación", type: "feedback", skill: "speaking", pool: "practice", baseItemId: `${base}-step9`, content: {}, objectiveIds: [] },
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

const ALL_UNITS: UnitDefinition[] = [
  PREA1_1_1,
  PREA1_2_1,
  A1_1_1,
  A1_1_2,
  A1_3_1,
  A1_4_1,
  A1_5_1,
  A2_1_1,
  A2_2_1,
  A2_3_1,
  A2_4_1,
  A2_5_1,
  B1_1_1,
  B1_2_1,
  B1_3_1,
  B1_4_1,
  B2_1_1,
  C1_1_1,
];

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
