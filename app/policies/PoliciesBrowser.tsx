"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { POLICY_CATEGORIES, POLICY_COUNT } from "../lib/legal/catalog";
import { ROUTES } from "../lib/sections";
import { ArrowIcon, SearchIcon } from "../components/legal/icons";

/** Handover screen 1c-index: browse and choose one of the policies. */
export function PoliciesBrowser() {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return POLICY_CATEGORIES.filter(
      (group) => category === null || group.id === category
    )
      .map((group) => ({
        ...group,
        policies: needle
          ? group.policies.filter((policy) =>
              policy.name.toLowerCase().includes(needle)
            )
          : group.policies,
      }))
      .filter((group) => group.policies.length > 0);
  }, [category, query]);

  return (
    <>
      <div className="lg-band">
        <div className="lg-band-inner">
          <div className="lg-crumbs">
            <Link href={ROUTES.home}>Home</Link>
            <span aria-hidden="true">/</span>
            <span className="lg-crumb-current">Policies</span>
          </div>

          <h1 className="lg-x-title">Policies</h1>

          <p className="lg-x-intro">
            The {POLICY_COUNT} documents below govern how Simtec operates. Each
            is reviewed annually, versioned, and available to download as a PDF.
          </p>

          <div className="lg-x-controls">
            <label className="lg-x-search">
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search policies"
                aria-label="Search policies"
              />
            </label>

            <div className="lg-x-chips">
              <button
                type="button"
                className={category === null ? "lg-x-chip is-active" : "lg-x-chip"}
                aria-pressed={category === null}
                onClick={() => setCategory(null)}
              >
                All {POLICY_COUNT}
              </button>
              {POLICY_CATEGORIES.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className={
                    category === group.id ? "lg-x-chip is-active" : "lg-x-chip"
                  }
                  aria-pressed={category === group.id}
                  onClick={() => setCategory(group.id)}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="lg-x-list">
        <div className="lg-x-groups">
          {groups.map((group) => (
            <section key={group.id} className="lg-x-group">
              <div className="lg-x-group-head">
                <div className="lg-x-group-title">
                  <h2>{group.label}</h2>
                  <div className="lg-x-rule" aria-hidden="true" />
                </div>
                <p className="lg-x-group-sub">{group.subtitle}</p>
              </div>

              <div className="lg-x-cards">
                {group.policies.map((policy) => (
                  <Link
                    key={policy.slug}
                    href={`/policies/${policy.slug}`}
                    className="lg-x-card"
                  >
                    <span>{policy.name}</span>
                    <ArrowIcon />
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {groups.length === 0 && (
            <div className="lg-x-empty">
              <strong>No policies match “{query.trim()}”.</strong>
              <p>
                Try a different word, or{" "}
                <button
                  type="button"
                  className="lg-x-reset"
                  onClick={() => {
                    setQuery("");
                    setCategory(null);
                  }}
                >
                  clear the filters
                </button>{" "}
                to see all {POLICY_COUNT} documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
