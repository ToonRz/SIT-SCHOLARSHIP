export function parseRequiredDocumentLabels(requiredDocuments) {
  if (!requiredDocuments) return [];
  return requiredDocuments
    .split('\n')
    .map((line) => line.replace(/^[•\-\d.]+\s*/, '').trim())
    .filter(Boolean);
}
