/**
 * Interfaces de adaptador — ver docs/01-architecture.md.
 * Cambiar de proveedor real (o de mock a real) implica escribir una clase
 * que cumpla esta interfaz, no tocar el resto de la app.
 */
export interface TutorFeedbackRequest {
  unitTitle: string;
  stepName: string;
  learnerResponse: string;
  objectiveStatements: string[];
}

export interface TutorFeedbackResult {
  /** true si esto NO fue generado por un modelo de IA real. */
  isMock: boolean;
  provider: string;
  meaningErrors: string[];
  formErrors: string[];
  styleSuggestions: string[];
  taskFulfilled: boolean;
  summary: string;
}

export interface LLMProvider {
  readonly name: string;
  readonly isMock: boolean;
  giveFeedback(req: TutorFeedbackRequest): Promise<TutorFeedbackResult>;
}
