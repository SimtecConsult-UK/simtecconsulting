import { ALL_POLICIES, POLICY_CATEGORIES } from "./catalog";
import { POLICY_DOCS } from "./policies-content";
import type { PolicyDoc, PolicyEntry } from "./types";

export function getPolicy(slug: string): PolicyDoc | undefined {
  return POLICY_DOCS[slug];
}

export function getPolicySlugs(): string[] {
  return ALL_POLICIES.map((policy) => policy.slug);
}

export function getCategoryOf(slug: string) {
  return POLICY_CATEGORIES.find((category) =>
    category.policies.some((policy) => policy.slug === slug)
  );
}

/** Siblings for the "Other policies" card — same category first, per the handover. */
export function getSiblings(slug: string, limit = 4): PolicyEntry[] {
  const category = getCategoryOf(slug);
  const sameCategory = (category?.policies ?? []).filter(
    (policy) => policy.slug !== slug
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const rest = ALL_POLICIES.filter(
    (policy) =>
      policy.slug !== slug &&
      !sameCategory.some((sibling) => sibling.slug === policy.slug)
  );
  return [...sameCategory, ...rest].slice(0, limit);
}
