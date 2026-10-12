/**
 * Calificadores deterministas y transparentes (reglas, no IA) para los pasos
 * de una unidad. Cada función es auditable: el usuario puede ver exactamente
 * por qué se marcó satisfactorio o no.
 */

export function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function keywordGrade(
  response: string,
  expectedKeywords: string[],
  minMatches: number = expectedKeywords.length,
): { satisfactory: boolean; matched: string[] } {
  const lower = normalize(response);
  const matched = expectedKeywords.filter((k) => lower.includes(k.toLowerCase()));
  return { satisfactory: matched.length >= minMatches, matched };
}

export function exactGrade(response: string, answer: string): boolean {
  return normalize(response) === normalize(answer);
}
