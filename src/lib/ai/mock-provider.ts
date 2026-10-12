import type { LLMProvider, TutorFeedbackRequest, TutorFeedbackResult } from "./types";

/**
 * Proveedor de respaldo cuando no hay ANTHROPIC_API_KEY configurada.
 * Aplica reglas simples y transparentes — nunca pretende ser una evaluación
 * de IA real. Cumple la regla explícita del encargo: "nunca simules que una
 * respuesta fue analizada por IA".
 */
export class MockTutorProvider implements LLMProvider {
  readonly name = "mock-rules";
  readonly isMock = true;

  async giveFeedback(req: TutorFeedbackRequest): Promise<TutorFeedbackResult> {
    const text = req.learnerResponse.trim();
    const wordCount = text.length === 0 ? 0 : text.split(/\s+/).length;
    const taskFulfilled = wordCount >= 3;

    const meaningErrors: string[] = [];
    const formErrors: string[] = [];
    const styleSuggestions: string[] = [];

    if (wordCount === 0) {
      meaningErrors.push("No se recibió ninguna respuesta.");
    } else {
      if (!/\bI\b|\bmy\b|\bI'm\b/i.test(text)) {
        styleSuggestions.push(
          "Revisa si tu respuesta usa claramente la primera persona (I / my / I'm), como pide la tarea.",
        );
      }
      if (/\bi\s/.test(text) && !/\bI\s/.test(text)) {
        formErrors.push("El pronombre 'I' siempre se escribe en mayúscula en inglés.");
      }
      if (wordCount < 3) {
        meaningErrors.push(
          "La respuesta es muy corta para saber si cumpliste el objetivo comunicativo de esta tarea.",
        );
      }
    }

    return {
      isMock: true,
      provider: this.name,
      meaningErrors,
      formErrors,
      styleSuggestions,
      taskFulfilled,
      summary: taskFulfilled
        ? "Revisión automática por reglas (sin IA real): tu respuesta parece cumplir lo mínimo de la tarea. Esto NO es una evaluación lingüística completa."
        : "Revisión automática por reglas (sin IA real): la respuesta no alcanza a mostrar cumplimiento claro de la tarea.",
    };
  }
}
