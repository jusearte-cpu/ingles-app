import type { LLMProvider } from "./types";
import { MockTutorProvider } from "./mock-provider";

/**
 * Punto único de selección de proveedor. Hoy siempre resuelve al mock porque
 * no hay ANTHROPIC_API_KEY configurada (ver docs/decisions-log.md). Cuando
 * exista la clave, este archivo es el único lugar que cambia: se agrega un
 * AnthropicTutorProvider que implemente LLMProvider y se retorna aquí según
 * process.env.ANTHROPIC_API_KEY.
 */
export function getTutorProvider(): LLMProvider {
  return new MockTutorProvider();
}
