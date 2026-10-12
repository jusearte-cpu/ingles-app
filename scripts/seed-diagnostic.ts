/**
 * Banco de ítems del diagnóstico rápido — deliberadamente SEPARADO del banco
 * de práctica/evaluación de las unidades (ver docs/03-progress-and-evaluation-model.md,
 * sección 3: bancos separados). Es un conjunto acotado (A1-A2) porque, en esta
 * etapa, el currículo implementado todavía no cubre más niveles — un
 * diagnóstico real de Pre-A1 a C1 necesita las Etapas 3-5 primero. Esto es
 * intencional, no un descuido: no se simula cobertura que no existe.
 */
import { db } from "../src/db/client";
import { diagnosticItems } from "../src/db/schema";

const ITEMS = [
  {
    id: "diag-r1",
    skill: "reading",
    sortOrder: 1,
    content: {
      type: "reading_question",
      passage:
        "Hi! My name is Marta. I am a teacher. I live in Bogotá with my family. I like reading books and drinking coffee in the morning.",
      question: "¿A qué se dedica Marta? (responde en inglés)",
      expectedKeywords: ["teacher"],
    },
  },
  {
    id: "diag-r2",
    skill: "reading",
    sortOrder: 2,
    content: {
      type: "reading_question",
      passage:
        "The train to the airport leaves at 7:45 in the morning. Passengers should arrive 20 minutes before departure.",
      question: "¿A qué hora sale el tren? (responde en inglés)",
      expectedKeywords: ["7:45", "seven forty"],
    },
  },
  {
    id: "diag-l1",
    skill: "listening",
    sortOrder: 3,
    content: {
      type: "listening_question",
      dialogue: [
        { speaker: "A", text: "Excuse me, where is the nearest pharmacy?" },
        { speaker: "B", text: "Go straight and turn left at the bank. It's next to the supermarket." },
      ],
      question: "¿Dónde está la farmacia, según la conversación? (responde en inglés)",
      expectedKeywords: ["left", "bank", "supermarket"],
    },
  },
  {
    id: "diag-g1",
    skill: "grammar",
    sortOrder: 4,
    content: {
      type: "grammar_fill",
      template: "She ___ from Peru. (to be)",
      answer: "is",
    },
  },
  {
    id: "diag-g2",
    skill: "grammar",
    sortOrder: 5,
    content: {
      type: "grammar_fill",
      template: "They ___ coffee. (not like)",
      answer: "don't like",
    },
  },
  {
    id: "diag-v1",
    skill: "vocabulary",
    sortOrder: 6,
    content: {
      type: "vocabulary_question",
      prompt: "¿Cuál es el opuesto de 'big' en inglés?",
      expectedKeywords: ["small"],
    },
  },
  {
    id: "diag-w1",
    skill: "writing",
    sortOrder: 7,
    content: {
      type: "writing_prompt",
      prompt: "Escribe 2-3 frases en inglés sobre tu rutina diaria.",
      expectedKeywords: ["i"],
    },
  },
];

function seed() {
  for (const item of ITEMS) {
    db.insert(diagnosticItems)
      .values(item)
      .onConflictDoUpdate({ target: diagnosticItems.id, set: item })
      .run();
  }
  console.log(`Sembrados ${ITEMS.length} ítems de diagnóstico.`);
}

seed();
