/**
 * Siembra la unidad de ejemplo completamente desarrollada en
 * docs/02-curriculum-matrix.md: A1 · Módulo 1 · Unidad 1 — "Nice to meet you".
 * Es idempotente: se puede correr varias veces sin duplicar filas.
 */
import { db } from "../src/db/client";
import { objectives, units, activities } from "../src/db/schema";

const OBJECTIVES = [
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
  {
    id: "obj-prea1-2-3",
    stableCode: "PreA1.2.3",
    skill: "speaking",
    canDoStatement:
      "Puedo pedir que me repitan algo que no entendí (reciclado de Pre-A1).",
    levelCode: "A1",
  },
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

const UNIT_ID = "unit-a1-1-1";

function seed() {
  for (const o of OBJECTIVES) {
    db.insert(objectives)
      .values(o)
      .onConflictDoUpdate({ target: objectives.id, set: o })
      .run();
  }

  const unitValues = {
    id: UNIT_ID,
    title: "Nice to meet you",
    moduleTitle: "Módulo 1 — Vida diaria mínima",
    levelCode: "A1",
    sortOrder: 1,
  };
  db.insert(units)
    .values(unitValues)
    .onConflictDoUpdate({ target: units.id, set: unitValues })
    .run();

  const acts = [
    {
      id: "act-1",
      unitId: UNIT_ID,
      stepNumber: 1,
      stepName: "Qué aprenderás",
      type: "info",
      skill: "speaking",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step1",
      content: {
        body:
          "Vas a poder presentarte, decir de dónde eres y preguntarle lo mismo a otra persona — y pedir que te repitan algo si no entiendes.",
      },
      objectiveIds: [],
    },
    {
      id: "act-2",
      unitId: UNIT_ID,
      stepNumber: 2,
      stepName: "Ejemplo resuelto",
      type: "worked_example",
      skill: "speaking",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step2",
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
      unitId: UNIT_ID,
      stepNumber: 3,
      stepName: "Escucha en contexto",
      type: "contextualized_input",
      skill: "listening",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step3",
      content: {
        dialogue: [
          { speaker: "A", text: "Hello, I'm Anna." },
          { speaker: "B", text: "Hi Anna, I'm Tom. Nice to meet you." },
          { speaker: "A", text: "Nice to meet you too. Where are you from, Tom?" },
          { speaker: "B", text: "I'm from Canada. What about you?" },
          { speaker: "A", text: "I'm from Mexico." },
        ],
        questions: [
          {
            id: "q1",
            prompt: "¿De dónde es Tom?",
            objectiveId: "obj-a1-1-4",
            expectedKeywords: ["canada"],
          },
          {
            id: "q2",
            prompt: "¿De dónde es Anna?",
            objectiveId: "obj-a1-1-4",
            expectedKeywords: ["mexico"],
          },
        ],
      },
      objectiveIds: ["obj-a1-1-4"],
    },
    {
      id: "act-4",
      unitId: UNIT_ID,
      stepNumber: 4,
      stepName: "Observa el lenguaje",
      type: "language_observation",
      skill: "grammar",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step4",
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
      unitId: UNIT_ID,
      stepNumber: 5,
      stepName: "Práctica guiada",
      type: "guided_practice",
      skill: "grammar",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step5",
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
      unitId: UNIT_ID,
      stepNumber: 6,
      stepName: "Recuperación sin apoyo",
      type: "unaided_retrieval",
      skill: "speaking",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step6",
      content: {
        prompt:
          "Sin mirar el diálogo del paso 2, escribe de memoria cómo Laura y Marco se presentan y dicen de dónde son.",
        expectedKeywords: ["i'm", "from", "nice to meet you"],
      },
      objectiveIds: ["obj-a1-1-1", "obj-a1-1-2"],
    },
    {
      id: "act-7",
      unitId: UNIT_ID,
      stepNumber: 7,
      stepName: "Producción",
      type: "production",
      skill: "writing",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step7",
      content: {
        prompt:
          "Preséntate: di tu nombre y de dónde eres, en 2-3 frases en inglés. Puedes grabarte en voz alta con el micrófono, o escribir tu respuesta.",
        expectedKeywords: ["i'm", "from"],
      },
      objectiveIds: ["obj-a1-1-1", "obj-a1-1-5"],
    },
    {
      id: "act-8",
      unitId: UNIT_ID,
      stepNumber: 8,
      stepName: "Tarea comunicativa",
      type: "communicative_task",
      skill: "speaking",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step8",
      content: {
        tutorLine: "Hi! I'm Priya. I'm from India. Where are you from?",
        instructions:
          "Responde a Priya diciendo de dónde eres. Luego, el sistema te hará una pregunta rápida que probablemente no vas a entender del todo — tu tarea es pedir que te la repita, en inglés.",
        secondTutorLine: "Cool! So, what do you do for a living these days?",
        expectedRepetitionKeywords: ["repeat", "sorry", "again", "can you say"],
        expectedOriginKeywords: ["i'm from"],
      },
      objectiveIds: ["obj-a1-1-2", "obj-prea1-2-3"],
    },
    {
      id: "act-9",
      unitId: UNIT_ID,
      stepNumber: 9,
      stepName: "Retroalimentación",
      type: "feedback",
      skill: "speaking",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step9",
      content: {},
      objectiveIds: [],
    },
    {
      id: "act-review",
      unitId: UNIT_ID,
      stepNumber: 99,
      stepName: "Repaso (no es un paso de la lección, no aparece en el stepper)",
      type: "spaced_review",
      skill: "mixed",
      pool: "practice",
      baseItemId: "unit-a1-1-1-review",
      content: {},
      objectiveIds: [
        "obj-a1-1-1",
        "obj-a1-1-2",
        "obj-prea1-2-3",
        "obj-a1-1-4",
        "obj-a1-1-5",
        "obj-a1-1-6",
      ],
    },
    {
      id: "act-10",
      unitId: UNIT_ID,
      stepNumber: 10,
      stepName: "Repaso posterior",
      type: "review_scheduling",
      skill: "speaking",
      pool: "practice",
      baseItemId: "unit-a1-1-1-step10",
      content: { intervalDays: 3 },
      objectiveIds: ["obj-a1-1-1", "obj-a1-1-2", "obj-prea1-2-3", "obj-a1-1-4", "obj-a1-1-5", "obj-a1-1-6"],
    },
  ];

  for (const a of acts) {
    db.insert(activities)
      .values(a)
      .onConflictDoUpdate({ target: activities.id, set: a })
      .run();
  }

  console.log(`Sembrado: ${OBJECTIVES.length} objetivos, 1 unidad, ${acts.length} actividades.`);
}

seed();
