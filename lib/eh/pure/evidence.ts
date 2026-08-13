import type { EvidenceRule } from "../types";

/**
 * Exact-set / anyOf evidence grading. Plan §7.
 * For exact: selected must equal the single acceptable id.
 * For anyOf: selected must be one of the acceptable ids.
 */
export function gradeEvidence(
  rule: EvidenceRule,
  selected: string,
  acceptable: string[],
): boolean {
  if (rule === "exact") {
    return acceptable.length === 1 && selected === acceptable[0];
  }
  return acceptable.includes(selected);
}

/** Exact-set equality for multi-id claims (forged payloads). */
export function evidenceExactSetMatch(
  selected: readonly string[],
  required: readonly string[],
): boolean {
  if (selected.length !== required.length) return false;
  const a = [...selected].sort();
  const b = [...required].sort();
  return a.every((id, i) => id === b[i]);
}
