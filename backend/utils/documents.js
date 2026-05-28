/** Parse required_documents text into checklist labels (bullet lines). */
function parseRequiredDocumentLabels(requiredDocuments) {
  if (!requiredDocuments) return [];
  return requiredDocuments
    .split('\n')
    .map((line) => line.replace(/^[•\-\d.]+\s*/, '').trim())
    .filter(Boolean);
}

function validateApplicationDocuments(requiredDocuments, uploadedDocuments) {
  const required = parseRequiredDocumentLabels(requiredDocuments);
  const uploaded = Array.isArray(uploadedDocuments) ? uploadedDocuments : [];
  const missing = [];

  if (required.length === 0) {
    if (uploaded.length === 0) {
      missing.push('ต้องแนบเอกสาร PDF อย่างน้อย 1 ไฟล์');
    }
    return { valid: uploaded.length > 0, missing, required };
  }

  for (const label of required) {
    const hasDoc = uploaded.some(
      (d) =>
        d.label === label ||
        (d.originalName && label.toLowerCase().includes(d.originalName.toLowerCase().slice(0, 8)))
    );
    if (!hasDoc) {
      missing.push(label);
    }
  }

  return { valid: missing.length === 0, missing, required };
}

module.exports = { parseRequiredDocumentLabels, validateApplicationDocuments };
